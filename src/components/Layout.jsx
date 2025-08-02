import React, { useState } from 'react';
import { Layout as AntLayout, Menu, Button, theme } from 'antd';
import {
  DashboardOutlined,
  UnorderedListOutlined,
  PlusOutlined,
  SettingOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';

const { Header, Sider, Content } = AntLayout;

const Layout = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const menuItems = [
    {
      key: '/',
      icon: <DashboardOutlined />,
      label: '仪表板',
    },
    {
      key: '/tasks',
      icon: <UnorderedListOutlined />,
      label: '任务列表',
    },
    {
      key: '/tasks/new',
      icon: <PlusOutlined />,
      label: '新建任务',
    },
    {
      key: '/settings',
      icon: <SettingOutlined />,
      label: '设置',
    },
  ];

  const handleMenuClick = ({ key }) => {
    navigate(key);
  };

  const getSelectedKey = () => {
    const path = location.pathname;
    if (path === '/tasks/new') return '/tasks/new';
    if (path.startsWith('/tasks/') && path !== '/tasks/new') return '/tasks';
    return path;
  };

  return (
    <AntLayout style={{ minHeight: '100vh' }}>
      <Sider 
        trigger={null} 
        collapsible 
        collapsed={collapsed}
        className="shadow-sm"
        style={{
          background: '#ffffff',
        }}
      >
        <div className="p-6 text-center border-b border-gray-100">
          <h1 className={`text-lg font-medium text-gray-700 ${collapsed ? 'hidden' : 'block'}`}>
            任务管理
          </h1>
        </div>
        <Menu
          mode="inline"
          selectedKeys={[getSelectedKey()]}
          items={menuItems}
          onClick={handleMenuClick}
          style={{
            border: 'none',
            marginTop: '8px',
          }}
        />
      </Sider>
      <AntLayout>
        <Header
          style={{
            padding: '0 16px',
            background: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid #f0f0f0',
            borderRight: '1px solid #f0f0f0',
            margin: '16px 16px 0 16px',
            borderRadius: '8px 8px 0 0',
            height: '64px',
          }}
        >
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{
              fontSize: '16px',
              width: 64,
              height: 64,
              color: '#666',
            }}
          />
          <div className="mr-6">
            <span className="text-gray-500 text-sm">任务管理系统</span>
          </div>
        </Header>
        <Content
          style={{
            margin: '0 16px 16px 16px',
            padding: 24,
            minHeight: 280,
            background: '#ffffff',
            borderRadius: '0 0 8px 8px',
            border: '1px solid #f0f0f0',
            borderTop: 'none',
          }}
        >
          {children}
        </Content>
      </AntLayout>
    </AntLayout>
  );
};

export default Layout; 