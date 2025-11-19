import hre from "hardhat";

async function main() {
    const network = hre.network.name;
    console.log(`\n💰 Checking balance on ${network}...`);

    // Get deployer account
    const [deployer] = await hre.ethers.getSigners();
    console.log(`📝 Account: ${deployer.address}`);

    // Get balance
    const balance = await hre.ethers.provider.getBalance(deployer.address);
    const formattedBalance = hre.ethers.formatEther(balance);

    // Determine token symbol
    let symbol = "ETH";
    if (network === "u2u" || network === "u2uTestnet") {
        symbol = "U2U";
    } else if (network.includes("celo")) {
        symbol = "CELO";
    }

    console.log(`💵 Balance: ${formattedBalance} ${symbol}`);

    // Check if balance is sufficient for deployment
    const minBalance = hre.ethers.parseEther("0.1");
    if (balance < minBalance) {
        console.log(`\n⚠️  WARNING: Balance is low. Recommended minimum: 0.1 ${symbol}`);
        console.log(`   You may not have enough for deployment and initialization.`);
    } else {
        console.log(`\n✅ Balance is sufficient for deployment`);
    }

    console.log();
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("\n❌ Error:");
        console.error(error);
        process.exit(1);
    });
