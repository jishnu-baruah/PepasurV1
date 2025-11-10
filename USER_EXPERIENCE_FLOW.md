# Cross-Chain User Experience - Single Wallet Connection

## User Flow: One Chain, One Wallet ✅

### Step 1: User Selects Chain
```
┌─────────────────────────────────────┐
│        Welcome to PepAsur           │
│                                     │
│  Choose your blockchain:            │
│  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐   │
│  │ 🟢  │ │ 🌊  │ │ ⟠   │ │ ◎   │   │
│  │ APT │ │FLOW │ │ ETH │ │ SOL │   │
│  └─────┘ └─────┘ └─────┘ └─────┘   │
└─────────────────────────────────────┘
```

### Step 2: Connect Single Wallet
```
User clicks "Aptos" → Only connects Petra/Martian wallet
User clicks "Flow" → Only connects Blocto/Lilico wallet  
User clicks "Ethereum" → Only connects MetaMask
User clicks "Solana" → Only connects Phantom
```

### Step 3: Play Games
```
APT User sees:
┌─────────────────────────────────────┐
│  Stake: 5.88 APT ($50)             │
│  Game Type:                         │
│  ○ APT-only (4 APT players)        │
│  ● Cross-chain (APT + FLOW + ETH)  │
└─────────────────────────────────────┘

FLOW User sees:
┌─────────────────────────────────────┐
│  Stake: 66.67 FLOW ($50)           │
│  Game Type:                         │
│  ○ FLOW-only (4 FLOW players)      │
│  ● Cross-chain (APT + FLOW + ETH)  │
└─────────────────────────────────────┘
```

---

## Cross-Chain Game Matching

### How Players Find Each Other
```typescript
// Backend matchmaking service
class CrossChainMatchmaker {
  async findGame(playerChain: string, stakeAmountUSD: number, gameType: string) {
    if (gameType === 'same-chain') {
      // Find game with only same-chain players
      return this.findSameChainGame(playerChain, stakeAmountUSD);
    } else {
      // Find cross-chain game accepting multiple chains
      return this.findCrossChainGame(stakeAmountUSD);
    }
  }

  async findCrossChainGame(stakeAmountUSD: number) {
    // Look for games accepting multiple chains
    const availableGames = await this.getGamesWhere({
      stakeAmountUSD,
      allowedChains: ['aptos', 'flow', 'ethereum'], // Multiple chains allowed
      status: 'waiting_for_players'
    });

    return availableGames[0]; // Join first available
  }
}
```

### Example Cross-Chain Game Room
```
Game Room #12345 ($50 stake)
┌─────────────────────────────────────┐
│  Players (3/4):                     │
│  👤 0xABC... (Aptos) - 5.88 APT    │
│  👤 0x123... (Flow) - 66.67 FLOW   │  
│  👤 0xDEF... (Ethereum) - 0.02 ETH │
│  ⏳ Waiting for 1 more player...    │
│                                     │
│  Any chain can join!                │
└─────────────────────────────────────┘
```

---

## Technical Implementation

### Frontend: Chain-Specific Wallet Connection
```typescript
// WalletConnect.tsx
function WalletConnect() {
  const { selectedChain } = useChain();
  const [walletAddress, setWalletAddress] = useState(null);

  const connectWallet = async () => {
    switch (selectedChain.id) {
      case 'aptos':
        // Only connect Aptos wallet
        const aptosWallet = await window.aptos.connect();
        setWalletAddress(aptosWallet.address);
        break;
        
      case 'flow':
        // Only connect Flow wallet
        const flowUser = await fcl.authenticate();
        setWalletAddress(flowUser.addr);
        break;
        
      case 'ethereum':
        // Only connect Ethereum wallet
        const accounts = await window.ethereum.request({
          method: 'eth_requestAccounts'
        });
        setWalletAddress(accounts[0]);
        break;
    }
  };

  return (
    <div>
      <ChainSelector /> {/* User picks chain first */}
      
      {selectedChain && (
        <button onClick={connectWallet}>
          Connect {selectedChain.name} Wallet
        </button>
      )}
      
      {walletAddress && (
        <GameLobby 
          playerChain={selectedChain.id}
          playerAddress={walletAddress}
        />
      )}
    </div>
  );
}
```

