import { ethers } from 'hardhat';
import * as fs from 'fs';
import * as path from 'path';

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log('Deploying with account:', deployer.address);
  console.log('Balance:', ethers.formatEther(await ethers.provider.getBalance(deployer.address)), 'OG');

  const Factory = await ethers.getContractFactory('MnemeAttestation');
  const contract = await Factory.deploy();
  await contract.waitForDeployment();

  const address = await contract.getAddress();
  console.log('MnemeAttestation deployed to:', address);

  const output = {
    address,
    network: (await ethers.provider.getNetwork()).name,
    chainId: Number((await ethers.provider.getNetwork()).chainId),
    deployedAt: new Date().toISOString(),
  };

  const outPath = path.join(__dirname, '../../.contract.json');
  fs.writeFileSync(outPath, JSON.stringify(output, null, 2));
  console.log('Contract address saved to .contract.json');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
