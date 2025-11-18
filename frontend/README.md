# Pepasur Frontend

A Next.js-based frontend application for Pepasur, an on-chain Mafia game built on the Aptos blockchain. The frontend provides an immersive real-time gaming experience with wallet integration, responsive design, and seamless blockchain interactions.

---

## ✨ Features

- **Wallet Integration**: Support for multiple Aptos wallets (Petra, Martian, Pontem)
- **Real-time UI**: Live game updates via Socket.IO for instant player actions and state changes
- **Responsive Design**: Mobile-first design that works seamlessly across all devices
- **Component-Based Architecture**: Built with shadcn/ui components using Radix UI primitives
- **Game State Management**: Centralized state management using React Context API and custom hooks
- **Sound Effects and Animations**: Immersive audio feedback and smooth animations with Framer Motion
- **Task Mini-games**: Interactive mini-games during task phases
- **Role-Based UI**: Dynamic interface adapting to player roles (ASUR, DEV, MANAV, RISHI)
- **Chat System**: Real-time in-game chat for player communication
- **Transaction Management**: Seamless Aptos blockchain transaction handling

---

## 🛠️ Tech Stack

- **Framework**: Next.js 15.5.4
- **Language**: TypeScript 5
- **UI Library**: React 18.2.0
- **Component Library**: shadcn/ui (Radix UI primitives)
- **Styling**: Tailwind CSS 4.1.9
- **State Management**: React Hooks & Context API
- **Blockchain SDK**: @aptos-labs/ts-sdk 1.39.0
- **Wallet Adapter**: @aptos-labs/wallet-adapter-react 7.1.3
- **Real-time Communication**: socket.io-client 4.8.1
- **Forms**: react-hook-form 7.60.0
- **Validation**: zod 3.25.67
- **Animations**: framer-motion 12.23.22
- **Audio**: howler 2.2.4
- **Icons**: lucide-react 0.454.0
- **Utilities**: clsx 2.1.1, tailwind-merge 2.5.5

---

## 🚀 Getting Started

### Prerequisites

- **Node.js v18 or higher**: JavaScript runtime
- **npm or pnpm**: Package manager
- **Aptos Wallet**: Browser extension (Petra, Martian, or Pontem)
- **APT Tokens**: Devnet or testnet tokens for staking

### Step 1: Install Dependencies

```bash
cd frontend
npm install
```

Or using pnpm:

```bash
cd frontend
pnpm install
```

### Step 2: Configure Environment Variables

Copy the example environment file:

```bash
copy .env.example .env.local
```

Edit `.env.local` with your configuration:

```env
# Backend API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_SOCKET_URL=http://localhost:3001

# Aptos Blockchain Configuration
NEXT_PUBLIC_APTOS_NETWORK=testnet
NEXT_PUBLIC_APTOS_NODE_URL=https://fullnode.testnet.aptoslabs.com/v1

# Pepasur Contract Address (deployed module address on Aptos)
NEXT_PUBLIC_MODULE_ADDRESS=0x...

# Game Configuration
NEXT_PUBLIC_DEFAULT_STAKE_AMOUNT=100000000
NEXT_PUBLIC_DEFAULT_MIN_PLAYERS=4
NEXT_PUBLIC_DEFAULT_MAX_PLAYERS=10
NEXT_PUBLIC_GAME_TIMEOUT_SECONDS=300

# Development Configuration (optional)
NEXT_PUBLIC_DEV_MODE=true
NEXT_PUBLIC_ENABLE_DEBUG_LOGS=false
```

**Environment Variable Descriptions:**

