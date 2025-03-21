import React, { useState } from 'react';
import { Link, Outlet } from 'react-router-dom';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  CalculatorOutlined,
  UnorderedListOutlined,
  ShoppingOutlined,
} from '@ant-design/icons';
import { Button, Layout, Menu, Typography } from 'antd';

const { Header, Content } = Layout;
const { Title } = Typography;

const Navbar = () => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <Layout style={{ minHeight: '100vh', background: '#f0f2f5' }}>
      {/* Cabecera */}
      <Header
        style={{
          background: '#34495e',
          padding: '0 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Title level={3} style={{ color: '#fff', margin: 0 }}>
          Análisis de Algoritmos
        </Title>
        <Button
          type="text"
          icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          onClick={() => setCollapsed(!collapsed)}
          style={{
            fontSize: '16px',
            width: 64,
            height: 64,
            color: '#fff',
          }}
        />
      </Header>

      {/* Contenido principal */}
      <Content
        style={{
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
        }}
      >
        <Title level={2} style={{ color: '#34495e' }}>
          Solucionador de Algoritmos
        </Title>
        <Menu
          mode="horizontal"
          style={{ background: 'transparent', borderBottom: 'none', marginBottom: '24px' }}
        >
          <Menu.Item key="tsp" icon={<CalculatorOutlined />}>
            <Link to="/tsp">TSP Solver</Link>
          </Menu.Item>
          <Menu.Item key="subset-sum" icon={<UnorderedListOutlined />}>
            <Link to="/subset-sum">Subset Sum</Link>
          </Menu.Item>
          <Menu.Item key="knapsack" icon={<ShoppingOutlined />}>
            <Link to="/knapsack">Knapsack</Link>
          </Menu.Item>
        </Menu>
        <Outlet /> {/* Renderiza las rutas dinámicas aquí */}
      </Content>
    </Layout>
  );
};

export default Navbar;