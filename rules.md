# 🐸 Pepasur Game Rules

## 🎯 1. Game Objective

Pepasur is a **battle of wits** between two opposing factions: the **ASURs** and the **Non-ASURs** (*Manav*, *Rishi*, and *Deva*).  
The game proceeds in rounds, each including **Night**, **Resolution**, **Task & Discussion**, and **Voting** phases.

- **ASURs’ Goal:** Eliminate enough Non-ASUR players so that the number of ASURs is **equal to or greater** than the number of remaining players.  
- **Non-ASURs’ Goal:** Identify and **vote out all ASURs**, or complete all collective tasks before elimination.

---

## 🏗️ 2. Game Setup & Lobby

### 🧱 Creating a Game
- Any player can create a new game by setting a **stake amount** ( minimum: `0.001 APT`).  
- Games can be:
  - **Public:** Discoverable in the lobby list.  
  - **Private:** Joinable only via a **6-character room code**.  
- Minimum **4 players**, maximum **10 players** per game.

### 🔗 Joining a Game
- Players can join using the **room code** or by selecting a **public lobby**.  
- Each player must **stake the same APT amount** as set by the creator.  
- The combined stakes form the **prize pool**.

### 🚀 Starting the Game
- Once **4 or more players** have joined and staked, a **3-second countdown** starts automatically.  
- After the countdown, the game **locks**, and no more players can join.

---

## 🧙‍♂️ 3. Roles

Each player is secretly assigned one of the following roles at the start of the game.  
The distribution depends on the total number of players.

### 👥 4-Player Game
- 1 🩸 **ASUR (Mafia)**  
- 1 💊 **DEVA (Doctor)**  
- 1 🔍 **RISHI (Detective)**  
- 1 🧑 **MANAV (Villager)**  

### 👥 Games with More Than 4 Players
- The number of **MANAVs** increases to fill the remaining slots.

### 📜 Role Descriptions

| Role | Alignment | Ability |
|------|------------|----------|
| **ASUR (Mafia)** | Evil | Selects one player to eliminate each night. |
| **DEVA (Doctor)** | Good | Chooses one player to protect from elimination (can protect self). |
| **RISHI (Detective)** | Good | Investigates one player per night to learn their role. |
| **MANAV (Villager)** | Good | No night action — relies on discussion and voting. |

---

## 🔄 4. Game Flow

Each round follows a consistent sequence of phases:

### 🪄 4.1 Role Assignment
- Roles are assigned secretly at the start and remain unchanged throughout the game.

---

### 🌙 4.2 Night Phase (⏱️ 30 seconds)
- Players perform their secret night actions:
  - **ASUR:** Choose a player to eliminate.  
  - **DEVA:** Choose a player to save.  
  - **RISHI:** Choose a player to investigate.  
  - **MANAV:** No night action.  
- The phase ends when the 30-second timer expires or all actions are submitted.

---

### 🌅 4.3 Resolution Phase (⏱️ 10 seconds)
- The results of the night phase are resolved in this order:
  1. ASUR’s target is determined.  
  2. DEVA’s protection is applied.  
  3. RISHI’s investigation result is revealed privately.  
- **If DEVA protects ASUR’s target:** no one is eliminated.  
- **Otherwise:** the ASUR’s target is eliminated, and their role is revealed to all.

---

### 💬 4.4 Task & Discussion Phase (⏱️ 30 seconds)
- All surviving players must complete a **collective mini-game** (e.g., memory puzzle, sequence challenge, or hash task).  
  - Success ➜ **Increases task progress**.  
  - Failure ➜ **Reduces progress** (ASURs can sabotage tasks).  
- Players discuss, share clues, deceive, and strategize during this phase.

---

### 🗳️ 4.5 Voting Phase (⏱️ 10 seconds)
- Each player votes for one player they suspect to be an ASUR.  
- Voting must be completed within the time limit.

---

### ⚖️ 4.6 Voting Resolution (⏱️ 5 seconds)
- Votes are tallied and shown to all players.  
- The player with the **most votes** is eliminated, and their role is revealed.  
- If there’s a **tie**, no one is eliminated.

---

### 🔁 4.7 Win Condition Check
- After each elimination, the game checks for win conditions.  
- If no team has won, the game loops back to the **Night Phase** for the next round.

---

## 🏆 5. Winning Conditions

| Team | Win Condition |
|------|----------------|
| **Non-ASURs (Deva, Rishi, Manav)** | All ASURs are eliminated **or** all collective tasks are completed. |
| **ASURs** | The number of ASURs becomes **equal to or greater** than the number of Non-ASURs. |

---

## 💰 6. Staking & Rewards (On-Chain)

Pepasur is powered by the **Aptos blockchain**, ensuring secure, transparent staking and payouts.

### 💎 Staking
- Each player deposits their stake into the game’s **smart contract**.
- All stakes combine to form the **prize pool**.

### 🧾 Game State
- The contract tracks:
  - Player list  
  - Total prize pool  
  - Game status (active, finished, cancelled)

### ⚙️ Settlement
- When the game ends, the backend server (acting as a **trusted oracle**) calls `settle_game()` with a **signed result**.  
- This ensures only authorized data can determine the winners.

### 💸 Reward Distribution
- A **2% house fee** is deducted.  
- Remaining rewards are split equally among the winners.  
- Winners can call `withdraw()` to claim rewards directly to their wallet.

### 🚫 Game Cancellation
- If the game is cancelled by the creator **before it starts**, all players can **withdraw their full stake** safely.

---

✨ *Pepasur blends strategy, deception, and on-chain transparency — may the smartest faction win!*