- `NEXT_PUBLIC_API_URL`: Backend REST API endpoint
- `NEXT_PUBLIC_SOCKET_URL`: Backend Socket.IO server endpoint
- `NEXT_PUBLIC_APTOS_NETWORK`: Aptos network (devnet, testnet, or mainnet)
- `NEXT_PUBLIC_APTOS_NODE_URL`: Aptos full node RPC URL
- `NEXT_PUBLIC_MODULE_ADDRESS`: Deployed Pepasur smart contract module address
- `NEXT_PUBLIC_DEFAULT_STAKE_AMOUNT`: Default stake amount in Octas (1 APT = 100000000 Octas)
- `NEXT_PUBLIC_DEFAULT_MIN_PLAYERS`: Minimum players required to start a game
- `NEXT_PUBLIC_DEFAULT_MAX_PLAYERS`: Maximum players allowed in a game
- `NEXT_PUBLIC_GAME_TIMEOUT_SECONDS`: Game timeout duration in seconds
- `NEXT_PUBLIC_DEV_MODE`: Enable development mode features
- `NEXT_PUBLIC_ENABLE_DEBUG_LOGS`: Enable debug logging in console

### Step 3: Run Development Server

```bash
npm run dev
```

Or using pnpm:

```bash
pnpm dev
```

The application will be available at **http://localhost:3000**

### Build for Production

```bash
npm run build
npm start
```

---

## 📂 Project Structure

```
frontend/
├── app/                    # Next.js app directory
│   ├── layout.tsx         # Root layout with providers
│   ├── page.tsx           # Home page / game lobby
│   └── globals.css        # Global styles
├── components/             # React components
│   ├── common/            # Shared components (buttons, cards, etc.)
│   ├── game/              # Game-specific components (player list, role cards)
│   ├── screens/           # Game screen components (lobby, night, voting)
│   ├── ui/                # shadcn/ui components (dialog, toast, etc.)
│   └── wallet/            # Wallet integration components
├── contexts/              # React contexts
│   └── SocketContext.tsx  # Socket.IO connection context
├── hooks/                 # Custom React hooks
│   ├── useGame.ts        # Game state management hook
│   ├── useToast.ts       # Toast notification hook
│   └── use-mobile.ts     # Mobile detection hook
├── lib/                   # Utility libraries
│   ├── utils.ts          # Helper functions
│   └── smoothsend.ts     # SmoothSend integration
├── services/              # API and service layers
│   ├── api.ts            # REST API client
│   └── SoundService.ts   # Audio management service
├── styles/                # Global styles
│   └── globals.css       # Tailwind and custom CSS
├── utils/                 # Helper functions
│   ├── playerColors.ts   # Player color assignments
│   ├── sessionPersistence.ts  # Session storage utilities
│   └── winProbability.ts # Win probability calculations
├── public/                # Static assets
│   ├── images/           # Image assets
│   └── video/            # Video assets
├── .env.local             # Environment variables (not committed)
├── next.config.mjs        # Next.js configuration
├── tailwind.config.js     # Tailwind CSS configuration
├── tsconfig.json          # TypeScript configuration
├── package.json           # Dependencies and scripts
└── README.md             # This file
```

---

## 🔌 Key Integrations

### Aptos Wallet Integration

The frontend uses `@aptos-labs/wallet-adapter-react` to support multiple Aptos wallets including Petra, Martian, and Pontem. The wallet adapter provides:

- **Multi-wallet Support**: Users can connect with their preferred Aptos wallet
- **Account Management**: Access to connected wallet address and account information
- **Transaction Signing**: Sign and submit transactions to the Aptos blockchain
- **Network Switching**: Support for devnet, testnet, and mainnet

**Implementation:**
```typescript
import { AptosWalletAdapterProvider } from '@aptos-labs/wallet-adapter-react';

// Wrap your app with the provider
<AptosWalletAdapterProvider>
  {children}
</AptosWalletAdapterProvider>
```

### Real-time Communication

Socket.IO client maintains a persistent connection to the backend for live game updates, player actions, and chat functionality. The `SocketContext` provides:

- **Connection Management**: Automatic reconnection and error handling
- **Event Listeners**: Subscribe to game state updates and player actions
- **Event Emitters**: Send player actions and chat messages to server
- **Room Management**: Join and leave game rooms dynamically

**Key Events:**
- `game_state`: Full game state updates
- `game_update`: Incremental state changes
- `task_update`: Task submission updates
- `chat_message`: Real-time chat messages
- `error`: Error notifications

### State Management

Game state is managed through React Context API and custom hooks, providing centralized state access across components:

