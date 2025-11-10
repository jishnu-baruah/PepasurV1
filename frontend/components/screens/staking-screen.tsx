"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import GifLoader from "@/components/common/gif-loader"
import RetroAnimation from "@/components/common/retro-animation"
import { useWallet, type InputTransactionData } from "@aptos-labs/wallet-adapter-react"
import { Aptos, AptosConfig, Network } from "@aptos-labs/ts-sdk"
import { smoothSendClient } from "@/lib/smoothsend"
import LobbySettingsDialog, { FullGameSettings, DEFAULT_GAME_SETTINGS } from "@/components/game/lobby-settings-dialog"
import FaucetButton from "@/components/wallet/faucet-button"

// Initialize Aptos client
const config = new AptosConfig({
  network: (process.env.NEXT_PUBLIC_APTOS_NETWORK || 'devnet') as Network
});
const aptos = new Aptos(config);

interface StakingScreenProps {
  gameId?: string // Optional for room creation
  playerAddress: string
  onStakeSuccess: (gameId?: string, roomCode?: string) => void
  onCancel: () => void
  mode: 'create' | 'join' // New prop to distinguish between creating and joining
  onBrowsePublicLobbies?: () => void // Optional handler to browse public lobbies
  initialRoomCode?: string // Pre-fill room code (e.g., from public lobbies)
}

interface StakingInfo {
  gameId: string
  roomCode: string
  players: string[]
  playersCount: number
  minPlayers: number
  totalStaked: string
  totalStakedInAPT: string
  status: string
  isReady: boolean
}

interface BalanceInfo {
  balance: string
  balanceInAPT: string
  sufficient: boolean
}

