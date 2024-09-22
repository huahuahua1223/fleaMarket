import React from 'react';
import { Link } from 'react-router-dom';
import { Layout, Menu, Form, Input, Button, Select, message } from 'antd';
import {
    UserOutlined,
    LockOutlined,
    HomeOutlined,
    LoginOutlined,
    FormOutlined
} from '@ant-design/icons';

const { Header, Content, Footer } = Layout;

const Home = () => {
    return (
        <Layout className="layout" style={{ minHeight: '100vh' }}>
            <Header>
                <Menu theme="dark" mode="horizontal" defaultSelectedKeys={['home']}>
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
            <Content style={{ padding: '0 50px', marginTop: 64  }}>
            <h1 style={{ textAlign: 'center' }}>区块链二手交易平台</h1>
            </Content>
            <Footer style={{ textAlign: 'center' }}>花花DAPP ©2024</Footer>
        </Layout>

    );
}

export default Home;
