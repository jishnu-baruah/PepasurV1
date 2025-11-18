# Comprehensive README Documentation Prompt for Aptos Project

Use this prompt to create professional, well-structured README files for your Aptos-based project following the Pepasur Solana documentation style.

---

## 📋 Prompt for AI Assistant

I need you to create comprehensive README.md files for my Aptos blockchain project following this specific structure and style. The project is similar to Pepasur but built on Aptos instead of Solana.

### Project Context:
- **Blockchain**: Aptos (instead of Solana)
- **Smart Contracts**: Move language (instead of Rust/Anchor)
- **Backend**: Node.js, Express, Socket.IO
- **Frontend**: Next.js, React, TypeScript
- **Wallet Integration**: Aptos Wallet Adapter (instead of Solana Wallet Adapter)

### Documentation Requirements:

Create **FOUR** README files with the following structure:

---

## 1. ROOT README.md

**Location**: `./README.md`

**Required Sections**:

1. **Title & Description**
   - Project name with tagline
   - Brief description (2-3 sentences) explaining what the project does
   - Mention it's built on Aptos blockchain
   - Explain the core value proposition

2. **🏛️ Architecture Section**
   - ASCII diagram showing three-tier architecture:
     - Frontend (Next.js)
     - Backend (Node.js + Express)
     - Aptos Blockchain (Move modules)
   - Brief explanation of each component's role

3. **📂 Repository Structure**
   - List all main directories with brief descriptions
   - Link to each subdirectory's README
   - Format: `./directory-name/` with description and link

4. **🛠️ Tech Stack**
   - Organized list of technologies:
     - Blockchain: Aptos
     - Smart Contracts: Move
     - Backend: Node.js, Express, Socket.IO
     - Frontend: Next.js, React, TypeScript, Aptos Wallet Adapter
     - UI: shadcn/ui, Tailwind CSS

5. **🚀 Quick Start**
   - Brief overview of setup process
   - Links to detailed READMEs in subdirectories
   - Note about deployment order (smart contracts first)

**Style Guidelines**:
- Use emojis for section headers (🏛️, 📂, 🛠️, 🚀)
- Keep descriptions concise and clear
- Use code blocks for directory structure
- Include visual ASCII diagrams
- Link to subdirectory READMEs

---

## 2. FRONTEND README.md

**Location**: `./frontend/README.md`

**Required Sections**:

1. **Title & Description**
   - "Project Name Frontend"
   - Brief description of the frontend's purpose

2. **✨ Features**
   - Bullet list of key features:
     - Wallet Integration (specify Aptos wallets like Petra, Martian)
     - Real-time UI (Socket.IO)
     - Responsive Design
     - Component-Based architecture
   - Each feature should have a brief explanation

3. **🛠️ Tech Stack**
   - Framework: Next.js
   - Language: TypeScript
   - UI: React, shadcn/ui, Tailwind CSS
   - State Management: React Hooks & Context API
   - Blockchain Interaction: `aptos`, `@aptos-labs/wallet-adapter-react`
   - Real-time Communication: `socket.io-client`

