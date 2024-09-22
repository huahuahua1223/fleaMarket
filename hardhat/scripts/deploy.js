// scripts/deploy.js
const hre = require("hardhat");
const fs = require('fs');

// npx hardhat compile
// npx hardhat run .\scripts\deploy.js
async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  //部署UserList合约
  const ContractUserList = await hre.ethers.getContractFactory("contracts/fleaMarket.sol:UserList");
  const contractUserList = await ContractUserList.deploy();
  console.log("UserList deployed to:", contractUserList.target);

  // 部署MerchantList合约
  const ContractMerchantList = await hre.ethers.getContractFactory("contracts/fleaMarket.sol:MerchantList");
  const contractMerchantList = await ContractMerchantList.deploy();
  console.log("MerchantList deployed to:", contractMerchantList.target);

  // 部署AdminList合约
  const ContractAdminList = await hre.ethers.getContractFactory("contracts/fleaMarket.sol:AdminList");
  const contractAdminList = await ContractAdminList.deploy();
  console.log("AdminList deployed to:", contractAdminList.target);

  // 部署EvaluationList合约
  const ContractEvaluationList = await hre.ethers.getContractFactory("contracts/fleaMarket.sol:EvaluationList");
  const contractEvaluationList = await ContractEvaluationList.deploy();
  console.log("EvaluationList deployed to:", contractEvaluationList.target);

  // 部署ProductList合约
  const ContractProductList = await hre.ethers.getContractFactory("contracts/fleaMarket.sol:ProductList");
  const contractProductList = await ContractProductList.deploy();
  console.log("ProductList deployed to:", contractProductList.target);

  // 将所有合约地址保存到一个JSON文件中
  const contractAddresses = {
    UserListAddr: contractUserList.target,
    MerchantListAddr: contractMerchantList.target,
    AdminListAddr: contractAdminList.target,
    EvaluationListAddr: contractEvaluationList.target,
    ProductListAddr: contractProductList.target
  };

  fs.writeFileSync('contract-addresses.json', JSON.stringify(contractAddresses, null, 2));
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });

