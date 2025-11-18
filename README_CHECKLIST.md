# README Documentation Checklist

Use this checklist to ensure your Aptos project documentation is complete and follows the Pepasur style.

## ✅ Root README.md

- [ ] Project title with tagline
- [ ] 2-3 sentence description mentioning Aptos
- [ ] 🏛️ Architecture section with ASCII diagram
- [ ] Three-tier architecture clearly shown (Frontend → Backend → Blockchain)
- [ ] 📂 Repository Structure with all directories listed
- [ ] Links to subdirectory READMEs
- [ ] 🛠️ Tech Stack section with all technologies
- [ ] 🚀 Quick Start with setup overview
- [ ] Note about deployment order (smart contracts first)

## ✅ Frontend README.md

- [ ] Title: "[Project Name] Frontend"
- [ ] Brief description of frontend purpose
- [ ] ✨ Features section (4-5 key features)
- [ ] Wallet integration mentioned (Petra, Martian, etc.)
- [ ] Real-time UI mentioned
- [ ] 🛠️ Tech Stack with all frontend technologies
- [ ] 🚀 Getting Started section
- [ ] Step 1: Install Dependencies with command
- [ ] Step 2: Environment Variables with all vars explained
- [ ] Example .env.local file shown
- [ ] Step 3: Run dev server with command and URL
- [ ] All Aptos-specific packages mentioned (@aptos-labs/wallet-adapter-react)

## ✅ Backend README.md

- [ ] Title: "[Project Name] Backend"
- [ ] Description of backend's role
- [ ] ✨ Features section (4-5 key features)
- [ ] Real-time gameplay mentioned
- [ ] Aptos integration mentioned
- [ ] 🛠️ Tech Stack with backend technologies
- [ ] 🚀 Getting Started section
- [ ] Step 1: Install Dependencies
- [ ] Step 2: Environment Variables with all vars
- [ ] Example .env file shown
- [ ] Step 3: Start server with command
- [ ] Project Structure diagram included
- [ ] All directories explained

## ✅ Smart Contract README.md

- [ ] Title: "[Project Name] Move Modules"
- [ ] Description of smart contract functionality
- [ ] 🚀 Features section listing all entry functions
- [ ] Each function briefly explained
- [ ] 🏗️ Module Structures section
- [ ] All main structs/resources documented
- [ ] 🛠️ How to Build & Deploy section
- [ ] Prerequisites listed (Aptos CLI, etc.)
- [ ] Build command: `aptos move compile`
- [ ] Test command: `aptos move test`
- [ ] Deploy commands for devnet/testnet
- [ ] Note about updating addresses after deployment
- [ ] Module Address section with actual address
- [ ] Aptos Explorer link included

## ✅ General Quality Checks

- [ ] All Solana terms replaced with Aptos equivalents
- [ ] Consistent emoji usage across all READMEs
- [ ] All code blocks have language specified
- [ ] All commands are accurate and tested
- [ ] All file paths are correct
- [ ] All links work (internal and external)
- [ ] Consistent terminology throughout
- [ ] Professional but friendly tone
- [ ] No typos or grammatical errors
- [ ] Proper markdown formatting
- [ ] All environment variables documented

## ✅ Aptos-Specific Terminology

- [ ] "Module" used instead of "Program" or "Contract"
- [ ] "Entry function" used instead of "Instruction"
- [ ] "Resource" used instead of "Account" (where appropriate)
- [ ] "Octas" used instead of "Lamports"
- [ ] "APT" used instead of "SOL"
- [ ] Aptos wallet names used (Petra, Martian, Pontem)
- [ ] Aptos SDK referenced correctly
- [ ] Move language mentioned (not Rust/Anchor)

## ✅ Environment Variables Documented

### Frontend:
- [ ] NEXT_PUBLIC_APTOS_NETWORK
- [ ] NEXT_PUBLIC_APTOS_NODE_URL
- [ ] NEXT_PUBLIC_MODULE_ADDRESS
- [ ] NEXT_PUBLIC_API_URL
- [ ] Any project-specific variables

### Backend:
- [ ] APTOS_NETWORK
- [ ] APTOS_NODE_URL
- [ ] MODULE_ADDRESS
- [ ] APTOS_PRIVATE_KEY (if needed)
- [ ] PORT
- [ ] DATABASE_URL (if applicable)
- [ ] Any project-specific variables

## 📝 Final Review

- [ ] Read through all READMEs as if you're a new developer
- [ ] Verify all commands work
- [ ] Check all links
- [ ] Ensure consistency across all files
- [ ] Commit to repository

---

## Quick Reference: Solana → Aptos Mapping

| Solana | Aptos |
|--------|-------|
| Program | Module |
| Instruction | Entry Function |
| Account | Resource |
| PDA | Resource Account/Object |
| Lamports | Octas |
| SOL | APT |
| Rust/Anchor | Move |
| @solana/web3.js | aptos SDK |
| Phantom/Solflare | Petra/Martian/Pontem |
| anchor build | aptos move compile |
| anchor deploy | aptos move publish |
| Solana Explorer | Aptos Explorer |

---

**Note**: This checklist is based on the Pepasur Solana documentation style. Adapt as needed for your specific project while maintaining the same professional quality and structure.
