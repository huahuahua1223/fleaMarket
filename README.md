# fleaMarket
DAPP二手交易市场

---
分为hardhat部署合约和react启动前端项目，连接的是8888端口的本地geth私链
# 使用教程
1. 拉取代码后分别下载hardhat和react文件夹的依赖
```bash
npm i
```
2. 启动geth私链
3. 在hardhat文件夹运行
```bash
# 编译合约
npm run compile
```

```bash
# 部署合约
npm run deploy
```
再将hardhat文件夹下`contract-addresses.json`文件里面的内容复制到`react/src/contract/address.json`里面
4.  在react文件夹运行
```bash
# 编译合约
node .\src\contract\compile.js
```

```bash
# 启动项目
npm start
```
