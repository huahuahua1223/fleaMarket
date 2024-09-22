import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import { useNavigate, Link } from 'react-router-dom';
import { Layout, Menu, Form, Input, Button, Select, message } from 'antd';
import {
    UserOutlined,
    LockOutlined,
    HomeOutlined,
    LoginOutlined,
    FormOutlined
} from '@ant-design/icons';
import bcrypt from 'bcryptjs';

import UserListABI from '../contract/ABIs/UserList.json'; // 用户列表合约 ABI
import MerchantListABI from '../contract/ABIs/MerchantList.json'; // 商家列表合约 ABI
import AdminListABI from '../contract/ABIs/AdminList.json'; // 管理员列表合约 ABI
import UserABI from '../contract/ABIs/User.json'; // 用户合约 ABI
import MerchantABI from '../contract/ABIs/Merchant.json'; // 商家合约 ABI
import AdminABI from '../contract/ABIs/Admin.json'; // 管理员合约 ABI

import UserListAddress from '../contract/ADDRESSes/UserListAddress'; // 用户列表合约地址
import MerchantListAddress from '../contract/ADDRESSes/MerchantListAddress'; // 商家列表合约地址
import AdminListAddress from '../contract/ADDRESSes/AdminListAddress'; // 管理员列表合约地址
import '../static/css/app.css'; // 导入 CSS 文件

const { Header, Content, Footer } = Layout;
const { Option } = Select;

