import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import { Link, useNavigate } from 'react-router-dom';
import { Layout, Menu, Form, Input, Button, Select, message } from 'antd';
import {
    UserOutlined,
    LockOutlined,
    HomeOutlined,
    LoginOutlined,
    FormOutlined
} from '@ant-design/icons';
import bcrypt from 'bcryptjs';

import ProductListABI from '../contract/ABIs/ProductList.json'; // 商品列表合约 ABI
import EvaluationListABI from '../contract/ABIs/EvaluationList.json'; // 评价列表合约 ABI
import UserListABI from '../contract/ABIs/UserList.json'; // 用户列表合约 ABI
import MerchantListABI from '../contract/ABIs/MerchantList.json'; // 商家列表合约 ABI
import AdminListABI from '../contract/ABIs/AdminList.json'; // 管理员列表合约 ABI

import ProductListAddress from '../contract/ADDRESSes/ProductListAddress'; // 商品列表合约地址
import EvaluationListAddress from '../contract/ADDRESSes/EvaluationListAddress'; // 评价列表合约地址
import UserListAddress from '../contract/ADDRESSes/UserListAddress'; // 用户列表合约地址
import MerchantListAddress from '../contract/ADDRESSes/MerchantListAddress'; // 商家列表合约地址
import AdminListAddress from '../contract/ADDRESSes/AdminListAddress'; // 管理员列表合约地址

