// Reviewer.js
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Web3 from 'web3';
import { Card, Typography, Spin, Alert } from 'antd';

import EvaluationListABI from '../../contract/ABIs/EvaluationList.json'; // 评价列表合约 ABI
import MerchantListABI from '../../contract/ABIs/MerchantList.json'; // 商家列表合约 ABI
import MerchantABI from '../../contract/ABIs/Merchant.json'; // 商家合约 ABI

import EvaluationListAddress from '../../contract/ADDRESSes/EvaluationListAddress'; // 评价列表合约地址
import MerchantListAddress from '../../contract/ADDRESSes/MerchantListAddress'; // 商家列表合约地址


import '../../static/css/app.css'; // 导入 CSS 文件

const { Title, Paragraph } = Typography;
const Merchant = () => {
    // 使用 useParams 获取路由参数中的地址信息
    const { address } = useParams();
    const [web3, setWeb3] = useState(null);
    const [contractEvaluationList, setcontractEvaluationList] = useState(null);
    const [contractMerchantList, setcontractMerchantList] = useState(null);
    const [contractMerchant, setcontractMerchant] = useState(null);
    const [isMerchant, setisMerchant] = useState(false);

    const [balance, setBalance] = useState(null);
    const [rate, setRate] = useState(null);
    const [merchantInfo, setMerchantInfo] = useState({ userName: '', phone: '', merchantNo: '' });
    const [passwordHash, setPasswordHash] = useState('');

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function init() {
            // 连接到以太坊网络
            if (window.ethereum) {
                const web3Instance = new Web3(window.ethereum);
                try {
                    // 请求用户授权
                    await window.ethereum.enable();
                    setWeb3(web3Instance);

                    // 创建评价列表合约实例
                    const evaluationListInstance = new web3Instance.eth.Contract(
                        EvaluationListABI,
                        EvaluationListAddress
                      );
                      setcontractEvaluationList(evaluationListInstance);

                    // 创建商家合约实例
                    const merchantInstance = new web3Instance.eth.Contract(
                        MerchantABI,
                        address
                    );
                    setcontractMerchant(merchantInstance);

                    // 创建商家列表合约实例
                    const merchantListInstance = new web3Instance.eth.Contract(
                        MerchantListABI,
                        MerchantListAddress
                    );
                    setcontractMerchantList(merchantListInstance);
                    // 获取当前用户的以太坊账户地址
                    const accounts = await web3Instance.eth.getAccounts();
                    const currentAddress = accounts[0];
                    // 获取用户合约的 owner 地址
                    const ownerAddress = await merchantInstance.methods.getOwner().call();
                    // 检查当前账户是否是用户本人
                    setisMerchant(currentAddress === ownerAddress);

                    await GetBalance(web3Instance,merchantInstance);
                    await GetRate(web3Instance,evaluationListInstance);
                    await getMerchantInfo(merchantInstance);
                    await getPasswordHash(merchantInstance);
                } catch (error) {
                    console.error(error);
                } finally {
                    setLoading(false);
                }
            } else {
                console.error('请安装以太坊浏览器插件，如 MetaMask');
            }
        }
        init();
    }, [address]);

    // 获取商家余额
    const GetBalance = async (web3Instance,merchantInstance) => {
        if (merchantInstance) {
            try {
                // 获取当前用户的以太坊账户地址
                const accounts = await web3Instance.eth.getAccounts();
                const fromAddress = accounts[0];
                console.log("fromAddress:", fromAddress);
                const balance = await merchantInstance.methods.getBalance().call({ from: fromAddress });
                console.log("balance",balance)
                setBalance(balance); 
                // alert('添加保险方案成功！');
            } catch (error) {
                console.error(error);
                alert('查询失败！');
            }
        };
    };

    // 获取商家信用评分
    const GetRate = async (web3Instance,evaluationListInstance) => {
        if (evaluationListInstance) {
            try {
                // 获取当前用户的以太坊账户地址
                const accounts = await web3Instance.eth.getAccounts();
                const fromAddress = accounts[0];
                console.log("fromAddress:", fromAddress);
                const rate = await evaluationListInstance.methods.getMerchantRating(address).call({ from: fromAddress });
                const merchantRating = Number(rate) / 10; // 将整数评分转换为带有一位小数的浮点数
                console.log("merchantRating",merchantRating)
                setRate(merchantRating); 
            } catch (error) {
                console.error(error);
                // alert('查询失败！');
            }
        };
    };

    const getMerchantInfo = async (merchantInstance) => {
        try {
            const result = await merchantInstance.methods.getMerchantInfo().call();
            console.log(result)
            const userName = result[0];
            const phone = result[1];
            const merchantNo = result[2];
            setMerchantInfo({ userName, phone, merchantNo });
        } catch (error) {
            console.error(error);
        }
    };

    const getPasswordHash = async (merchantInstance) => {
        try {
            const password = await merchantInstance.methods.getPasswordHash().call();
            setPasswordHash(password);
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div style={{ padding: '20px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            {!isMerchant && !loading && (
                <Alert message="您没有权限访问此页面。" type="error" />
            )}

            {isMerchant && !loading && (
                <Card hoverable style={{ width: 400 }}>
                    <Typography>
                        <Title level={2}>商家端首页</Title>
                        <Paragraph>商家地址：{address}</Paragraph>
                        <Paragraph>商家余额：{balance !== null ? balance.toString() : '加载中...'}</Paragraph>
                        <Paragraph>商家评分：{rate !== null ? rate.toString() : '加载中...'}</Paragraph>
                        <Paragraph>商家用户名：{merchantInfo.userName}</Paragraph>
                        <Paragraph>商家电话号码：{merchantInfo.phone}</Paragraph>
                        <Paragraph>商家编号：{merchantInfo.merchantNo}</Paragraph>
                        <Paragraph>密码 Hash: {passwordHash}</Paragraph>
                    </Typography>
                </Card>
            )}

            {loading && (
                <Spin tip="加载中..." />
            )}
        </div>
    );
}

export default Merchant;
