const fs = require('fs');
// const Web3 = require('web3');
const { Web3 } = require('web3');
const path = require('path');

// 读取 ABI 文件和合约字节码
const activityListABI = require('./ABIs/ActivityList.json');
const materialListABI = require('./ABIs/MaterialList.json');
const adminListABI = require('./ABIs/AdminList.json');
const reviewerListABI = require('./ABIs/ReviewerList.json');
const userListABI = require('./ABIs/UserList.json');

// 构建字节码文件的绝对路径
const activityListBytecodePath = path.join(__dirname, 'ABIs', 'ActivityList_bytecode.txt');
const materialListBytecodePath = path.join(__dirname, 'ABIs', 'MaterialList_bytecode.txt');
const adminListBytecodePath = path.join(__dirname, 'ABIs', 'AdminList_bytecode.txt');
const reviewerListBytecodePath = path.join(__dirname, 'ABIs', 'ReviewerList_bytecode.txt');
const userListBytecodePath = path.join(__dirname, 'ABIs', 'UserList_bytecode.txt');

const activityListBytecode = fs.readFileSync(activityListBytecodePath, 'utf8');
const materialListBytecode = fs.readFileSync(materialListBytecodePath, 'utf8');
const adminListBytecode = fs.readFileSync(adminListBytecodePath, 'utf8');
const reviewerListBytecode = fs.readFileSync(reviewerListBytecodePath, 'utf8');
const userListBytecode = fs.readFileSync(userListBytecodePath, 'utf8');

// 设置 Web3 连接
// const web3 = new Web3('http://localhost:8888'); // 使用正确的以太坊节点地址
// 以太坊节点地址
// const ethereumNodeUrl = 'http://localhost:8888'; // 用你的以太坊节点地址替换这里

// 创建一个 Web3 实例，并指定以太坊节点地址
const web3 = new Web3('http://localhost:8888');
// const web3 = new Web3('http://127.0.0.1:8888');

// 部署合约函数
async function deployContract(abi, bytecode) {
    const accounts = await web3.eth.getAccounts();
    const contract = new web3.eth.Contract(abi);
    const deploy = contract.deploy({ data: '0x' + bytecode }); // 注意添加 '0x' 前缀
    const gas = await deploy.estimateGas();
    const instance = await deploy.send({
        from: accounts[0],
        gas: gas,
    });
    return instance.options.address;
}

// 部署合约并写入地址到 JSON 文件
async function deployAndWriteAddress() {
    try {
        const activityListAddress = await deployContract(activityListABI, activityListBytecode);
        const materialListAddress = await deployContract(materialListABI, materialListBytecode);
        const adminListAddress = await deployContract(adminListABI, adminListBytecode);
        const reviewerListAddress = await deployContract(reviewerListABI, reviewerListBytecode);
        const userListAddress = await deployContract(userListABI, userListBytecode);

        const addresses = {
            activityList: activityListAddress,
            materialList: materialListAddress,
            adminList: adminListAddress,
            reviewerList: reviewerListAddress,
            userList: userListAddress,
        };

        fs.writeFileSync(path.join(__dirname, 'address.json'), JSON.stringify(addresses, null, 2));
        console.log('Addresses written to address.json');
    } catch (error) {
        console.error('Error deploying contracts:', error);
    }
}

// 执行部署函数
deployAndWriteAddress();