- **SocketContext**: Manages Socket.IO connection and real-time events
- **useGame Hook**: Provides game state, player information, and game actions
- **useToast Hook**: Manages toast notifications for user feedback

**Example Usage:**
```typescript
import { useGame } from '@/hooks/useGame';

const { gameState, players, currentPhase, submitAction } = useGame();
```

### Blockchain Interactions

The frontend interacts with Aptos blockchain through the TypeScript SDK:

- **Game Creation**: Submit transactions to create new game lobbies with stake deposits
- **Joining Games**: Stake APT tokens to join existing games
- **Withdrawals**: Withdraw winnings from completed games
- **Transaction Status**: Monitor transaction status and confirmations

---

## 🎮 Game Screens

The application includes multiple game screens that adapt to the current game phase:

- **Lobby Screen**: Create or join games, view player list, configure game settings
- **Night Phase Screen**: Role-specific actions (eliminate, protect, investigate)
- **Task Phase Screen**: Complete mini-games for bonus rewards
- **Voting Phase Screen**: Vote to eliminate suspected Mafia players
- **Resolution Screen**: View elimination results and game outcomes
- **Game Over Screen**: Display winners and reward distribution

---

## 🎨 Styling and Theming

The application uses Tailwind CSS for styling with a custom design system:

- **Color Palette**: Custom color scheme for game roles and UI elements
- **Typography**: Geist font family for modern, clean text
- **Dark Mode**: Full dark mode support with next-themes
- **Responsive Breakpoints**: Mobile-first responsive design
- **Animations**: Smooth transitions and animations with Tailwind and Framer Motion

---

## 🔊 Audio System

The `SoundService` manages all game audio:

- **Background Music**: Ambient music during gameplay
- **Sound Effects**: Action feedback, notifications, and UI interactions
- **Volume Control**: User-configurable volume settings
- **Audio Preloading**: Efficient audio asset loading

---

## 🧪 Development

### Available Scripts

- `npm run dev`: Start development server with hot reload
- `npm run build`: Build production-optimized application
- `npm start`: Start production server
- `npm run lint`: Run ESLint for code quality checks

### Code Quality

The project uses:
- **TypeScript**: Type safety and better developer experience
- **ESLint**: Code linting with Next.js recommended rules
- **Prettier**: Code formatting (configure as needed)

---

## 🐛 Troubleshooting

### Wallet Connection Issues

- Ensure you have an Aptos wallet extension installed (Petra, Martian, or Pontem)
- Check that your wallet is connected to the correct network (devnet/testnet)
- Try refreshing the page or reconnecting your wallet

### Socket Connection Errors

- Verify the backend server is running at the configured `NEXT_PUBLIC_SOCKET_URL`
- Check browser console for connection error messages
- Ensure CORS is properly configured on the backend

### Transaction Failures

- Confirm you have sufficient APT tokens for staking and gas fees
- Verify the contract address in `.env.local` matches the deployed contract
- Check Aptos Explorer for transaction details and error messages

### Build Errors

- Delete `.next` folder and `node_modules`, then reinstall dependencies
- Ensure all environment variables are properly set
- Check for TypeScript errors with `npm run lint`

---

## 📚 Additional Resources

- **Next.js Documentation**: [https://nextjs.org/docs](https://nextjs.org/docs)
- **Aptos TypeScript SDK**: [https://aptos.dev/sdks/ts-sdk/](https://aptos.dev/sdks/ts-sdk/)
- **Aptos Wallet Adapter**: [https://github.com/aptos-labs/aptos-wallet-adapter](https://github.com/aptos-labs/aptos-wallet-adapter)
- **shadcn/ui Components**: [https://ui.shadcn.com/](https://ui.shadcn.com/)
- **Tailwind CSS**: [https://tailwindcss.com/docs](https://tailwindcss.com/docs)
- **Socket.IO Client**: [https://socket.io/docs/v4/client-api/](https://socket.io/docs/v4/client-api/)

---

## 🤝 Contributing

Contributions are welcome! Please ensure your code follows the project's coding standards and includes appropriate documentation.

---

## 📄 License

MIT
