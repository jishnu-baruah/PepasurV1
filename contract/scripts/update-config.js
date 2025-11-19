import hre from "hardhat";

async function main() {
    const network = hre.network.name;
    console.log(`\n🔧 Updating contract configuration on ${network}...`);

    // Get contract address
    const contractAddress = process.env.CONTRACT_ADDRESS;
    if (!contractAddress) {
        throw new Error("CONTRACT_ADDRESS not set in environment variables");
    }

    console.log(`📝 Contract address: ${contractAddress}`);

    // Get deployer account (must be admin)
    const [admin] = await hre.ethers.getSigners();
    console.log(`📝 Admin account: ${admin.address}`);

    // Get contract instance
    const Pepasur = await hre.ethers.getContractFactory("Pepasur");
    const pepasur = Pepasur.attach(contractAddress);

    // Verify admin
    const contractAdmin = await pepasur.admin();
    if (contractAdmin.toLowerCase() !== admin.address.toLowerCase()) {
        throw new Error(`Not authorized. Contract admin is ${contractAdmin}`);
    }

    console.log("\n📋 Current Configuration:");
    const currentServerSigner = await pepasur.serverSigner();
    const currentFeeRecipient = await pepasur.feeRecipient();
    const currentHouseCut = await pepasur.houseCutBps();

    console.log(`   Server Signer: ${currentServerSigner}`);
    console.log(`   Fee Recipient: ${currentFeeRecipient}`);
    console.log(`   House Cut: ${currentHouseCut} bps (${Number(currentHouseCut) / 100}%)`);

    // Get new values from environment or use current
    const newServerSigner = process.env.NEW_SERVER_SIGNER_ADDRESS || currentServerSigner;
    const newFeeRecipient = process.env.NEW_FEE_RECIPIENT_ADDRESS || currentFeeRecipient;
    const newHouseCut = process.env.NEW_HOUSE_CUT_BPS || currentHouseCut;

    console.log("\n📋 New Configuration:");
    console.log(`   Server Signer: ${newServerSigner}`);
    console.log(`   Fee Recipient: ${newFeeRecipient}`);
    console.log(`   House Cut: ${newHouseCut} bps (${Number(newHouseCut) / 100}%)`);

    // Update server signer if changed
    if (newServerSigner.toLowerCase() !== currentServerSigner.toLowerCase()) {
        console.log("\n⏳ Updating server signer...");
        const tx1 = await pepasur.updateServerSigner(newServerSigner);
        await tx1.wait();
        console.log("✅ Server signer updated");
    }

    // Update fee recipient if changed
    if (newFeeRecipient.toLowerCase() !== currentFeeRecipient.toLowerCase()) {
        console.log("\n⏳ Updating fee recipient...");
        const tx2 = await pepasur.updateFeeRecipient(newFeeRecipient);
        await tx2.wait();
        console.log("✅ Fee recipient updated");
    }

    // Update house cut if changed
    if (Number(newHouseCut) !== Number(currentHouseCut)) {
        console.log("\n⏳ Updating house cut...");
        const tx3 = await pepasur.updateHouseCut(newHouseCut);
        await tx3.wait();
        console.log("✅ House cut updated");
    }

    console.log("\n✨ Configuration update complete!\n");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("\n❌ Update failed:");
        console.error(error);
        process.exit(1);
    });
