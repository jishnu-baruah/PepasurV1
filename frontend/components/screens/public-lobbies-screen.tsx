"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import GifLoader from "@/components/common/gif-loader"
import RetroAnimation from "@/components/common/retro-animation"
import { truncateAddress, formatAPT, calculateWinProbabilities } from "@/utils/winProbability"
import { useWallet, type InputTransactionData } from "@aptos-labs/wallet-adapter-react"
import { Aptos, AptosConfig, Network } from "@aptos-labs/ts-sdk"
import { smoothSendClient } from "@/lib/smoothsend"
import FaucetButton from "@/components/wallet/faucet-button"

// Initialize Aptos client
const config = new AptosConfig({
  network: (process.env.NEXT_PUBLIC_APTOS_NETWORK || 'devnet') as Network
});
const aptos = new Aptos(config);

interface PublicLobby {
  gameId: string
  roomCode: string
  creator: string
  creatorName?: string
  stakeAmount: number
  minPlayers: number
  maxPlayers: number
  playerCount: number
  currentPlayers: string[]
  mafiaWinPercent: number
  nonMafiaWinPercent: number
  createdAt: string
}

interface PublicLobbiesScreenProps {
  onJoinLobby: (gameId: string, roomCode: string) => void
  onBack: () => void
  onCreateLobby?: () => void
  playerAddress: string
}

