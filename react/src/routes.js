import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, useParams, Link, useNavigate } from 'react-router-dom';
import { Layout, Menu, Breadcrumb } from 'antd';
import { ProductOutlined, MenuUnfoldOutlined, MenuFoldOutlined, HeartOutlined, ShoppingCartOutlined, PlusOutlined, FileDoneOutlined, HomeOutlined, ShopOutlined, SafetyCertificateOutlined , HistoryOutlined } from '@ant-design/icons';
// import { BreadcrumbProvider } from './BreadcrumbContext';
// import { useBreadcrumb } from './BreadcrumbContext';

import Login from './components/Login';
import Register from './components/Register';
import Home from './components/Home';
import AvatarDropdown from './components/AvatarDropdown';
import NotFoundPage from './components/NotFoundPage';

// 用户
import User from './components/User/User';
import UserProductList from './components/User/ProductList';
import ProductDetails from './components/ProductDetails';
import GetFavorites from './components/User/GetFavorites';
import UserTransactionHistory from './components/User/UserTransactionHistory';
import UserEvaluationHistory from './components/User/UserEvaluationHistory';

// 商家
import Merchant from './components/Merchant/Merchant';
import AddProduct from './components/Merchant/AddProduct';
import MerchantProductList from './components/Merchant/ProductList';
import MerchantTransactionHistory from './components/Merchant/MerchantTransactionHistory';
import MerchantEvaluationHistory from './components/Merchant/MerchantEvaluationHistory';

// 管理员
import Admin from './components/Admin/Admin';
import EvaluationReport from './components/Admin/EvaluationReport';

const { Header, Content, Sider } = Layout;
const { SubMenu } = Menu;

const AppRouter = () => (
    <Layout>
      <Content>
      {/* <BreadcrumbProvider> */}
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/user/:address/*" element={<UserRoutes />} />
            <Route path="/merchant/:address/*" element={<MerchantRoutes />} />
            <Route path="/admin/:address/*" element={<AdminRoutes />} />
            <Route path="*" element={<NotFoundPage />} />
        </Routes>
        {/* </BreadcrumbProvider> */}
        </Content>
    </Layout>
);