### Backend: Cross-Chain Game Management
```typescript
// GameManager.js
class CrossChainGameManager {
  async createGame(creatorChain, creatorAddress, stakeAmountUSD, allowedChains) {
    const game = {
      id: generateGameId(),
      creatorChain,
      creatorAddress,
      stakeAmountUSD,
      allowedChains, // ['aptos'] or ['aptos', 'flow', 'ethereum']
      players: [{
        address: creatorAddress,
        chain: creatorChain,
        stakeNative: await this.calculateNativeStake(creatorChain, stakeAmountUSD),
        stakeUSD: stakeAmountUSD
      }],
      status: 'waiting'
    };

    return await this.saveGame(game);
  }

  async joinGame(gameId, playerChain, playerAddress) {
    const game = await this.getGame(gameId);
    
    // Check if player's chain is allowed
    if (!game.allowedChains.includes(playerChain)) {
      throw new Error(`${playerChain} not allowed in this game`);
    }

    // Calculate required stake in player's native currency
    const nativeStake = await this.calculateNativeStake(playerChain, game.stakeAmountUSD);
    
    // Add player to game
    game.players.push({
      address: playerAddress,
      chain: playerChain,
      stakeNative: nativeStake,
      stakeUSD: game.stakeAmountUSD
    });

    return await this.updateGame(game);
  }
}
```

---

## User Experience Examples

### Scenario 1: APT User Joins Cross-Chain Game
```
1. User selects "Aptos" chain
2. Connects Petra wallet: 0xABC...
3. Sees available games:
   - APT-only game: 5.88 APT stake
   - Cross-chain game: 5.88 APT stake (bigger prizes!)
4. Joins cross-chain game
5. Waits for FLOW/ETH players to join
6. Plays game with mixed players
7. If wins: Gets prize in APT (converted from other currencies)
```

### Scenario 2: FLOW User Creates Same-Chain Game
```
1. User selects "Flow" chain  
2. Connects Blocto wallet: 0x123...
3. Creates FLOW-only game: 66.67 FLOW stake
4. Only FLOW users can join
5. Plays with 4 FLOW players
6. Winner gets all FLOW (no conversion needed)
```

---

## Wallet Integration Code

### Universal Wallet Hook
```typescript
// hooks/useWallet.ts
export function useWallet() {
  const { selectedChain } = useChain();
  const [address, setAddress] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  const connect = async () => {
    try {
      let walletAddress;
      
      switch (selectedChain.id) {
        case 'aptos':
          if (!window.aptos) throw new Error('Aptos wallet not installed');
          const response = await window.aptos.connect();
          walletAddress = response.address;
          break;
          
        case 'flow':
          if (!window.fcl) throw new Error('Flow wallet not available');
          const user = await fcl.authenticate();
          walletAddress = user.addr;
          break;
          
        case 'ethereum':
          if (!window.ethereum) throw new Error('Ethereum wallet not installed');
          const accounts = await window.ethereum.request({
            method: 'eth_requestAccounts'
          });
          walletAddress = accounts[0];
          break;
      }

      setAddress(walletAddress);
      setIsConnected(true);
      
      // Store connection for this chain
      localStorage.setItem(`wallet_${selectedChain.id}`, walletAddress);
      
    } catch (error) {
      console.error('Wallet connection failed:', error);
      throw error;
    }
  };

  const disconnect = async () => {
    // Chain-specific disconnect logic
    switch (selectedChain.id) {
      case 'aptos':
        await window.aptos?.disconnect();
        break;
      case 'flow':
        await fcl.unauthenticate();
        break;
      // Ethereum doesn't have programmatic disconnect
    }
    
    setAddress(null);
    setIsConnected(false);
    localStorage.removeItem(`wallet_${selectedChain.id}`);
  };

  return {
    address,
    isConnected,
    connect,
    disconnect,
    chainId: selectedChain.id
  };
}
```

---

## Key Benefits of Single Wallet Approach

### For Users ✅
- **Simple**: Only need one wallet per chain they want to play on
- **Familiar**: Use their existing wallet (Petra, Blocto, MetaMask, etc.)
- **Secure**: No need to manage multiple wallets simultaneously
- **Choice**: Can play same-chain or cross-chain games

### For Development ✅
- **Easier**: No complex multi-wallet management
- **Faster**: Standard wallet integration per chain
- **Reliable**: Use proven wallet connection patterns
- **Scalable**: Easy to add new chains

### Cross-Chain Magic Happens Backend ✨
- Users only see their chain and currency
- Backend handles cross-chain coordination
- Smart contracts manage native token escrow
- Price service handles USD normalization

---

## Summary

**Users Experience:**
1. Pick chain → Connect wallet → Play games
2. Can join same-chain OR cross-chain games
3. Always stake and receive in their native currency
4. Cross-chain coordination is invisible to them

**No Multi-Wallet Complexity:**
- ❌ No connecting multiple wallets
- ❌ No managing different wallet states  
- ❌ No switching between wallet interfaces
- ✅ Simple, familiar wallet experience per chain

The cross-chain magic happens in the backend - users just see bigger prize pools and more players to compete with!