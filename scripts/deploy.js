const hre = require("hardhat");
const { ethers, network } = hre;

const main = async () => {

    const [deployer] = await ethers.getSigners();
    const { chainId } = await deployer.provider.getNetwork();

    const balance = await deployer.provider.getBalance(deployer.address);
    const balanceETH = ethers.formatEther(balance);


    console.log(`Network: ${network.name}(chinId: ${chainId})`);
    console.log(`Deployer Address: ${deployer.address}`);
    console.log(`Deployer Balance In ETH: ${balanceETH}`);


    const Cryptoera = await ethers.getContractFactory("Cryptoera", deployer);
    const token = await Cryptoera.deploy();
    await token.waitForDeployment();

    const contarctAddress = await token.getAddress();

    const DeploymentTx = token.deploymentTransaction();
    const txHash = DeploymentTx ? DeploymentTx.hash : "N/A";

    const totalSupply = await token.totalSupply();
    const totalSupplyFormatted = ethers.formatUnits(totalSupply, 18);


    console.log(`Token Contract Address: ${contarctAddress}`);
    console.log(`Token Transaction Hash#: ${txHash}`);
    console.log(`Token Total Supply Wei Unit: ${totalSupply}`);
    console.log(`Token Total Supply Formatted in Real Token: ${totalSupplyFormatted}`);


}

main().catch((error) => {
    console.error("Deployment Failed");
    console.error(error);
    process.exitCode = 1;


});