export default function StakingScreen({ gameId, playerAddress, onStakeSuccess, onCancel, mode, onBrowsePublicLobbies, initialRoomCode }: StakingScreenProps) {
  const [roomCode, setRoomCode] = useState(initialRoomCode || '')
  const [stakingInfo, setStakingInfo] = useState<StakingInfo | null>(null)
  const [isStaking, setIsStaking] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [createdRoomCode, setCreatedRoomCode] = useState<string | null>(null)
  const [createdGameId, setCreatedGameId] = useState<string | null>(null)
  const [joinGameId, setJoinGameId] = useState<string | null>(null)
  const [hasProcessedSuccess, setHasProcessedSuccess] = useState(false)
  const [balanceInfo, setBalanceInfo] = useState<BalanceInfo | null>(null)
  const [balanceLoading, setBalanceLoading] = useState(true)

  const [stakeAmountInput, setStakeAmountInput] = useState('0.001');
  const [isPublic, setIsPublic] = useState(false);
  const [gaslessMode, setGaslessMode] = useState(false); // Temporarily disable gasless
  const [gameSettings, setGameSettings] = useState<FullGameSettings>(DEFAULT_GAME_SETTINGS);
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);

  // Update room code when initialRoomCode changes (e.g., from public lobbies)
  useEffect(() => {
    if (initialRoomCode) {
      setRoomCode(initialRoomCode)
    }
  }, [initialRoomCode])

  // Validate and convert stake amount to Octas (1 APT = 100,000,000 Octas)
  const getValidatedStakeAmount = () => {
    const parsed = parseFloat(stakeAmountInput);
    if (isNaN(parsed) || parsed < 0.001) {
      return Math.floor(0.001 * 100000000); // Minimum 0.001 APT as integer
    }
    return Math.floor(parsed * 100000000); // Ensure integer for Move function
  };

  const stakeAmount = getValidatedStakeAmount();
  const stakeAmountInAPT = (stakeAmount / 100000000).toFixed(4);

  // Aptos wallet hooks
  const { account, connected, signAndSubmitTransaction, signTransaction } = useWallet()

  // Helper function to fetch balance
  const fetchBalance = async () => {
    if (!account?.address) {
      setBalanceLoading(false)
      return
    }

    try {
      setBalanceLoading(true)

      // SDK handles address parsing internally - just pass the string
      // Use getAccountAPTAmount - simpler and more reliable
      try {
        // SDK v1.39.0 expects object with accountAddress as string
        const balance = await aptos.getAccountAPTAmount({
          accountAddress: account.address.toString()
        });

        const balanceInAPT = (Number(balance) / 100000000).toFixed(4);
        console.log('💰 APT Balance:', balance, 'Octas =', balanceInAPT, 'APT');

        setBalanceInfo({
          balance: balance.toString(),
          balanceInAPT,
          sufficient: Number(balance) >= stakeAmount
        });
      } catch (error) {
        console.error('Error with getAccountAPTAmount:', error);

        // Fallback to getAccountResources
        console.log('⚠️ Trying getAccountResources fallback...');
        // SDK v1.39.0 expects object with accountAddress as string
        const resources = await aptos.getAccountResources({
          accountAddress: account.address.toString()
        });

        const aptosCoinResource = resources.find(
          (r) => r.type === "0x1::coin::CoinStore<0x1::aptos_coin::AptosCoin>"
        );

        if (aptosCoinResource) {
          const balance = (aptosCoinResource.data as any).coin.value;
          const balanceInAPT = (Number(balance) / 100000000).toFixed(4);

          console.log('💰 APT Balance (Resources):', balance, 'Octas =', balanceInAPT, 'APT');

          setBalanceInfo({
            balance: balance.toString(),
            balanceInAPT,
            sufficient: Number(balance) >= stakeAmount
          });
        } else {
          setBalanceInfo({
            balance: "0",
            balanceInAPT: "0.0000",
            sufficient: false
          });
        }
      }
    } catch (error) {
      console.error('Error fetching balance:', error);
      setBalanceInfo({
        balance: "0",
        balanceInAPT: "0.0000",
        sufficient: false
      });
    } finally {
      setBalanceLoading(false)
    }
  }

  // Helper function to convert gameId to proper format for Move function
  const convertGameIdForMove = (gameId: string | number): number => {
    if (typeof gameId === 'number') {
      return gameId
    }

    if (typeof gameId === 'string') {
      // If it's a string number, convert to number
      if (/^\d+$/.test(gameId)) {
        return parseInt(gameId, 10)
      }
      // If it's a hex string, convert to number
      else if (gameId.startsWith('0x')) {
        return parseInt(gameId, 16)
      }
    }

    throw new Error(`Invalid gameId format: ${gameId}`)
  }

  // Helper function to execute gasless transaction
  const executeGaslessTransaction = async (contractGameId: string) => {
    if (!account?.address || !signTransaction) {
      throw new Error('Wallet not properly connected for gasless transactions')
    }

    console.log('🌟 [Gasless] Testnet: Using simple transfer with fee payer...')
    console.log('🌟 [Gasless] Contract Game ID:', contractGameId, typeof contractGameId)

    try {

      // Step 1: Initialize Aptos SDK with TESTNET (critical!)
      const { Aptos: AptosSDK, AptosConfig, Network: AptosNetwork } = await import('@aptos-labs/ts-sdk')
      const aptosConfig = new AptosConfig({ network: AptosNetwork.TESTNET })
      const aptosClient = new AptosSDK(aptosConfig)

      console.log('🌟 [Gasless] Building transaction with withFeePayer flag...')

      // Convert contractGameId to proper format for Move function
      const gameIdArg = convertGameIdForMove(contractGameId)
      console.log('🌟 [Gasless] Using game ID argument:', gameIdArg, typeof gameIdArg)

      // Step 2: Build transaction with withFeePayer flag (testnet gasless mode)
      const rawTransaction = await aptosClient.transaction.build.simple({
        sender: account.address,
        withFeePayer: true, // Critical: This enables gasless transactions
        data: {
          function: `${process.env.NEXT_PUBLIC_PEPASUR_CONTRACT_ADDRESS}::pepasur::join_game`,
          functionArguments: [gameIdArg],
        }
      })

      console.log('🌟 [Gasless] Signing transaction...')

      // Step 3: Sign the transaction
      const signResponse = await signTransaction({ transactionOrPayload: rawTransaction })

      if (!signResponse || !signResponse.authenticator) {
        throw new Error('Failed to sign transaction')
      }

      console.log('🌟 [Gasless] Serializing and submitting to relayer...')

      // Step 4: Serialize and submit to SmoothSend
      const transactionBytes = rawTransaction.bcsToBytes()
      const authenticatorBytes = signResponse.authenticator.bcsToBytes()

      const submitResponse = await smoothSendClient.submitSignedTransaction(
        Array.from(transactionBytes),
        Array.from(authenticatorBytes)
      )

      if (!submitResponse.success) {
        throw new Error(submitResponse.message || 'Gasless transaction failed')
      }

      const txHash = submitResponse.txnHash || submitResponse.hash
      if (!txHash) {
        throw new Error('No transaction hash returned')
      }

      console.log('🌟 [Gasless] ✅ Testnet transaction successful!', submitResponse)
      return txHash

    } catch (error) {
      console.error('🌟 [Gasless] ❌ Transaction failed:', error)
      console.error('🌟 [Gasless] Error details:', {
        contractGameId,
        accountAddress: account.address,
        error: error.message
      })
      throw error
    }
  }

  // Fetch account balance
  useEffect(() => {
    fetchBalance()
  }, [account?.address])

  const handleStakeSuccess = async (transactionHash: string, gameId?: string, roomCodeParam?: string) => {
    try {
      console.log('🎯 handleStakeSuccess called:', { transactionHash, mode, gameId, roomCodeParam })
      console.log('✅ Contract staking successful!')
      console.log('Transaction hash:', transactionHash)

      // Record the stake in the backend
      const gameIdToRecord = gameId || (mode === 'create' ? createdGameId : joinGameId)
      if (gameIdToRecord) {
        try {
          const requestBody = {
            gameId: gameIdToRecord,
            playerAddress: playerAddress,
            transactionHash: transactionHash
          };
          console.log('📤 Sending record-stake request:', {
            ...requestBody,
            playerAddressType: typeof playerAddress,
            playerAddressValue: playerAddress
          });

          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/game/record-stake`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody),
          })

          console.log('📥 Record-stake response status:', response.status);
          if (!response.ok) {
            const errorBody = await response.json().catch(() => ({ message: 'Unknown error' }));
            throw new Error(`Backend error: ${errorBody.error || errorBody.message || 'Failed to record stake'}`);
          }
          const result = await response.json()
          console.log('📥 Record-stake response body:', result);

          if (result.success) {
            console.log('✅ Stake recorded in backend:', result)

            // Navigate ONLY after successful recording to ensure player is added to game
            if (mode === 'create') {
              const finalGameId = gameId || createdGameId
              const finalRoomCode = roomCodeParam || createdRoomCode
              console.log('🎯 Create mode - calling onStakeSuccess with:', { finalGameId, finalRoomCode })
              onStakeSuccess(finalGameId || undefined, finalRoomCode || undefined)
            } else {
              // Use parameter values first, fall back to state if not provided
              const finalGameId = gameId || joinGameId
              const finalRoomCode = roomCodeParam || roomCode
              console.log('🎯 Join mode - calling onStakeSuccess with:', { finalGameId, finalRoomCode })
              onStakeSuccess(finalGameId || undefined, finalRoomCode)
            }
          } else {
            console.error('❌ Failed to record stake:', result)
            setError('Stake successful but failed to join game. Please contact support.')
            setIsStaking(false)
          }
        } catch (error) {
          console.error('❌ Error recording stake:', error)
          setError('Stake successful but failed to join game. Please contact support.')
          setIsStaking(false)
        }
      } else {
        // No gameId to record - this shouldn't happen but handle gracefully
        console.error('❌ No gameId available to record stake')
        setError('Failed to join game. Please try again.')
        setIsStaking(false)
      }
    } catch (error) {
      console.error('❌ Error handling stake success:', error)
      setError('Staking successful but failed to proceed. Please try again.')
      setIsStaking(false)
    }
  }

  const handleStake = async () => {
    if (mode === 'create' && parseFloat(stakeAmountInput) < 0.001) {
      setError('Stake amount must be at least 0.001 APT');
      return;
    }

    // For joining mode, require room code
    if (mode === 'join' && !roomCode.trim()) {
      setError('Please enter a room code')
      return
    }

    if (!balanceInfo?.sufficient) {
      setError('Insufficient balance. You need at least 0.001 APT to stake.')
      return
    }

    if (!account?.address) {
      setError('Wallet not connected')
      return
    }

    try {
      setIsStaking(true)
      setError('')

      if (mode === 'create') {
        // For room creation: use backend to create and join in one transaction
        console.log('🎮 Creating room with staking...')
        console.log('Contract:', process.env.NEXT_PUBLIC_PEPASUR_CONTRACT_ADDRESS)
        console.log('Stake Amount:', stakeAmount)

        // Call backend to handle create-and-join atomically
        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/game/create-and-join`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              creatorAddress: playerAddress,
              stakeAmount: stakeAmount, // Use the state variable here
              minPlayers: 4, // Use default minPlayers (not customizable)
              isPublic: isPublic,
              settings: gameSettings // Pass custom game settings (phase durations only)
            }),
          })

          const result = await response.json()
          if (result.success) {
            console.log('✅ Backend created room:', result)
            // Store the room code and gameId for later use
            setCreatedRoomCode(result.roomCode)
            setCreatedGameId(result.gameId)

            // Now stake from user's wallet to join the game
            console.log('💰 User staking to join created game:', result.contractGameId)

            let txHash: string

            if (gaslessMode) {
              // Use gasless transaction
              console.log('🌟 Using gasless mode for create')
              txHash = await executeGaslessTransaction(result.contractGameId)
              // Wait for confirmation
              await aptos.waitForTransaction({ transactionHash: txHash })
              console.log('✅ Gasless transaction confirmed:', txHash)
              setHasProcessedSuccess(true)
              handleStakeSuccess(txHash, result.gameId, result.roomCode)
            } else {
              // Use normal transaction
              const contractAddress = process.env.NEXT_PUBLIC_PEPASUR_CONTRACT_ADDRESS || '0x9ce89cb58b06ea8f9ddf28093c8f40dd6b7129a8404f47040f0a7e78786fab38'
              console.log('🔧 Contract address:', contractAddress)
              console.log('🔧 Raw contractGameId:', result.contractGameId, typeof result.contractGameId)

              const gameIdArg = convertGameIdForMove(result.contractGameId)
              console.log('🔧 Converted gameIdArg:', gameIdArg, typeof gameIdArg)

              if (!contractAddress) {
                throw new Error('Contract address not configured')
              }

              const transaction: InputTransactionData = {
                data: {
                  function: `${contractAddress}::pepasur::join_game`,
                  functionArguments: [gameIdArg],
                },
              }

              console.log('🔧 Transaction data:', transaction.data)

              const txResponse = await signAndSubmitTransaction(transaction)

              // Wait for transaction confirmation
              try {
                await aptos.waitForTransaction({ transactionHash: txResponse.hash })
                console.log('✅ Transaction confirmed:', txResponse.hash)
                setHasProcessedSuccess(true)
                // Pass gameId and roomCode directly from result
                handleStakeSuccess(txResponse.hash, result.gameId, result.roomCode)
              } catch (error) {
                console.error('❌ Transaction failed:', error)
                setError('Transaction failed. Please try again.')
                setIsStaking(false)
              }
            }
          } else {
            console.error('❌ Backend create failed:', result.error)
            setError(`Failed to create room: ${result.error}`)
            setIsStaking(false)
          }
        } catch (error) {
          console.error('❌ Error calling backend:', error)
          setError(`Failed to create room: ${error instanceof Error ? error.message : 'Unknown error'}`)
          setIsStaking(false)
        }
      } else {
        // For joining: first get gameId from room code, then stake
        console.log('🎮 Joining room with staking...')
        console.log('Contract:', process.env.NEXT_PUBLIC_PEPASUR_CONTRACT_ADDRESS)
        console.log('Room Code:', roomCode)
        console.log('Stake Amount:', stakeAmount)

        if (!gameId) {
          // First, get the gameId from the room code via backend
          console.log('🔍 Getting gameId from room code...')
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/game/room/${roomCode}`)
          const result = await response.json()

          if (!result.success) {
            throw new Error('Room code not found')
          }

          const gameData = result.game
          console.log('✅ Found game:', gameData)

          // Store the game manager's gameId for later use
          setJoinGameId(gameData.gameId)

          // Now stake to join the game
          console.log('💰 Staking to join game:', gameData.contractGameId)

          let txHash: string

          if (gaslessMode) {
            // Use gasless transaction
            console.log('🌟 Using gasless mode for join')
            txHash = await executeGaslessTransaction(gameData.contractGameId)
            // Wait for confirmation
            await aptos.waitForTransaction({ transactionHash: txHash })
            console.log('✅ Gasless transaction confirmed:', txHash)
            setHasProcessedSuccess(true)
            handleStakeSuccess(txHash, gameData.gameId, gameData.roomCode)
          } else {
            // Use normal transaction
            const contractAddress = process.env.NEXT_PUBLIC_PEPASUR_CONTRACT_ADDRESS || '0x9ce89cb58b06ea8f9ddf28093c8f40dd6b7129a8404f47040f0a7e78786fab38'
            console.log('🔧 Contract address:', contractAddress)
            console.log('🔧 Raw contractGameId:', gameData.contractGameId, typeof gameData.contractGameId)

            const gameIdArg = convertGameIdForMove(gameData.contractGameId)
            console.log('🔧 Converted gameIdArg:', gameIdArg, typeof gameIdArg)

            if (!contractAddress) {
              throw new Error('Contract address not configured')
            }

            const transaction: InputTransactionData = {
              data: {
                function: `${contractAddress}::pepasur::join_game`,
                functionArguments: [gameIdArg],
              },
            }

            console.log('🔧 Transaction data:', transaction.data)

            const txResponse = await signAndSubmitTransaction(transaction)

            // Wait for transaction confirmation
            try {
              await aptos.waitForTransaction({ transactionHash: txResponse.hash })
              console.log('✅ Transaction confirmed:', txResponse.hash)
              setHasProcessedSuccess(true)
              // Pass gameId directly instead of relying on state (which updates async)
              handleStakeSuccess(txResponse.hash, gameData.gameId, gameData.roomCode)
            } catch (error) {
              console.error('❌ Transaction failed:', error)
              setError('Transaction failed. Please try again.')
              setIsStaking(false)
            }
          }
        } else {
          // We already have gameId, just stake
          console.log('💰 Staking to join game:', gameId)

          let txHash: string

          if (gaslessMode) {
            // Use gasless transaction
            console.log('🌟 Using gasless mode for join with existing gameId')
            txHash = await executeGaslessTransaction(gameId)
            // Wait for confirmation
            await aptos.waitForTransaction({ transactionHash: txHash })
            console.log('✅ Gasless transaction confirmed:', txHash)
            setHasProcessedSuccess(true)
            handleStakeSuccess(txHash, gameId)
          } else {
            // Use normal transaction
            const contractAddress = process.env.NEXT_PUBLIC_PEPASUR_CONTRACT_ADDRESS || '0x9ce89cb58b06ea8f9ddf28093c8f40dd6b7129a8404f47040f0a7e78786fab38'
            console.log('🔧 Contract address:', contractAddress)
            console.log('🔧 Raw gameId:', gameId, typeof gameId)

            const gameIdArg = convertGameIdForMove(gameId)
            console.log('🔧 Converted gameIdArg:', gameIdArg, typeof gameIdArg)

            if (!contractAddress) {
              throw new Error('Contract address not configured')
            }

            const transaction: InputTransactionData = {
              data: {
                function: `${contractAddress}::pepasur::join_game`,
                functionArguments: [gameIdArg],
              },
            }

            console.log('🔧 Transaction data:', transaction.data)

            const txResponse = await signAndSubmitTransaction(transaction)

            // Wait for transaction confirmation
            try {
              await aptos.waitForTransaction({ transactionHash: txResponse.hash })
              console.log('✅ Transaction confirmed:', txResponse.hash)
              setHasProcessedSuccess(true)
              // Pass gameId directly (roomCode will be from state)
              handleStakeSuccess(txResponse.hash, gameId)
            } catch (error) {
              console.error('❌ Transaction failed:', error)
              setError('Transaction failed. Please try again.')
              setIsStaking(false)
            }
          }
        }
      }

    } catch (error) {
      console.error('Error staking:', error)
      setError(`Failed to stake: ${error instanceof Error ? error.message : 'Unknown error'}`)
      setIsStaking(false)
    }
  }

  const getStakingStatusColor = (status: string) => {
    switch (status) {
      case 'waiting': return 'text-yellow-400'
      case 'full': return 'text-green-400'
      case 'started': return 'text-blue-400'
      case 'completed': return 'text-purple-400'
      default: return 'text-gray-400'
    }
  }

  const getStakingStatusText = (status: string) => {
    switch (status) {
      case 'waiting': return 'WAITING FOR PLAYERS'
      case 'full': return 'READY TO START'
      case 'started': return 'GAME STARTED'
      case 'completed': return 'GAME COMPLETED'
      default: return 'UNKNOWN'
    }
  }

  if (balanceLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 gaming-bg scanlines">
        <Card className="w-full max-w-md p-8 bg-[#111111]/80 border border-[#2a2a2a] text-center">
          <div className="space-y-4">
            <div className="text-lg font-press-start pixel-text-3d-white">CHECKING BALANCE...</div>
            <div className="flex justify-center">
              <GifLoader size="lg" />
            </div>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-2 sm:p-4 gaming-bg scanlines">
      <Card className="w-[90vw] max-w-[480px] p-3 sm:p-4 lg:p-6 bg-[#111111]/80 border border-[#2a2a2a]">
        <div className="space-y-3 sm:space-y-4 lg:space-y-6">
          {/* Header */}
          <div className="text-center space-y-1 sm:space-y-2">
            <RetroAnimation type="bounce">
              <div className="text-2xl sm:text-3xl lg:text-4xl">💰</div>
            </RetroAnimation>
            <div className="text-lg sm:text-xl font-bold font-press-start pixel-text-3d-white">
              STAKE TO PLAY
            </div>

          </div>

          {/* Balance and Network Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
            {/* Balance Info */}
            {balanceInfo && (
              <div className="p-2 sm:p-3 lg:p-4 bg-[#1a1a1a]/50 border border-[#333333] rounded-lg">
                <div className="space-y-1 sm:space-y-2">
                  <div className="text-xs sm:text-sm font-press-start text-gray-300">YOUR BALANCE</div>
                  <div className="text-base sm:text-lg font-bold text-white break-all">
                    {balanceInfo.balanceInAPT} APT
                  </div>
                  <div className={`text-xs sm:text-sm font-press-start ${balanceInfo.sufficient ? 'text-green-400' : 'text-red-400'}`}>
                    {balanceInfo.sufficient ? '✅ SUFFICIENT' : '❌ INSUFFICIENT'}
                  </div>
                </div>
              </div>
            )}

            {/* Network Info */}
            <div className="p-2 sm:p-3 lg:p-4 bg-[#1a1a1a]/50 border border-[#333333] rounded-lg">
              <div className="space-y-1 sm:space-y-2">
                <div className="text-xs sm:text-sm font-press-start text-gray-300">NETWORK</div>
                <div className="text-base sm:text-lg font-bold text-white break-words">
                  {connected ? '✅ Aptos Testnet' : '❌ Not Connected'}
                </div>
                {!connected && (
                  <div className="text-xs sm:text-sm text-yellow-400 break-words">
                    Please connect your Aptos wallet
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Faucet Button */}
          <div className="flex justify-center">
            <FaucetButton
              walletAddress={playerAddress || null}
              onSuccess={async () => {
                console.log('✅ Faucet claim successful! Refreshing balance...')
                // Wait a bit for blockchain confirmation
                setTimeout(() => {
                  fetchBalance()
                }, 2000)
              }}
            />
          </div>

          <div className="border-t border-border my-4"></div>

          {/* Public/Private Toggle and Settings - Only show for create mode */}
          {mode === 'create' && (
            <>
              <Card className="p-2 sm:p-3 bg-[#1a1a1a]/50 border border-[#333333]">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs sm:text-sm font-press-start text-gray-300">ROOM VISIBILITY</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {isPublic ? 'Anyone can see and join' : 'Only with room code'}
                    </div>
                  </div>
                  <Button
                    onClick={() => setIsPublic(!isPublic)}
                    variant={isPublic ? 'pixel' : 'outline'}
                    size="pixel"
                    className="text-xs"
                  >
                    {isPublic ? '🌐 PUBLIC' : '🔒 PRIVATE'}
                  </Button>
                </div>
              </Card>

              {/* Game Settings Button */}
              <Card className="p-2 sm:p-3 bg-[#1a1a1a]/50 border border-[#333333]">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs sm:text-sm font-press-start text-gray-300">GAME SETTINGS</div>
                    <div className="text-xs text-gray-500 mt-1">
                      Configure phase times and player count
                    </div>
                  </div>
                  <Button
                    onClick={() => setShowSettingsDialog(true)}
                    variant="outline"
                    size="pixel"
                    className="text-xs"
                  >
                    ⚙️ CONFIGURE
                  </Button>
                </div>
              </Card>
            </>
          )}

          {/* Gasless Mode Toggle */}
          <Card className="p-2 sm:p-3 bg-[#1a1a1a]/50 border border-[#333333]">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs sm:text-sm font-press-start text-gray-300">GAS FEES</div>
                <div className="text-xs text-gray-500 mt-1">
                  {gaslessMode ? '✨ FREE - No gas fees!' : '⛽ Pay small gas fee'}
                </div>
              </div>
              <Button
                onClick={() => setGaslessMode(!gaslessMode)}
                variant={gaslessMode ? 'pixel' : 'outline'}
                size="pixel"
                className="text-xs"
              >
                {gaslessMode ? '✨ GASLESS' : '⛽ NORMAL'}
              </Button>
            </div>
          </Card>

          {/* Stake Amount Input - Only show for create mode */}
          {mode === 'create' && (
            <div className="space-y-1 sm:space-y-2">
              <Label htmlFor="stakeAmount" className="text-xs sm:text-sm font-press-start text-gray-300">
                STAKE AMOUNT (APT)
              </Label>
              <Input
                id="stakeAmount"
                type="number"
                value={stakeAmountInput}
                onChange={(e) => {
                  const value = e.target.value;
                  // Allow empty string for editing
                  if (value === '') {
                    setStakeAmountInput('');
                    return;
                  }
                  // Prevent negative numbers
                  const num = parseFloat(value);
                  if (num < 0) {
                    setStakeAmountInput('0.001');
                    return;
                  }
                  setStakeAmountInput(value);
                }}
                onBlur={() => {
                  // Enforce minimum on blur
                  const num = parseFloat(stakeAmountInput);
                  if (isNaN(num) || num < 0.001) {
                    setStakeAmountInput('0.001');
                  }
                }}
                placeholder="Enter stake amount"
                min="0.001"
                step="0.001"
                className="font-press-start text-center text-sm sm:text-lg tracking-widest"
              />

            </div>
          )}

          {/* Join mode UI */}
          {mode === 'join' && (
            <>
              {/* Group 1: Join with Room Code */}
              <div className="space-y-2 p-4 border border-border rounded-lg">
                <Input
                  id="roomCode"
                  type="text"
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                  placeholder="Enter 6-char room code"
                  maxLength={6}
                  className="w-full font-press-start text-left text-lg tracking-widest p-4 bg-black/50 border-2 border-border focus:border-primary focus:ring-primary"
                />
                <Button
                  onClick={handleStake}
                  disabled={isStaking || !connected || !balanceInfo?.sufficient || roomCode.length !== 6}
                  variant="pixel"
                  size="pixelLarge"
                  className="w-full"
                >
                  {isStaking ? (
                    <div className="flex items-center justify-center gap-2">
                      <GifLoader size="sm" />
                      <span>STAKING...</span>
                    </div>
                  ) : (
                    `💰 Stake to join `
                  )}
                </Button>
              </div>

              {/* Separator */}
              <div className="flex items-center">
                <div className="flex-grow border-t border-border"></div>
                <span className="flex-shrink mx-4 text-xs text-gray-500">OR</span>
                <div className="flex-grow border-t border-border"></div>
              </div>

              {/* Group 2: Browse Public Lobbies */}
              {onBrowsePublicLobbies && (
                <div>
                  <Button
                    onClick={onBrowsePublicLobbies}
                    variant="outline"
                    size="pixelLarge"
                    className="w-full"
                  >
                    🌐 BROWSE PUBLIC LOBBIES
                  </Button>
                </div>
              )}
            </>
          )}

          {/* Error Message */}
          {error && (
            <Card className="p-2 sm:p-3 bg-red-900/20 border border-red-500/50">
              <div className="text-xs sm:text-sm text-red-400 font-press-start">
                ❌ {error}
              </div>
            </Card>
          )}

          {/* Staking Info */}
          {stakingInfo && (
            <Card className="p-2 sm:p-3 lg:p-4 bg-[#1a1a1a]/50 border border-[#333333]">
              <div className="space-y-1 sm:space-y-2">
                <div className="text-xs sm:text-sm font-press-start text-gray-300">GAME STATUS</div>
                <div className={`text-base sm:text-lg font-bold font-press-start ${getStakingStatusColor(stakingInfo.status)}`}>
                  {getStakingStatusText(stakingInfo.status)}
                </div>
                <div className="text-xs sm:text-sm text-gray-400">
                  Players: {stakingInfo.playersCount}/{stakingInfo.minPlayers}
                </div>
                <div className="text-xs sm:text-sm text-gray-400">
                  Total Staked: {stakingInfo.totalStakedInAPT} APT
                </div>
              </div>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="space-y-2 sm:space-y-3">
            {mode === 'create' && (
              <Button
                onClick={handleStake}
                disabled={isStaking || !connected || !balanceInfo?.sufficient}
                variant="pixel"
                size="pixelLarge"
                className="w-full"
              >
                {isStaking ? (
                  <div className="flex items-center justify-center gap-2">
                    <GifLoader size="sm" />
                    <span>STAKING...</span>
                  </div>
                ) : (
                  `🎮 STAKE ${stakeAmountInAPT} APT`
                )}
              </Button>
            )}

            <Button
              onClick={onCancel}
              variant="outline"
              size="pixelLarge"
              className="w-full"
            >
              CANCEL
            </Button>
          </div>

          {/* Info */}
          <div className="text-xs text-gray-500 text-center space-y-0.5 sm:space-y-1">
            <div>• Minimum stake: 0.001 APT</div>
            <div>• Winners get 98% of total pool</div>
            <div>• Losers get 0% of total pool</div>
            <div>• 2% house cut applies</div>
          </div>
        </div>

        {/* Settings Dialog */}
        <LobbySettingsDialog
          open={showSettingsDialog}
          onOpenChange={setShowSettingsDialog}
          settings={gameSettings}
          onSettingsChange={setGameSettings}
          onSave={() => {
            console.log('Game settings updated:', gameSettings);
          }}
        />
      </Card>
    </div>
  )
}