import '../static/css/app.css'; // 导入 CSS 文件
const { Header, Content, Footer } = Layout;
const { Option } = Select;
const Register = () => {
  const [web3, setWeb3] = useState(null);
  const [contractUserList, setcontractUserList] = useState(null);
  const [contractMerchantList, setcontractMerchantList] = useState(null);
  const [contractAdminList, setcontractAdminList] = useState(null);
  const [contractProductList, setcontractProductList] = useState(null);
  const [contractEvaluationList, setcontractEvaluationList] = useState(null);

  const [userName, setUserName] = useState('');
  const [password, setPassword] = useState('');
  const [gender, setGender] = useState(true);
  const [phone, setPhone] = useState('');
  const [merchantNo, setMerchantNo] = useState('');
  const [adminNo, setAdminNo] = useState('');
  const [role, setRole] = useState('user'); // 默认角色为用户
  const navigate = useNavigate();

  useEffect(() => {
    async function init() {
      // 连接到以太坊网络
      if (window.ethereum) {
        const web3Instance = new Web3(window.ethereum);
        try {
          // 请求用户授权
          await window.ethereum.enable();
          setWeb3(web3Instance);

          // 创建商品列表合约实例
          const productListInstance = new web3Instance.eth.Contract(
            ProductListABI,
            ProductListAddress
          );
          setcontractProductList(productListInstance);

          // 创建评价列表合约实例
          const evaluationListInstance = new web3Instance.eth.Contract(
            EvaluationListABI,
            EvaluationListAddress
          );
          setcontractEvaluationList(evaluationListInstance);

          // 创建用户列表合约实例
          const userListInstance = new web3Instance.eth.Contract(
            UserListABI,
            UserListAddress
          );
          setcontractUserList(userListInstance);

          // 创建商家列表合约实例
          const merchantListInstance = new web3Instance.eth.Contract(
            MerchantListABI,
            MerchantListAddress
          );
          setcontractMerchantList(merchantListInstance);

          // 创建管理员列表合约实例
          const adminListInstance = new web3Instance.eth.Contract(
            AdminListABI,
            AdminListAddress
          );
          setcontractAdminList(adminListInstance);

        } catch (error) {
          console.error(error);
        }
      } else {
        console.error('请安装以太坊浏览器插件，如 MetaMask');
      }
    }
    init();
  }, []);

  // 对密码加密
  const hashPassword = async (password) => {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
  };

  // 用户注册函数
  const RegisterUser = async () => {
    if (contractUserList) {
      try {
        const hashedPassword = await hashPassword(password);
        // 获取当前用户的以太坊账户地址
        const accounts = await web3.eth.getAccounts();
        const fromAddress = accounts[0];
        console.log("fromAddress:", fromAddress, "Input:", ProductListAddress, userName, hashedPassword, gender, phone);
        // 调用用户列表合约的 createUser 函数
        await contractUserList.methods.createUser(ProductListAddress, userName, hashedPassword, gender, phone).send({ from: fromAddress });
        // alert('用户注册成功！');
        message.success('用户注册成功！')
        navigate('/login')
      } catch (error) {
        console.error(error);
        message.error('用户注册失败！')
        // alert('用户注册失败！');
      }
    }
  };

  // 商家注册函数
  const RegisterMerchant = async () => {
    if (contractMerchantList) {
      try {
        const hashedPassword = await hashPassword(password);
        // 获取当前用户的以太坊账户地址
        const accounts = await web3.eth.getAccounts();
        const fromAddress = accounts[0];
        console.log("fromAddress:", fromAddress, "Input:", ProductListAddress, userName, hashedPassword, phone, merchantNo);
        // 调用商家列表合约的 createMerchant 函数
        await contractMerchantList.methods.createMerchant(ProductListAddress, userName, hashedPassword, phone, merchantNo).send({ from: fromAddress });
        // alert('商家注册成功！');
        message.success('商家注册成功！')
        navigate('/login')
      } catch (error) {
        console.error(error);
        // alert('商家注册失败！');
        message.error('商家注册失败！')
      }
    }
  };

  // 管理员注册函数
  const RegisterAdmin = async () => {
    if (contractAdminList) {
      try {
        const hashedPassword = await hashPassword(password);
        // 获取当前用户的以太坊账户地址
        const accounts = await web3.eth.getAccounts();
        const fromAddress = accounts[0];
        console.log("fromAddress:", fromAddress, "Input:", userName, hashedPassword, adminNo, phone, gender);
        // 调用用户列表合约的 createUser 函数
        await contractAdminList.methods.createAdmin(userName, hashedPassword, adminNo, phone, gender).send({ from: fromAddress });
        // alert('管理员注册成功！');
        message.success('管理员注册成功！')
        navigate('/login')
      } catch (error) {
        console.error(error);
        // alert('管理员注册失败！');
        message.error('管理员注册失败！')
      }
    }
  };

  // 提交注册信息
  const handleSubmit = async () => {
    switch (role) {
        case 'user':
            RegisterUser();
            break;
        case 'merchant':
            RegisterMerchant();
            break;
        case 'admin':
            RegisterAdmin();
            break;
        default:
            break;
    }
};

  return (
    <Layout className="layout" style={{ minHeight: '100vh' }}>
            <Header>
                <Menu theme="dark" mode="horizontal" defaultSelectedKeys={['register']}>
                    <Menu.Item key="home" icon={<HomeOutlined />}>
                        <Link to="/">首页</Link>
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
                        name="register_form"
                        className="register-form"
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
                        {role === 'user' && (
                            <>
                                <Form.Item name="userName" label="用户名" rules={[{ required: true, message: '请输入用户名!' }]}>
                                    <Input prefix={<UserOutlined />} placeholder="用户名" value={userName} onChange={(e) => setUserName(e.target.value)} />
                                </Form.Item>
                                <Form.Item name="password" label="密码" rules={[{ required: true, message: '请输入密码!' }]}>
                                    <Input.Password prefix={<LockOutlined />} placeholder="密码" value={password} onChange={(e) => setPassword(e.target.value)} />
                                </Form.Item>
                                <Form.Item name="gender" label="性别">
                                    <Select value={gender} onChange={(value) => setGender(value)}>
                                        <Option value={true}>男</Option>
                                        <Option value={false}>女</Option>
                                    </Select>
                                </Form.Item>
                                <Form.Item
                                  name="phone"
                                  label="电话号码"
                                  rules={[
                                    { required: true, message: '请输入电话号码!' },
                                    { pattern: /^\d{10,11}$/, message: '电话号码必须为10到11位数字!' }
                                  ]}
                                >
                                    <Input placeholder="电话号码" value={phone} onChange={(e) => setPhone(e.target.value)} />
                                </Form.Item>
                            </>
                        )}
                        {role === 'merchant' && (
                            <>
                                <Form.Item name="userName" label="用户名" rules={[{ required: true, message: '请输入用户名!' }]}>
                                    <Input prefix={<UserOutlined />} placeholder="用户名" value={userName} onChange={(e) => setUserName(e.target.value)} />
                                </Form.Item>
                                <Form.Item name="password" label="密码" rules={[{ required: true, message: '请输入密码!' }]}>
                                    <Input.Password prefix={<LockOutlined />} placeholder="密码" value={password} onChange={(e) => setPassword(e.target.value)} />
                                </Form.Item>
                                <Form.Item
                                  name="phone"
                                  label="电话号码"
                                  rules={[
                                    { required: true, message: '请输入电话号码!' },
                                    { pattern: /^\d{10,11}$/, message: '电话号码必须为10到11位数字!' }
                                  ]}
                                >
                                    <Input placeholder="电话号码" value={phone} onChange={(e) => setPhone(e.target.value)} />
                                </Form.Item>
                                <Form.Item name="merchantNo" label="商家编号">
                                    <Input placeholder="商家编号" value={merchantNo} onChange={(e) => setMerchantNo(e.target.value)} />
                                </Form.Item>
                            </>
                        )}
                        {role === 'admin' && (
                            <>
                                <Form.Item name="userName" label="用户名" rules={[{ required: true, message: '请输入用户名!' }]}>
                                    <Input prefix={<UserOutlined />} placeholder="用户名" value={userName} onChange={(e) => setUserName(e.target.value)} />
                                </Form.Item>
                                <Form.Item name="password" label="密码" rules={[{ required: true, message: '请输入密码!' }]}>
                                    <Input.Password prefix={<LockOutlined />} placeholder="密码" value={password} onChange={(e) => setPassword(e.target.value)} />
                                </Form.Item>
                                <Form.Item name="adminNo" label="警号">
                                    <Input placeholder="警号" value={adminNo} onChange={(e) => setAdminNo(e.target.value)} />
                                </Form.Item>
                                <Form.Item
                                  name="phone"
                                  label="电话号码"
                                  rules={[
                                    { required: true, message: '请输入电话号码!' },
                                    { pattern: /^\d{10,11}$/, message: '电话号码必须为10到11位数字!' }
                                  ]}
                                >
                                    <Input placeholder="电话号码" value={phone} onChange={(e) => setPhone(e.target.value)} />
                                </Form.Item>
                                <Form.Item name="gender" label="性别">
                                    <Select value={gender} onChange={(value) => setGender(value)}>
                                        <Option value={true}>男</Option>
                                        <Option value={false}>女</Option>
                                    </Select>
                                </Form.Item>
                            </>
                        )}
                        <Form.Item>
                            <Button type="primary" htmlType="submit" className="register-form-button" block>
                                注册
                            </Button>
                        </Form.Item>
                    </Form>
                </div>
            </Content>
            <Footer style={{ textAlign: 'center' }}>花花DAPP ©2024</Footer>
        </Layout>

    // <div>


    //       <div className="container">

    //         <div className="border rounded border-0 shadow-lg p-3 p-md-5" data-bs-theme="light">

    //           <div className="mb-3">
    //             <h2>注册</h2>
    //             <label className="form-label" >角色</label>
    //             <select className="form-select" value={role} onChange={(e) => setRole(e.target.value)}>
    //               <option value="user">用户</option>
    //               <option value="merchant">商家</option>
    //               <option value="admin">管理员</option>
    //             </select>
    //           </div>

    //           {/* 用户 */}
    //           {role === 'user' && (
    //             <div className="mb-3">
    //               <div className="mb-3">
    //                 <label className="form-label" htmlFor="name">用户名</label>
    //                 <input className="form-control item" id="name" type="text" placeholder="用户名" value={userName} onChange={(e) => setUserName(e.target.value)} />
    //               </div>
    //               <div className="mb-3">
    //                 <label className="form-label" htmlFor="password">密码</label>
    //                 <input className="form-control item" id="password" type="password" placeholder="密码" value={password} onChange={(e) => setPassword(e.target.value)} />
    //               </div>
    //               <div className="mb-3">
    //                 <label className="form-label" htmlFor="subject">性别</label>
    //                 <select className="form-select" id="subject" value={gender} onChange={(e) => setGender(e.target.value === 'true')}>
    //                   <option value="true">男</option>
    //                   <option value="false">女</option>
    //                 </select>
    //               </div>
    //               <div className="mb-3">
    //                 <label className="form-label">电话号码</label>
    //                 <input className="form-control" type="text" placeholder="电话号码" value={phone} onChange={(e) => setPhone(e.target.value)} />
    //               </div>
    //               <div className="mb-3 mt-4">
    //                 <button className="btn btn-primary btn-lg d-block w-100" onClick={RegisterUser}>注册</button>
    //               </div>
    //             </div>
    //           )}

    //           {/* 商家 */}
    //           {role === 'merchant' && (
    //             <div class="mb-3">
    //               <div className="mb-3">
    //                 <label className="form-label" htmlFor="name">用户名</label>
    //                 <input className="form-control item" id="name" type="text" placeholder="用户名" value={userName} onChange={(e) => setUserName(e.target.value)} />
    //               </div>
    //               <div className="mb-3">
    //                 <label className="form-label" htmlFor="password">密码</label>
    //                 <input className="form-control item" id="password" type="password" placeholder="密码" value={password} onChange={(e) => setPassword(e.target.value)} />
    //               </div>
    //               <div className="mb-3">
    //                 <label className="form-label">电话号码</label>
    //                 <input className="form-control" type="text" placeholder="电话号码" value={phone} onChange={(e) => setPhone(e.target.value)} />
    //               </div>
    //               <div className="mb-3">
    //                 <label className="form-label" htmlFor="name">商家编号</label>
    //                 <input className="form-control item" id="name" type="text" placeholder="编号" value={merchantNo} onChange={(e) => setMerchantNo(e.target.value)} />
    //               </div>
    //               <div className="mb-3 mt-4">
    //                 <button className="btn btn-primary btn-lg d-block w-100" onClick={RegisterMerchant}>注册</button>
    //               </div>
    //             </div>
    //           )}

    //           {/* 管理员 */}
    //           {role === 'admin' && (
    //             <div class="mb-3">
    //               <div className="mb-3">
    //                 <label className="form-label" htmlFor="name">用户名</label>
    //                 <input className="form-control item" id="name" type="text" placeholder="用户名" value={userName} onChange={(e) => setUserName(e.target.value)} />
    //               </div>
    //               <div className="mb-3">
    //                 <label className="form-label" htmlFor="password">密码</label>
    //                 <input className="form-control item" id="password" type="password" placeholder="密码" value={password} onChange={(e) => setPassword(e.target.value)} />
    //               </div>
    //               <div className="mb-3">
    //                 <label className="form-label" htmlFor="name">警号</label>
    //                 <input className="form-control item" id="name" type="text" placeholder="编号" value={adminNo} onChange={(e) => setAdminNo(e.target.value)} />
    //               </div>
    //               <div className="mb-3">
    //                 <label className="form-label">电话号码</label>
    //                 <input className="form-control" type="text" placeholder="电话号码" value={phone} onChange={(e) => setPhone(e.target.value)} />
    //               </div>
    //               <div className="mb-3">
    //                 <label className="form-label" htmlFor="subject">性别</label>
    //                 <select className="form-select" id="subject" value={gender} onChange={(e) => setGender(e.target.value === 'true')}>
    //                   <option value="true">男</option>
    //                   <option value="false">女</option>
    //                 </select>
    //               </div>
    //               <div className="mb-3 mt-4">
    //                 <button className="btn btn-primary btn-lg d-block w-100" onClick={RegisterAdmin}>注册</button>
    //               </div>
    //             </div>
    //           )}

    //         </div>
    //       </div>


    // </div>

  );
}

export default Register;