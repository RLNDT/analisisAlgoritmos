import React from 'react';
import { Layout, Typography } from 'antd';

const { Content } = Layout;
const { Title } = Typography;

const Knapsack = () => {
  return (
    <Layout style={{ minHeight: '100vh', background: '#f0f2f5' }}>
      <Content style={{ padding: '24px', textAlign: 'center' }}>
        <Title level={2} style={{ color: '#34495e' }}>
          Problema de la Mochila (Knapsack)
        </Title>
        {/* Aquí va el contenido del Knapsack */}
      </Content>
    </Layout>
  );
};

export default Knapsack;