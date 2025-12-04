// src/layout/AdminLayout.jsx
import React, { useState } from 'react';
import { Layout, Menu, Button, Drawer } from 'antd';
import {
  HomeOutlined,
  FileTextOutlined,
  EditOutlined,
  UserOutlined,
  LogoutOutlined,
  LoginOutlined,
  ArrowLeftOutlined,
  MenuOutlined,
} from '@ant-design/icons';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import instance from '@/utils/request';
import './Layout.scss';
import logo from '@/assets/logo.png';

const { Header, Sider, Content } = Layout;

const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  const menuItems = [
    { key: '/admin/display', icon: <HomeOutlined />, label: 'Display' },
    { key: '/admin/articles', icon: <FileTextOutlined />, label: 'Articles' },
    { key: '/admin/create', icon: <EditOutlined />, label: 'Create' },
    { key: '/admin/profile', icon: <UserOutlined />, label: 'Profile' },
  ];

  const selectedKey =
    menuItems.find((item) => location.pathname.startsWith(item.key))?.key ||
    '/admin/display';

  const handleLogout = async () => {
    try {
      await instance.post('/auth/logout');
    } catch {}
    setIsAuthenticated(false);
    navigate('/login');
  };

  // Common menu content (shared menu logic for Sider / Drawer)
  const renderMenu = (closeAfterClick = false) => (
    <>
      <Menu
        mode="inline"
        theme="dark"
        selectedKeys={[selectedKey]}
        items={menuItems}
        onClick={({ key }) => {
          navigate(key);
          if (closeAfterClick) {
            setMobileOpen(false);
          }
        }}
        className="admin-menu"
      />

      <div className="admin-bottom">
        {isAuthenticated ? (
          <Button block icon={<LogoutOutlined />} onClick={handleLogout}>
            Logout
          </Button>
        ) : (
          <Button
            block
            type="primary"
            icon={<LoginOutlined />}
            onClick={() => navigate('/login')}
          >
            Login
          </Button>
        )}
      </div>
    </>
  );

  return (
    <Layout className="admin-layout">
      {/* ---------- Left Sider: only displayed on desktop ---------- */}
      <Sider width={220} className="admin-sider desktop-only">
        <div className="admin-logo">
          <img src={logo} alt="logo" className="admin-logo-img" />
        </div>
        {renderMenu(false)}
      </Sider>

      {/* ---------- Mobile Drawer Menu ---------- */}
      <Drawer
        placement="left"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        styles={{ body: { padding: 0 } }}
        width={220}
        className="mobile-only admin-drawer"
      >
        {/* Not rendering logo in Drawer to avoid multiple instances in tests */}
        {renderMenu(true)}
      </Drawer>

      <Layout>
        <Header className="admin-header">
          {/* Hamburger button: only displayed on mobile */}
          <Button
            type="text"
            icon={<MenuOutlined />}
            onClick={() => setMobileOpen(true)}
            className="hamburger mobile-only"
            aria-label="Open menu"
          />

          {/* return button */}
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate('/')}
            className="back-button"
          >
            Back to Public Site
          </Button>
        </Header>

        <Content className="admin-content">
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminLayout;
