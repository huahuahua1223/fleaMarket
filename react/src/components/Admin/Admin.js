// Admin.js
import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import { useParams, Link } from 'react-router-dom';
import '../../static/css/app.css'; // 导入 CSS 文件
import { Card, Typography, Spin, Alert } from 'antd';

import AdminABI from '../../contract/ABIs/Admin.json'; // 管理员合约 ABI

const { Title, Paragraph } = Typography;
const Admin = () => {
    const [web3, setWeb3] = useState(null);
    // 使用 useParams 获取路由参数中的地址信息
    const { address } = useParams();
    const [contractAdmin, setcontractAdmin] = useState(null);
    const [isAdmin, setisAdmin] = useState(false);

    const [adminInfo, setAdminInfo] = useState({ userName: '', adminNo: '', phone: '', gender: false });
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

                    // 创建管理员合约实例
                    const adminInstance = new web3Instance.eth.Contract(
                        AdminABI,
                        address
                    );
                    setcontractAdmin(adminInstance);

                    // 获取当前用户的以太坊账户地址
                    const accounts = await web3Instance.eth.getAccounts();
                    const currentAddress = accounts[0];
                    // 获取管理员合约的 owner 地址
                    const ownerAddress = await adminInstance.methods.getOwner().call();
                    // 检查当前账户是否是管理员本人
                    setisAdmin(currentAddress === ownerAddress);

                    await getAdminInfo(adminInstance);
                    await getPasswordHash(adminInstance);
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
    const getAdminInfo = async (adminInstance) => {
        try {
            const result = await adminInstance.methods.getAdminInfo().call();
            console.log(result)
            const userName = result[0];
            const adminNo = result[1];
            const phone = result[2];
            const gender = result[3];
            setAdminInfo({ userName, adminNo, phone, gender });
        } catch (error) {
            console.error(error);
        }
    };

    const getPasswordHash = async (adminInstance) => {
        try {
            const password = await adminInstance.methods.getPasswordHash().call();
            setPasswordHash(password);
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div style={{ padding: '20px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            {!isAdmin && !loading && (
                <Alert message="您没有权限访问此页面。" type="error" />
            )}

            {isAdmin && !loading && (
                <Card hoverable style={{ width: 400 }}>
                    <Typography>
                        <Title level={2}>管理员端首页</Title>
                        <Paragraph>管理员地址：{address}</Paragraph>
                        <Paragraph>管理员用户名：{adminInfo.userName}</Paragraph>
                        <Paragraph>管理员编号：{adminInfo.adminNo}</Paragraph>
                        <Paragraph>管理员性别：{adminInfo.gender ? '男' : '女'}</Paragraph>
                        <Paragraph>管理员电话：{adminInfo.phone}</Paragraph>
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

export default Admin;