export default function PublicLobbiesScreen({ onJoinLobby, onBack, onCreateLobby, playerAddress }: PublicLobbiesScreenProps) {
  const [lobbies, setLobbies] = useState<PublicLobby[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [error, setError] = useState('')
  const [sortBy, setSortBy] = useState<'newest' | 'stake' | 'players'>('newest')

  // Helper function to recalculate win probabilities on render (ensures fresh data)
  const getWinProbabilities = (lobby: PublicLobby) => {
    return calculateWinProbabilities(lobby.stakeAmount, lobby.minPlayers, lobby.minPlayers)
  }

  // Helper function to calculate max possible earnings in APT
  const calculateMaxEarnings = (stakeAmount: number, winPercent: number): string => {
    const earningOctas = stakeAmount * (winPercent / 100)
    return formatAPT(earningOctas)
  }

  // Staking modal state
  const [showStakingModal, setShowStakingModal] = useState(false)
  const [selectedLobby, setSelectedLobby] = useState<PublicLobby | null>(null)
  const [isStaking, setIsStaking] = useState(false)
  const [stakingError, setStakingError] = useState('')
  const [balance, setBalance] = useState<number>(0)
  const [balanceLoading, setBalanceLoading] = useState(true)
  const [gaslessMode, setGaslessMode] = useState(true) // Default to gasless on testnet

  // Wallet hooks
  const { account, signAndSubmitTransaction, signTransaction } = useWallet()

  // Fetch public lobbies
  const fetchLobbies = async (isInitial = false) => {
    try {
      if (isInitial) {
        setIsLoading(true)
      } else {
        setIsRefreshing(true)
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/game/public/lobbies`)
      const data = await response.json()

      if (data.success) {
        // Calculate win percentages for each lobby based on minPlayers (when game starts)
        const lobbiesWithPercentages = data.lobbies.map((lobby: PublicLobby) => {
          const winProbs = calculateWinProbabilities(lobby.stakeAmount, lobby.minPlayers, lobby.minPlayers)
          return {
            ...lobby,
            mafiaWinPercent: winProbs.mafiaWinPercent,
            nonMafiaWinPercent: winProbs.nonMafiaWinPercent
          }
        })
        setLobbies(lobbiesWithPercentages)
        setError('')
      } else {
        setError('Failed to load lobbies')
      }
    } catch (err) {
      console.error('Error fetching lobbies:', err)
      if (isInitial) {
        setError('Failed to connect to server')
      }
      // Don't show error on background refresh
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  // Initial fetch and periodic refresh
  useEffect(() => {
    fetchLobbies(true) // Initial load with loading screen
    const interval = setInterval(() => fetchLobbies(false), 5000) // Background refresh without loading screen
    return () => clearInterval(interval)
  }, [])

  // Fetch wallet balance
  useEffect(() => {
    const fetchBalance = async () => {
      if (!account?.address) {
        setBalanceLoading(false)
        return
      }

      try {
        setBalanceLoading(true)
        const balanceOctas = await aptos.getAccountAPTAmount({
          accountAddress: account.address.toString()
        })
        setBalance(Number(balanceOctas))
      } catch (error) {
        console.error('Error fetching balance:', error)
        setBalance(0)
      } finally {
        setBalanceLoading(false)
      }
    }

    fetchBalance()
  }, [account?.address])

  // Helper function to execute gasless transaction
  const executeGaslessTransaction = async (contractGameId: string) => {
    if (!account?.address || !signTransaction) {
      throw new Error('Wallet not properly connected for gasless transactions')
    }

    console.log('🌟 [Gasless] Testnet: Using simple transfer with fee payer...')

    // Step 1: Initialize Aptos SDK with TESTNET (critical!)
    const { Aptos: AptosSDK, AptosConfig, Network: AptosNetwork } = await import('@aptos-labs/ts-sdk')
    const aptosConfig = new AptosConfig({ network: AptosNetwork.TESTNET })
    const aptosClient = new AptosSDK(aptosConfig)

    console.log('🌟 [Gasless] Building transaction with withFeePayer flag...')

    // Step 2: Build transaction with withFeePayer flag (testnet gasless mode)
    const rawTransaction = await aptosClient.transaction.build.simple({
      sender: account.address,
      withFeePayer: true, // Critical: This enables gasless transactions
      data: {
        function: `${process.env.NEXT_PUBLIC_PEPASUR_CONTRACT_ADDRESS}::pepasur::join_game`,
        functionArguments: [contractGameId],
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
  }

  // Handle join lobby click
  const handleJoinClick = (lobby: PublicLobby) => {
    setSelectedLobby(lobby)
    setShowStakingModal(true)
    setStakingError('')
  }

  // Handle stake and join
  const handleStakeAndJoin = async () => {
    if (!selectedLobby || !account?.address) return

    const stakeAmountOctas = selectedLobby.stakeAmount

    // Check balance
    if (balance < stakeAmountOctas) {
      setStakingError(`Insufficient balance. You need ${formatAPT(stakeAmountOctas)} APT`)
      return
    }

    try {
      setIsStaking(true)
      setStakingError('')

      // Get game data from backend
      console.log('🔍 Getting game data for room:', selectedLobby.roomCode)
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/game/room/${selectedLobby.roomCode}`)
      const result = await response.json()

      if (!result.success) {
        throw new Error('Room code not found')
      }

      const gameData = result.game
      console.log('✅ Found game:', gameData)

      // Submit staking transaction
      console.log('💰 Staking to join game:', gameData.contractGameId)

      let txHash: string

      if (gaslessMode) {
        // Use gasless transaction
        txHash = await executeGaslessTransaction(gameData.contractGameId)
        // Wait for confirmation
        await aptos.waitForTransaction({ transactionHash: txHash })
        console.log('✅ Gasless transaction confirmed:', txHash)
      } else {
        // Use normal transaction
        const transaction: InputTransactionData = {
          data: {
            function: `${process.env.NEXT_PUBLIC_PEPASUR_CONTRACT_ADDRESS}::pepasur::join_game`,
            functionArguments: [gameData.contractGameId],
          },
        }

        const txResponse = await signAndSubmitTransaction(transaction)
        console.log('📝 Transaction submitted:', txResponse.hash)

        // Wait for confirmation
        await aptos.waitForTransaction({ transactionHash: txResponse.hash })
        console.log('✅ Transaction confirmed:', txResponse.hash)
        txHash = txResponse.hash
      }

      // Record stake in backend
      const recordResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/game/record-stake`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gameId: gameData.gameId,
          playerAddress: playerAddress,
          transactionHash: txHash
        }),
      })

      const recordResult = await recordResponse.json()

      if (recordResult.success) {
        console.log('✅ Stake recorded successfully')
        setShowStakingModal(false)
        // Call parent callback to navigate to lobby
        onJoinLobby(gameData.gameId, gameData.roomCode)
      } else {
        throw new Error('Failed to record stake')
      }

    } catch (error) {
      console.error('❌ Error staking:', error)
      setStakingError(`Failed to stake: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsStaking(false)
    }
  }

  // Sort lobbies
  const sortedLobbies = [...lobbies].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      case 'stake':
        return b.stakeAmount - a.stakeAmount
      case 'players':
        return b.playerCount - a.playerCount
      default:
        return 0
    }
  })

  if (isLoading && lobbies.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 gaming-bg scanlines">
        <Card className="w-full max-w-md p-8 bg-[#111111]/80 border border-[#2a2a2a] text-center">
          <div className="space-y-4">
            <div className="text-lg font-press-start pixel-text-3d-white">LOADING LOBBIES...</div>
            <div className="flex justify-center">
              <GifLoader size="lg" />
            </div>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-2 sm:p-4 gaming-bg scanlines">
      <div className="w-full max-w-6xl mx-auto space-y-3 sm:space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <RetroAnimation type="bounce">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold font-press-start pixel-text-3d-white">
                PUBLIC LOBBIES
              </h1>
            </RetroAnimation>
            {isRefreshing && (
              <div className="text-xs text-gray-400 animate-pulse">🔄</div>
            )}
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-2">
            {onCreateLobby && (
              <Button
                onClick={onCreateLobby}
                variant="pixel"
                size="pixel"
                className="text-xs sm:text-sm bg-green-600 hover:bg-green-700 border-2 border-green-400 hover:border-green-300 font-press-start transition-all shadow-lg"
              >
                ➕ CREATE LOBBY
              </Button>
            )}
            <Button
              onClick={onBack}
              variant="pixel"
              size="pixel"
              className="text-xs sm:text-sm"
            >
              ← BACK
            </Button>
          </div>
        </div>

        {/* Sort Options */}
        <Card className="p-2 sm:p-3 bg-card border-2 border-border">
          <div className="flex flex-wrap gap-2">
            <span className="text-xs font-press-start text-gray-300 self-center mr-2">SORT BY:</span>
            <Button
              onClick={() => setSortBy('newest')}
              variant={sortBy === 'newest' ? 'pixel' : 'outline'}
              size="pixel"
              className="text-xs"
            >
              NEWEST
            </Button>
            <Button
              onClick={() => setSortBy('stake')}
              variant={sortBy === 'stake' ? 'pixel' : 'outline'}
              size="pixel"
              className="text-xs"
            >
              STAKE AMOUNT
            </Button>
            <Button
              onClick={() => setSortBy('players')}
              variant={sortBy === 'players' ? 'pixel' : 'outline'}
              size="pixel"
              className="text-xs"
            >
              PLAYERS
            </Button>
          </div>
        </Card>

        {/* Error Message */}
        {error && (
          <Card className="p-3 bg-red-900/20 border border-red-500/50">
            <div className="text-sm text-red-400 font-press-start text-center">
              ❌ {error}
            </div>
          </Card>
        )}

        {/* Lobbies Grid */}
        {sortedLobbies.length === 0 ? (
          <Card className="p-8 bg-[#111111]/80 border border-[#2a2a2a] text-center">
            <RetroAnimation type="pulse">
              <div className="text-4xl mb-4">😔</div>
            </RetroAnimation>
            <div className="text-lg font-press-start pixel-text-3d-white mb-2">
              NO PUBLIC LOBBIES
            </div>
            <div className="text-sm text-gray-400 mb-4">
              Be the first to create a public lobby!
            </div>
            {onCreateLobby && (
              <Button
                onClick={onCreateLobby}
                variant="pixel"
                size="pixelLarge"
                className="bg-green-600 hover:bg-green-700 border-2 border-green-400 hover:border-green-300 font-press-start"
              >
                ➕ CREATE YOUR LOBBY
              </Button>
            )}
          </Card>
        ) : (
          <div className="flex flex-col gap-3 sm:gap-4">
            {sortedLobbies.map((lobby) => {
              // Recalculate win probabilities on render for accurate display
              const winProbs = getWinProbabilities(lobby)

              return (
                <Card
                  key={lobby.gameId}
                  className="p-3 sm:p-4 bg-card border-2 border-border hover:border-primary/50 transition-all"
                >
                  <div className="flex gap-4 items-center">
                    {/* Left (Data) Column */}
                    <div className="flex-grow grid grid-cols-3 gap-2">
                      <div className="p-2 bg-[#1a1a1a]/50 rounded border border-[#333333]">
                        <span className="text-xs text-gray-400 font-press-start">ROOM CODE:</span>
                        <span className="ml-2 text-sm font-bold font-press-start pixel-text-3d-white">{lobby.roomCode}</span>
                      </div>
                      <div className="p-2 bg-[#1a1a1a]/50 rounded border border-[#333333]">
                        <span className="text-xs text-gray-400 font-press-start">STAKE:</span>
                        <span className="ml-2 text-sm font-bold text-yellow-400">{formatAPT(lobby.stakeAmount)} APT</span>
                      </div>
                      <div className="p-2 bg-[#1a1a1a]/50 rounded border border-[#333333]">
                        <span className="text-xs text-gray-400 font-press-start">PLAYERS:</span>
                        <span className={`ml-2 text-sm font-bold ${lobby.playerCount >= lobby.minPlayers ? 'text-green-400' : 'text-yellow-400'}`}>{lobby.playerCount}/{lobby.minPlayers}</span>
                      </div>
                      <div className="p-2 bg-[#1a1a1a]/50 rounded border border-[#333333]">
                        <span className="text-xs text-gray-400 font-press-start">CREATOR:</span>
                        <span className="ml-2 text-sm text-blue-400">{lobby.creatorName || truncateAddress(lobby.creator)}</span>
                      </div>
                      <div className="p-2 bg-green-900/20 rounded border border-green-500/30">
                        <span className="text-xs font-press-start text-green-300">ASUR WINS:</span>
                        <span className="ml-2 text-sm font-bold text-green-400">+{calculateMaxEarnings(lobby.stakeAmount, winProbs.mafiaWinPercent)} APT</span>
                      </div>
                      <div className="p-2 bg-yellow-900/20 rounded border border-yellow-500/30">
                        <span className="text-xs font-press-start text-yellow-300">NON-ASUR WIN:</span>
                        <span className="ml-2 text-sm font-bold text-yellow-400">+{calculateMaxEarnings(lobby.stakeAmount, winProbs.nonMafiaWinPercent)} APT</span>
                      </div>
                    </div>

                    {/* Right (Join) Column */}
                    <div className="flex items-center">
                      <Button
                        onClick={() => handleJoinClick(lobby)}
                        variant="pixel"
                        size="pixelXl"
                        className="h-full"
                        disabled={lobby.playerCount >= lobby.maxPlayers}
                      >
                        {lobby.playerCount >= lobby.maxPlayers ? '🔒 FULL' : '🎮 JOIN'}
                      </Button>
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        )}

        {/* Refresh Info */}
        <div className="text-center text-xs text-gray-500">
          Auto-refreshing every 5 seconds • {lobbies.length} {lobbies.length === 1 ? 'lobby' : 'lobbies'} available
        </div>
      </div>

      {/* Staking Modal */}
      <Dialog open={showStakingModal} onOpenChange={setShowStakingModal}>
        <DialogContent className="bg-card border-2 border-border max-w-md">
          <DialogHeader>
            <DialogTitle className="font-press-start text-lg pixel-text-3d-white text-center">
              💰 STAKE & JOIN
            </DialogTitle>
          </DialogHeader>
          <div className="text-center space-y-3 pt-4">
            {selectedLobby && (() => {
              // Recalculate win probabilities on render for accurate display
              const winProbs = getWinProbabilities(selectedLobby)

              return (
                <>
                  <div className="space-y-2">
                    <div className="p-2 bg-[#1a1a1a]/50 rounded border border-[#333333]">
                      <span className="text-xs text-gray-400 font-press-start">ROOM CODE:</span>
                      <span className="ml-2 text-sm font-bold font-press-start pixel-text-3d-white">
                        {selectedLobby.roomCode}
                      </span>
                    </div>
                    <div className="p-2 bg-[#1a1a1a]/50 rounded border border-[#333333]">
                      <span className="text-xs text-gray-400 font-press-start">STAKE REQUIRED:</span>
                      <span className="ml-2 text-sm font-bold text-yellow-400">
                        {formatAPT(selectedLobby.stakeAmount)} APT
                      </span>
                    </div>
                    <div className="p-2 bg-[#1a1a1a]/50 rounded border border-[#333333]">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-gray-400 font-press-start">YOUR BALANCE:</span>
                        <span className={`text-sm font-bold ${balance >= selectedLobby.stakeAmount ? 'text-green-400' : 'text-red-400'}`}>
                          {balanceLoading ? '...' : `${formatAPT(balance)} APT`}
                        </span>
                      </div>
                      {/* Compact Faucet - Inline */}
                      <div className="pt-2 border-t border-[#333333]/50">
                        <div className="scale-75 origin-left -ml-2">
                          <FaucetButton
                            walletAddress={playerAddress || null}
                            onSuccess={() => {
                              console.log('✅ Faucet claim successful! Refreshing balance...')
                              // Refresh balance after successful faucet claim
                              if (account?.address) {
                                aptos.getAccountAPTAmount({ accountAddress: account.address })
                                  .then(amt => setBalance(amt))
                                  .catch(err => console.error('Failed to refresh balance:', err))
                              }
                            }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="p-2 bg-green-900/20 rounded border border-green-500/30">
                      <span className="text-xs font-press-start text-green-300">ASUR WINS:</span>
                      <span className="ml-2 text-sm font-bold text-green-400">+{calculateMaxEarnings(selectedLobby.stakeAmount, winProbs.mafiaWinPercent)} APT</span>
                    </div>
                    <div className="p-2 bg-yellow-900/20 rounded border border-yellow-500/30">
                      <span className="text-xs font-press-start text-yellow-300">NON-ASUR WIN:</span>
                      <span className="ml-2 text-sm font-bold text-yellow-400">+{calculateMaxEarnings(selectedLobby.stakeAmount, winProbs.nonMafiaWinPercent)} APT</span>
                    </div>

                    {/* Gasless Mode Toggle */}
                    <div className="p-3 bg-[#1a1a1a]/50 rounded border border-[#333333]">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-xs font-press-start text-gray-300">GAS FEES</div>
                          <div className="text-xs text-gray-500 mt-1">
                            {gaslessMode ? '✨ FREE - No gas fees!' : '⛽ Pay small gas fee'}
                          </div>
                        </div>
                        <Button
                          onClick={() => setGaslessMode(!gaslessMode)}
                          variant={gaslessMode ? 'pixel' : 'outline'}
                          size="sm"
                          className="text-xs"
                        >
                          {gaslessMode ? '✨ GASLESS' : '⛽ NORMAL'}
                        </Button>
                      </div>
                    </div>
                  </div>

                  {stakingError && (
                    <div className="text-sm text-red-400 font-press-start">
                      ❌ {stakingError}
                    </div>
                  )}
                </>
              )
            })()}
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              onClick={() => setShowStakingModal(false)}
              variant="outline"
              size="pixel"
              disabled={isStaking}
              className="w-full sm:w-auto"
            >
              ❌ CANCEL
            </Button>
            <Button
              onClick={handleStakeAndJoin}
              variant="pixel"
              size="pixel"
              disabled={isStaking || balanceLoading || (selectedLobby && balance < selectedLobby.stakeAmount)}
              className="w-full sm:w-auto"
            >
              {isStaking ? '⏳ STAKING...' : '💰 STAKE & JOIN'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
