const { ethers } = require("hardhat");

async function main() {
  // Get the contract factory
  const SpermAnalysisNFT = await ethers.getContractFactory("SpermAnalysisNFT");
  
  // Deploy the contract
  console.log("Deploying SpermAnalysisNFT...");
  const nft = await SpermAnalysisNFT.deploy();
  
  // Wait for deployment to finish
  await nft.waitForDeployment();
  
  // Get the deployed contract address
  const address = await nft.getAddress();
  console.log("SpermAnalysisNFT deployed to:", address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 