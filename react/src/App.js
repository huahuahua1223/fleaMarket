import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import Routes from './routes';
import Web3 from 'web3';


function App() {
  const [currentAccount, setCurrentAccount] = useState('');
  const [currentNetwork, setCurrentNetwork] = useState('');
  // const [reloadApp, setReloadApp] = useState(false); // 触发界面重新加载
  const [key, setKey] = useState(0);

  useEffect(() => {
    async function loadWeb3() {
      if (window.ethereum) {
        const web3 = new Web3(window.ethereum);
        try {
          // 请求用户授权连接到以太坊
          await window.ethereum.enable();
          // 获取当前账户地址
          const accounts = await web3.eth.getAccounts();
          setCurrentAccount(accounts[0]);

          // 监听账户变化事件
          window.ethereum.on('accountsChanged', function (accounts) {
            console.log(accounts[0])
            setCurrentAccount(accounts[0]);
            setKey(prevKey => prevKey + 1); // 更新 key 以触发重新加载
          });

          // 获取当前网络ID
          const networkId = await web3.eth.net.getId();
          setCurrentNetwork(networkId);

          // 监听网络变化事件
          window.ethereum.on('networkChanged', function (networkId) {
            console.log(networkId)
            setCurrentNetwork(networkId);
            setKey(prevKey => prevKey + 1); // 更新 key 以触发重新加载
          });
        } catch (error) {
          console.error('用户拒绝授权连接到以太坊或者其他错误：', error);
        }
      } else {
        console.error('请安装以太坊浏览器插件，如 MetaMask');
      }
    }

    loadWeb3();
  }, []); // 空数组作为依赖，确保只在组件挂载时执行一次

  return (
    <div key={key}>
      <Router>
        <div className="App">
          <Routes />
        </div>
      </Router>
    </div>
  );
}

export default App;