// 用户路由
const UserRoutes = () => {
    const { address } = useParams();
    // const { setBreadcrumbs } = useBreadcrumb();
    const [collapsed, setCollapsed] = useState(false);
    const navigate = useNavigate();
    const toggleCollapsed = () => {
        setCollapsed(!collapsed);
    };

    // useEffect(() => {
    //     setBreadcrumbs([
    //         { text: '首页', link: '/' },
    //         { text: '用户首页', link: `/user/${address}` }
    //     ]);
    // }, [address, setBreadcrumbs]);

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Sider collapsible collapsed={collapsed} onCollapse={toggleCollapsed} style={{ background: '#fff' }}>
                <Menu theme="light" mode="inline" defaultSelectedKeys={['home']}>
                    <Menu.Item key="home" icon={<HomeOutlined />}>
                        <Link to={`/user/${address}/`}>用户首页</Link>
                    </Menu.Item>
                    <SubMenu key="carManagement" icon={<ShoppingCartOutlined />} title="商品管理">
                        <Menu.Item key="productList" icon={<ProductOutlined />}>
                            <Link to={`/user/${address}/productList`}>商品列表</Link>
                        </Menu.Item>
                        <Menu.Item key="favorite" icon={<HeartOutlined />}>
                            <Link to={`/user/${address}/getFavorites`}>收藏夹</Link>
                        </Menu.Item>
                    </SubMenu>
                    <SubMenu key="buyManagement" icon={<FileDoneOutlined />} title="我的订单">
                        <Menu.Item key="transactionHistory" icon={<HistoryOutlined />}>
                            <Link to={`/user/${address}/transactionHistory`}>交易历史</Link>
                        </Menu.Item>
                        <Menu.Item key="evaluationHistory" icon={<HistoryOutlined />}>
                            <Link to={`/user/${address}/evaluationHistory`}>评价历史</Link>
                        </Menu.Item>
                    </SubMenu>
                </Menu>
            </Sider>
            <Layout>
                <Header style={{ background: '#fff', padding: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    {React.createElement(collapsed ? MenuUnfoldOutlined : MenuFoldOutlined, {
                        className: 'trigger',
                        onClick: toggleCollapsed,
                    })}
                    <div style={{
                        fontSize: '24px',
                        fontWeight: 'bold',
                        color: '#1890ff',
                        fontFamily: 'Arial, sans-serif',
                        letterSpacing: '1.2px'
                    }}>
                        二手交易平台
                    </div>
                    {/* <Breadcrumb style={{ margin: '16px 0' }}>
                        {breadcrumbs.map((item, index) => (
                            <Breadcrumb.Item key={index}>
                                {item.link ? (
                                    <Link to={item.link}>{item.text}</Link>
                                ) : (
                                    <span>{item.text}</span>
                                )}
                            </Breadcrumb.Item>
                        ))}
                    </Breadcrumb> */}
                    <AvatarDropdown address={address} role="user" />
                </Header>
                <Content style={{ padding: '0 50px' }}>
                    <Routes>
                        <Route path="/" element={<User address={address} />} />
                        <Route path="productList" element={<UserProductList address={address} />} />
                        <Route path="/product/:productId" element={<ProductDetails address={address} />} />
                        <Route path="getFavorites" element={<GetFavorites address={address} />} />
                        <Route path="transactionHistory" element={<UserTransactionHistory address={address} />} />
                        <Route path="evaluationHistory" element={<UserEvaluationHistory address={address} />} />
                    </Routes>
                </Content>
            </Layout>
        </Layout>
    );
};

// 商家路由
const MerchantRoutes = () => {
    const { address } = useParams();
    const [collapsed, setCollapsed] = useState(false);

    const toggleCollapsed = () => {
        setCollapsed(!collapsed);
    };

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Sider collapsible collapsed={collapsed} onCollapse={toggleCollapsed} style={{ background: '#fff' }}>
                <Menu theme="light" mode="inline" defaultSelectedKeys={['home']}>
                    <Menu.Item key="home" icon={<HomeOutlined />}>
                        <Link to={`/merchant/${address}/`}>商家首页</Link>
                    </Menu.Item>
                    <SubMenu key="ProductManagement" icon={<ShoppingCartOutlined />} title="商品管理">
                        <Menu.Item key="productList" icon={<ProductOutlined />}>
                            <Link to={`/merchant/${address}/productList`}>商品列表</Link>
                        </Menu.Item> 
                        <Menu.Item key="addProduct" icon={<PlusOutlined />}>
                            <Link to={`/merchant/${address}/addProduct`}>发布商品</Link>
                        </Menu.Item>
                    </SubMenu>
                    <SubMenu key="buyManagement" icon={<ShopOutlined />} title="我卖出的">
                        <Menu.Item key="transactionHistory" icon={<HistoryOutlined />}>
                            <Link to={`/merchant/${address}/transactionHistory`}>交易历史</Link>
                        </Menu.Item>
                        <Menu.Item key="evaluationHistory" icon={<HistoryOutlined />}>
                            <Link to={`/merchant/${address}/evaluationHistory`}>评价历史</Link>
                        </Menu.Item>
                    </SubMenu>
                    {/* <Menu.Item key="evaluationHistory" icon={<ShopOutlined />}>
                        <Link to={`/merchant/${address}/evaluationHistory`}>评价历史</Link>
                    </Menu.Item> */}
                </Menu>
            </Sider>
            <Layout>
                <Header style={{ background: '#fff', padding: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    {React.createElement(collapsed ? MenuUnfoldOutlined : MenuFoldOutlined, {
                        className: 'trigger',
                        onClick: toggleCollapsed,
                    })}
                    <div style={{
                        fontSize: '24px',
                        fontWeight: 'bold',
                        color: '#1890ff',
                        fontFamily: 'Arial, sans-serif',
                        letterSpacing: '1.2px'
                    }}>
                        二手交易平台
                    </div>
                    <AvatarDropdown address={address} role="merchant" />
                </Header>
                <Content style={{ padding: '0 50px' }}>
                    <Routes>
                        <Route path="/" element={<Merchant address={address} />} />
                        <Route path="addProduct" element={<AddProduct address={address} />} />
                        <Route path="productList" element={<MerchantProductList address={address} />} />
                        <Route path="transactionHistory" element={<MerchantTransactionHistory address={address} />} />
                        <Route path="evaluationHistory" element={<MerchantEvaluationHistory address={address} />} />
                    </Routes>
                </Content>
            </Layout>
        </Layout>
    );
};

// 管理员路由
const AdminRoutes = () => {
    const { address } = useParams();
    const [collapsed, setCollapsed] = useState(false);

    const toggleCollapsed = () => {
        setCollapsed(!collapsed);
    };

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Sider collapsible collapsed={collapsed} onCollapse={toggleCollapsed} style={{ background: '#fff' }}>
                <Menu theme="light" mode="inline" defaultSelectedKeys={['home']}>
                    <Menu.Item key="home" icon={<HomeOutlined />}>
                        <Link to={`/admin/${address}/`}>管理员首页</Link>
                    </Menu.Item>
                    <Menu.Item key="evaluationReport" icon={<SafetyCertificateOutlined  />}>
                        <Link to={`/admin/${address}/evaluationReport`}>举报处理</Link>
                    </Menu.Item>
                </Menu>
            </Sider>
            <Layout>
                <Header style={{ background: '#fff', padding: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    {React.createElement(collapsed ? MenuUnfoldOutlined : MenuFoldOutlined, {
                        className: 'trigger',
                        onClick: toggleCollapsed,
                    })}
                    <div style={{
                        fontSize: '24px',
                        fontWeight: 'bold',
                        color: '#1890ff',
                        fontFamily: 'Arial, sans-serif',
                        letterSpacing: '1.2px'
                    }}>
                        二手交易平台
                    </div>
                    <AvatarDropdown address={address} role="admin" />
                </Header>
                <Content style={{ padding: '0 50px' }}>
                    <Routes>
                        <Route path="/" element={<Admin address={address} />} />
                        <Route path="evaluationReport" element={<EvaluationReport address={address} />} />
                    </Routes>
                </Content>
            </Layout>
        </Layout>
    );
};

export default AppRouter;
