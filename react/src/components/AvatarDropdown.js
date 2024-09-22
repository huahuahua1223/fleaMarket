// components/AvatarDropdown.js
import React from 'react';
import { Menu, Dropdown, Avatar, message } from 'antd';
import { UserOutlined, LogoutOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';

const AvatarDropdown = ({ address , role }) => {
    const navigate = useNavigate();

    const handleLogout = () => {
        // 显示退出登录消息
        message.success('退出登录成功');

        // 重定向到登录页或首页
        navigate('/login', { replace: true });
    };

    const menu = (
        <Menu>
            <Menu.Item key="profile" icon={<UserOutlined />}>
                <Link to={`/${role}/${address}`}>个人主页</Link>
            </Menu.Item>
            <Menu.Item key="logout" icon={<LogoutOutlined />} onClick={handleLogout}>
                退出登录
            </Menu.Item>
        </Menu>
    );

    return (
        <Dropdown overlay={menu} placement="bottomRight">
            <Avatar size="large" icon={<UserOutlined />} style={{ cursor: 'pointer' }} />
        </Dropdown>
    );
};

export default AvatarDropdown;
