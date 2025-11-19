import hre from "hardhat";

async function main() {
    const network = hre.network.name;
    console.log(`\n🎮 Testing game creation on ${network}...`);

    // Get contract address
    const contractAddress = process.env.CONTRACT_ADDRESS;
    if (!contractAddress) {
        throw new Error("CONTRACT_ADDRESS not set in environment variables");
    }

    console.log(`📝 Contract address: ${contractAddress}`);

    // Get deployer account
    const [deployer] = await hre.ethers.getSigners();
    console.log(`📝 Testing with account: ${deployer.address}`);

    // Get contract instance
    const Pepasur = await hre.ethers.getContractFactory("Pepasur");
    const pepasur = Pepasur.attach(contractAddress);

    // Test parameters
    const stakeAmount = hre.ethers.parseEther("0.01"); // 0.01 tokens
    const minPlayers = 4;

    console.log(`\n📋 Test Parameters:`);
    console.log(`   Stake Amount: ${hre.ethers.formatEther(stakeAmount)} tokens`);
    console.log(`   Min Players: ${minPlayers}`);

    // Create game
    console.log("\n⏳ Creating test game...");
    const tx = await pepasur.createGame(stakeAmount, minPlayers);
    console.log(`📝 Transaction hash: ${tx.hash}`);

    console.log("⏳ Waiting for confirmation...");
    const receipt = await tx.wait();
    console.log(`✅ Transaction confirmed in block ${receipt.blockNumber}`);

    // Extract game ID from events
    const gameCreatedEvent = receipt.logs.find(
        log => {
            try {
                const parsed = pepasur.interface.parseLog(log);
                return parsed && parsed.name === "GameCreated";
            } catch {
                return false;
            }
        }
    );

    if (gameCreatedEvent) {
        const parsed = pepasur.interface.parseLog(gameCreatedEvent);
        const gameId = parsed.args[0];
        console.log(`\n🎮 Game Created!`);
        console.log(`   Game ID: ${gameId}`);

        // Get game info
        const game = await pepasur.games(gameId);
        console.log(`\n📋 Game Details:`);
        console.log(`   Creator: ${game.creator}`);
        console.log(`   Stake: ${hre.ethers.formatEther(game.stakeAmount)} tokens`);
        console.log(`   Min Players: ${game.minPlayers}`);
        console.log(`   Status: ${game.status}`);
        console.log(`   Total Pool: ${hre.ethers.formatEther(game.totalPool)} tokens`);
    }

    console.log("\n✅ Game creation test successful!\n");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("\n❌ Test failed:");
        console.error(error);
        process.exit(1);
    });
