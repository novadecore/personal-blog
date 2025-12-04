// src/layout/PublicLayout.jsx
import React from 'react';
import { Layout, Button } from 'antd';
import { Outlet, useNavigate } from 'react-router-dom';
import './Layout.scss';
import logo from '@/assets/logo.png';

const { Header, Content } = Layout;

const PublicLayout = () => {
  const navigate = useNavigate();

  return (
    <Layout className="public-layout" data-testid="public-layout">
      <Header className="public-header">
        <div className="public-logo">
          <img src={logo} alt="logo" className="public-logo-img" />
        </div>
        <Button type="primary" onClick={() => navigate('/admin/display')}>
          Go to Manage Site →
        </Button>
      </Header>

      <Content className="public-content">
        <Outlet />
      </Content>
    </Layout>
  );
};

export default PublicLayout;