const Login = () => {
    const [web3, setWeb3] = useState(null);
    const [contractUserList, setContractUserList] = useState(null);
    const [contractMerchantList, setContractMerchantList] = useState(null);
    const [contractAdminList, setContractAdminList] = useState(null);
    const [userName, setUserName] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('user'); // 默认角色为用户
    const navigate = useNavigate();

    useEffect(() => {
        async function init() {
            if (window.ethereum) {
                const web3Instance = new Web3(window.ethereum);
                try {
                    await window.ethereum.enable();
                    setWeb3(web3Instance);

                    const userListInstance = new web3Instance.eth.Contract(
                        UserListABI,
                        UserListAddress
                    );
                    setContractUserList(userListInstance);

                    const merchantListInstance = new web3Instance.eth.Contract(
                        MerchantListABI,
                        MerchantListAddress
                    );
                    setContractMerchantList(merchantListInstance);

                    const adminListInstance = new web3Instance.eth.Contract(
                        AdminListABI,
                        AdminListAddress
                    );
                    setContractAdminList(adminListInstance);

                } catch (error) {
                    console.error(error);
                }
            } else {
                console.error('请安装以太坊浏览器插件，如 MetaMask');
            }
        }
        init();
    }, []);

    const clearInputs = () => {
        setUserName('');
        setPassword('');
    };

    const handleLogin = async (loginFunction) => {
        try {
            await loginFunction();
            clearInputs();
        } catch (error) {
            console.error(error);
            message.error('登录失败，请重试！');
        }
    };

    const LoginUser = async () => {
        if (contractUserList) {
            try {
                const accounts = await web3.eth.getAccounts();
                const fromAddress = accounts[0];
                const UserAddress = await contractUserList.methods.getUserAddress(fromAddress).call();
                const isFull = await contractUserList.methods.isNotRegistered(UserAddress).call();
                if (isFull) {
                    // const verifyPwd = await contractUserList.methods.verifyPwd(userName, password).call({ from: fromAddress });
                    const storedHash = await contractUserList.methods.getPasswordHashByUsername(userName).call({ from: fromAddress });
                    console.log("链上密码哈希：",storedHash)
                    console.log("输入密码：",password)
                    const verifyPwd = await bcrypt.compare(password, storedHash);
                    if (verifyPwd) {
                        const userContract = new web3.eth.Contract(UserABI, UserAddress);
                        message.success('用户登录成功！');
                        navigate(`/user/${UserAddress}`);
                    } else {
                        message.error('账号或密码错误！');
                    }
                } else {
                    message.error('用户未注册！');
                }
            } catch (error) {
                console.error(error);
                message.error('用户登录失败！');
            }
        }
    };

    const LoginMerchant = async () => {
        if (contractMerchantList) {
            try {
                const accounts = await web3.eth.getAccounts();
                const fromAddress = accounts[0];
                const MerchantAddress = await contractMerchantList.methods.getMerchantAddress(fromAddress).call();
                const isFull = await contractMerchantList.methods.isNotRegistered(MerchantAddress).call();
                if (isFull) {
                    // const verifyPwd = await contractMerchantList.methods.verifyPwd(userName, password).call({ from: fromAddress });
                    const storedHash = await contractMerchantList.methods.getPasswordHashByUsername(userName).call({ from: fromAddress });
                    const verifyPwd = await bcrypt.compare(password, storedHash);
                    if (verifyPwd) {
                        const merchantContract = new web3.eth.Contract(MerchantABI, MerchantAddress);
                        message.success('商家登录成功！');
                        navigate(`/merchant/${MerchantAddress}`);
                    } else {
                        message.error('账号或密码错误！');
                    }
                } else {
                    message.error('商家未注册！');
                }
            } catch (error) {
                console.error(error);
                message.error('商家登录失败！');
            }
        }
    };

    const LoginAdmin = async () => {
        if (contractAdminList) {
            try {
                const accounts = await web3.eth.getAccounts();
                const fromAddress = accounts[0];
                const AdminAddress = await contractAdminList.methods.getAdminAddress(fromAddress).call();
                const isFull = await contractAdminList.methods.isNotRegistered(AdminAddress).call();
                if (isFull) {
                    // const verifyPwd = await contractAdminList.methods.verifyPwd(userName, password).call({ from: fromAddress });
                    const storedHash = await contractAdminList.methods.getPasswordHashByUsername(userName).call({ from: fromAddress });
                    const verifyPwd = await bcrypt.compare(password, storedHash);
                    if (verifyPwd) {
                        const adminContract = new web3.eth.Contract(AdminABI, AdminAddress);
                        message.success('管理员登录成功！');
                        navigate(`/admin/${AdminAddress}`);
                    } else {
                        message.error('账号或密码错误！');
                    }
                } else {
                    message.error('管理员未注册！');
                }
            } catch (error) {
                console.error(error);
                message.error('管理员登录失败！');
            }
        }
    };

    const loginFunctions = {
        user: LoginUser,
        merchant: LoginMerchant,
        admin: LoginAdmin,
    };

    const handleSubmit = async () => {
        handleLogin(loginFunctions[role]);
    };

    return (
        <Layout className="layout" style={{ minHeight: '100vh' }}>
            <Header>
                <Menu theme="dark" mode="horizontal" defaultSelectedKeys={['login']}>
                    <Menu.Item key="home" icon={<HomeOutlined />}>
                        <Link to="/">系统首页</Link>
                    </Menu.Item>
                    <Menu.Item key="login" icon={<LoginOutlined />}>
                        <Link to="/login">登录</Link>
                    </Menu.Item>
                    <Menu.Item key="register" icon={<FormOutlined />}>
                        <Link to="/register">注册</Link>
                    </Menu.Item>
                </Menu>
            </Header>
            <Content style={{ padding: '0 50px', marginTop: 64 }}>
                <div className="site-layout-content">
                    <Form
                        name="login_form"
                        className="login-form"
                        initialValues={{ role }}
                        onFinish={handleSubmit}
                        style={{ maxWidth: '400px', margin: '0 auto', padding: '24px', background: '#fff', borderRadius: '8px' }}
                    >
                        <Form.Item name="role" label="角色">
                            <Select value={role} onChange={(value) => setRole(value)}>
                                <Option value="user">用户</Option>
                                <Option value="merchant">商家</Option>
                                <Option value="admin">管理员</Option>
                            </Select>
                        </Form.Item>
                        <Form.Item
                            name="userName"
                            rules={[{ required: true, message: '请输入用户名!' }]}
                        >
                            <Input
                                prefix={<UserOutlined />}
                                placeholder="用户名"
                                value={userName}
                                onChange={(e) => setUserName(e.target.value)}
                            />
                        </Form.Item>
                        <Form.Item
                            name="password"
                            rules={[{ required: true, message: '请输入密码!' }]}
                        >
                            <Input.Password
                                prefix={<LockOutlined />}
                                type="password"
                                placeholder="密码"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </Form.Item>
                        <Form.Item>
                            <Button type="primary" htmlType="submit" className="login-form-button" block>
                                登录
                            </Button>
                        </Form.Item>
                    </Form>
                </div>
            </Content>
            <Footer style={{ textAlign: 'center' }}>花花DAPP ©2024</Footer>
        </Layout>
    );
};

export default Login;
