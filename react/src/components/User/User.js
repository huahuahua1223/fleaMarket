// User.js
import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import { useParams, Link } from 'react-router-dom';
import '../../static/css/app.css'; // 导入 CSS 文件
import { Card, Typography, Spin, Alert } from 'antd';

import EvaluationListABI from '../../contract/ABIs/EvaluationList.json'; // 评价列表合约 ABI
import UserListABI from '../../contract/ABIs/UserList.json'; // 用户列表合约 ABI
import UserABI from '../../contract/ABIs/User.json'; // 用户合约 ABI                            

import EvaluationListAddress from '../../contract/ADDRESSes/EvaluationListAddress'; // 评价列表合约地址
import UserListAddress from '../../contract/ADDRESSes/UserListAddress'; // 用户列表合约地址
const { Title, Paragraph } = Typography;

const User = () => {
    const [web3, setWeb3] = useState(null);
    // 使用 useParams 获取路由参数中的地址信息
    const { address } = useParams();
    const [contractEvaluationList, setcontractEvaluationList] = useState(null);
    const [contractUserList, setcontractUserList] = useState(null);
    const [contractUser, setcontractUser] = useState(null);
    const [isUser, setisUser] = useState(false);

    const [balance, setBalance] = useState(null);
    const [rate, setRate] = useState(null);
    const [userInfo, setUserInfo] = useState({ userName: '', gender: false, phone: '' });
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

                    // 创建用户列表合约实例
                    const UserListInstance = new web3Instance.eth.Contract(
                        UserListABI,
                        UserListAddress
                    );
                    setcontractUserList(UserListInstance);

                    // 创建用户合约实例
                    const userInstance = new web3Instance.eth.Contract(
                        UserABI,
                        address
                    );
                    setcontractUser(userInstance);

                    // 获取当前用户的以太坊账户地址
                    const accounts = await web3Instance.eth.getAccounts();
                    const currentAddress = accounts[0];
                    // 获取用户合约的 owner 地址
                    const ownerAddress = await userInstance.methods.getOwner().call();
                    // 检查当前账户是否是用户本人
                    setisUser(currentAddress === ownerAddress);

                    await GetBalance(web3Instance,userInstance);
                    await GetRate(web3Instance,evaluationListInstance);
                    await getUserInfo(userInstance);
                    await getPasswordHash(userInstance);
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

    // 获取用户余额
    const GetBalance = async (web3Instance,userInstance) => {
        if (userInstance) {
            try {
                // 获取当前用户的以太坊账户地址
                const accounts = await web3Instance.eth.getAccounts();
                const fromAddress = accounts[0];
                console.log("fromAddress:", fromAddress);
                const balance = await userInstance.methods.getBalance().call({ from: fromAddress });
                console.log("balance",balance)
                setBalance(balance); 
                // alert('添加保险方案成功！');
            } catch (error) {
                console.error(error);
                alert('查询失败！');
            }
        };
    };

    // 获取用户信用评分
    const GetRate = async (web3Instance,evaluationListInstance) => {
        if (evaluationListInstance) {
            try {
                // 获取当前用户的以太坊账户地址
                const accounts = await web3Instance.eth.getAccounts();
                const fromAddress = accounts[0];
                console.log("fromAddress:", fromAddress);
                const rate = await evaluationListInstance.methods.getUserRating(address).call({ from: fromAddress });
                const userRating = Number(rate) / 10; // 将整数评分转换为带有一位小数的浮点数
                console.log("userRating",userRating)
                setRate(userRating); 
                // alert('添加保险方案成功！');
            } catch (error) {
                console.error(error);
                // alert('查询失败！');
            }
        };
    };

    const getUserInfo = async (userInstance) => {
        try {
            const result = await userInstance.methods.getOwnerInfo().call();
            console.log(result)
            const userName = result[0];
            const gender = result[1];
            const phone = result[2];
            setUserInfo({ userName, gender, phone });
        } catch (error) {
            console.error(error);
        }
    };

    const getPasswordHash = async (userInstance) => {
        try {
            const password = await userInstance.methods.getPasswordHash().call();
            setPasswordHash(password);
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div style={{ padding: '20px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            {!isUser && !loading && (
                <Alert message="您没有权限访问此页面。" type="error" />
            )}

            {isUser && !loading && (
                <Card hoverable style={{ width: 400 }}>
                    <Typography>
                        <Title level={2}>用户端首页</Title>
                        <Paragraph>用户地址：{address}</Paragraph>
                        <Paragraph>用户余额：{balance !== null ? balance.toString() : '加载中...'}</Paragraph>
                        <Paragraph>用户评分：{rate !== null ? rate.toString() : '加载中...'}</Paragraph>
                        <Paragraph>用户名：{userInfo.userName}</Paragraph>
                        <Paragraph>用户性别：{userInfo.gender ? '男' : '女'}</Paragraph>
                        <Paragraph>用户电话：{userInfo.phone}</Paragraph>
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

export default User;