4. **🚀 Getting Started**
   - **Step 1: Install Dependencies**
     - Command: `npm install`
   
   - **Step 2: Configure Environment Variables**
     - Command to copy example file
     - List all environment variables with descriptions:
       - `NEXT_PUBLIC_APTOS_NETWORK` (e.g., devnet, testnet, mainnet)
       - `NEXT_PUBLIC_APTOS_NODE_URL` (RPC endpoint)
       - `NEXT_PUBLIC_MODULE_ADDRESS` (deployed module address)
       - Any other project-specific variables
   
   - **Step 3: Run Development Server**
     - Command: `npm run dev`
     - URL where it runs (e.g., http://localhost:3000)

**Style Guidelines**:
- Use numbered steps for setup
- Include actual commands in code blocks
- Provide example values for environment variables
- Keep explanations brief but clear

---

## 3. BACKEND README.md

**Location**: `./backend/README.md`

**Required Sections**:

1. **Title & Description**
   - "Project Name Backend"
   - Explain backend's role in the system

2. **✨ Features**
   - Real-time Gameplay (Socket.IO)
   - Aptos Integration (connecting to blockchain)
   - Game Logic Management
   - Secure Operations (if applicable)
   - Any other key features

3. **🛠️ Tech Stack**
   - Framework: Node.js, Express
   - Real-time Communication: Socket.IO
   - Blockchain Interaction: `aptos` SDK
   - Database: (specify if using MongoDB, PostgreSQL, or in-memory)

4. **🚀 Getting Started**
   - **Step 1: Install Dependencies**
     - Command: `npm install`
   
   - **Step 2: Configure Environment Variables**
     - Command to copy example file
     - List all environment variables:
       - `APTOS_NETWORK` (devnet, testnet, mainnet)
       - `APTOS_NODE_URL` (RPC endpoint)
       - `MODULE_ADDRESS` (deployed module address)
       - `APTOS_PRIVATE_KEY` (if server needs to sign transactions)
       - Database connection strings
       - Port configuration
   
   - **Step 3: Start the Server**
     - Command: `npm run dev` or `npm start`
     - Port information

5. **Project Structure**
   - Directory tree showing main folders:
     ```
     backend/
     ├── config/          # Configuration files
     ├── models/          # Data models
     ├── routes/          # API routes
     ├── services/        # Business logic
     │   ├── aptos/       # Aptos-specific services
     │   ├── core/        # Core services
     │   └── game/        # Game logic
     ├── utils/           # Utility functions
     ├── .env             # Environment variables
     ├── package.json     # Dependencies
     └── server.js        # Entry point
     ```

**Style Guidelines**:
- Include project structure diagram
- Explain purpose of each directory
- Use consistent formatting

---

## 4. SMART CONTRACT README.md

**Location**: `./move-modules/README.md` (or appropriate directory name)

**Required Sections**:

1. **Title & Description**
   - "Project Name Move Modules"
   - Brief description of smart contract functionality

2. **🚀 Features**
   - List all main functions/entry points:
     - `initialize`: Setup and configuration
     - `create_game`: Game creation logic
     - `join_game`: Player joining logic
     - `settle_game`: Game settlement
     - Any other key functions
   - Brief explanation of each function

3. **🏗️ Module Structures**
   - Describe main structs/resources:
     - Config resource
     - Game resource
     - Player data structures
     - Any other important types
   - Explain what each stores

4. **🛠️ How to Build & Deploy**
   - **Prerequisites**:
     - Aptos CLI installed
     - Move compiler available
   
   - **Build**:
     ```bash
     # Navigate to module directory
     cd /path/to/move-modules
     
     # Compile the modules
     aptos move compile
     ```
   
   - **Test**:
     ```bash
     # Run Move tests
     aptos move test
     ```
   
   - **Deploy**:
     ```bash
     # Deploy to devnet
     aptos move publish --profile devnet
     
     # Or deploy to testnet
     aptos move publish --profile testnet
     ```
   
   - **After Deployment**:
     - Note about updating module address in backend/frontend
     - How to verify deployment

5. **Module Address**
   - **Devnet Module Address**: `0x...` (provide actual address)
   - Link to Aptos Explorer:
     ```
     https://explorer.aptoslabs.com/account/[MODULE_ADDRESS]?network=devnet
     ```

**Style Guidelines**:
- Include actual commands
- Explain deployment process clearly
- Provide explorer links
- Note prerequisites

---

## General Style Guidelines for All READMEs:

1. **Formatting**:
   - Use emojis for main section headers (✨, 🛠️, 🚀, 🏗️, 📂)
   - Use `**bold**` for emphasis
   - Use `code blocks` for commands, file paths, and code
   - Use bullet points for lists
   - Use numbered lists for sequential steps

2. **Tone**:
   - Professional but friendly
   - Clear and concise
   - Assume reader has basic blockchain knowledge
   - Explain Aptos-specific concepts when necessary

3. **Code Blocks**:
   - Always specify language (```bash, ```typescript, ```env)
   - Include comments where helpful
   - Show actual commands that work

4. **Links**:
   - Use relative links for internal documentation
   - Use absolute links for external resources
   - Format: `[Link Text](url)`

5. **Consistency**:
   - Use same emoji for same section across all READMEs
   - Use consistent terminology (e.g., "module" not "contract")
   - Keep section order consistent

---

## Additional Instructions:

1. **Replace Solana-specific terms with Aptos equivalents**:
   - Solana → Aptos
   - Rust/Anchor → Move
   - Program → Module
   - Account → Resource
   - Instruction → Entry function
   - PDA (Program Derived Address) → Resource account or object
   - Lamports → Octas
   - SOL → APT

2. **Update wallet references**:
   - Phantom/Solflare → Petra/Martian/Pontem
   - @solana/wallet-adapter → @aptos-labs/wallet-adapter

3. **Update SDK references**:
   - @solana/web3.js → aptos SDK
   - @coral-xyz/anchor → N/A (Move doesn't use Anchor)

4. **Include project-specific details**:
   - Actual module addresses
   - Actual RPC endpoints
   - Actual port numbers
   - Actual directory names

5. **Add any unique features**:
   - If your project has unique features not in the template, add them
   - Maintain the same documentation style

---

## Example Environment Variables to Document:

### Frontend (.env.local):
```env
NEXT_PUBLIC_APTOS_NETWORK=devnet
NEXT_PUBLIC_APTOS_NODE_URL=https://fullnode.devnet.aptoslabs.com/v1
NEXT_PUBLIC_MODULE_ADDRESS=0x...
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### Backend (.env):
```env
APTOS_NETWORK=devnet
APTOS_NODE_URL=https://fullnode.devnet.aptoslabs.com/v1
MODULE_ADDRESS=0x...
APTOS_PRIVATE_KEY=0x...
PORT=3001
DATABASE_URL=mongodb://localhost:27017/dbname
```

---

## Deliverables:

Please create four complete README.md files:
1. Root README.md
2. frontend/README.md
3. backend/README.md
4. move-modules/README.md (or appropriate directory name)

Each should follow the structure above and be ready to commit to the repository.
