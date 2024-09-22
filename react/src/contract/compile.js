const solc = require('solc');
const fs = require('fs');
const path = require('path');

// 合约文件路径
const contractFilePath = path.join(__dirname, 'fleaMarket.sol');
const abisDir = path.join(__dirname, 'ABIs');

// 清空 ABIs 目录中的旧文件
if (fs.existsSync(abisDir)) {
    fs.readdirSync(abisDir).forEach(file => {
        const filePath = path.join(abisDir, file);
        fs.unlinkSync(filePath);
        console.log(`Removed old ABI file: ${filePath}`);
    });
}

// 读取合约文件内容
const contractContent = fs.readFileSync(contractFilePath, 'utf8');

// 编译合约
const input = {
    language: 'Solidity',
    sources: {
        [contractFilePath]: {
            content: contractContent,
        },
    },
    settings: {
        outputSelection: {
            '*': {
                '*': ['abi'], // 编译输出 ABI
            },
        },
    },
};

const output = JSON.parse(solc.compile(JSON.stringify(input)));

// 检查编译错误
if (output.errors) {
    output.errors.forEach((err) => {
        console.error(err.formattedMessage);
    });
    process.exit(1);
}

// 创建 ABIs 目录（如果不存在）
if (!fs.existsSync(abisDir)) {
    fs.mkdirSync(abisDir, { recursive: true });
}

// 保存 ABI 文件
Object.keys(output.contracts[contractFilePath]).forEach((contractName) => {
    const contractOutput = output.contracts[contractFilePath][contractName];
    
    // 保存 ABI 文件
    const abi = contractOutput.abi;
    const abiFilePath = path.join(abisDir, `${contractName}.json`);
    fs.writeFileSync(abiFilePath, JSON.stringify(abi, null, 2));
    console.log(`ABI for ${contractName} saved to ${abiFilePath}`);

});
