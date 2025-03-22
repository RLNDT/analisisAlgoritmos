import React, { useState, useEffect } from 'react';
import { Layout, Typography, Card, Row, Col, Image, Button, Progress, Alert, Modal, Divider } from 'antd';
import { CheckOutlined, CloseOutlined } from '@ant-design/icons';
import gold from '../components/gold.png';
import jewelry from '../components/jewelry.jpg';
import laptop from '../components/laptop.png';
import smartphone from '../components/smartphone.png';
import camera from '../components/camera.png';
import watch from '../components/watch.jpg';
import diamond from '../components/diamond.jpg';
import cash from '../components/cash.jpeg';
import mochila from '../components/mochila.jpg'


const { Content } = Layout;
const { Title, Text } = Typography;

// Mock data for items - replace image paths with your actual images
const items = [
  { id: 1, name: 'Gold Bar', weight: 12, value: 500, image: gold },
  { id: 2, name: 'Jewelry', weight: 4, value: 200, image: jewelry },
  { id: 3, name: 'Laptop', weight: 7, value: 300, image: laptop },
  { id: 4, name: 'Smartphone', weight: 2, value: 150, image: smartphone },
  { id: 5, name: 'Camera', weight: 5, value: 250, image: camera },
  { id: 6, name: 'Watch', weight: 1, value: 100, image: watch },
  { id: 7, name: 'Diamond', weight: 3, value: 400, image: diamond },
  { id: 8, name: 'Cash', weight: 2, value: 120, image: cash },
];

const Knapsack = () => {
  // Knapsack capacity
  const capacity = 20;
  
  // State variables
  const [selectedItems, setSelectedItems] = useState([]);
  const [currentWeight, setCurrentWeight] = useState(0);
  const [currentValue, setCurrentValue] = useState(0);
  const [optimalSolution, setOptimalSolution] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [isOptimal, setIsOptimal] = useState(false);

  // Calculate current weight and value whenever selected items change
  useEffect(() => {
    const weight = selectedItems.reduce((sum, item) => sum + item.weight, 0);
    const value = selectedItems.reduce((sum, item) => sum + item.value, 0);
    
    setCurrentWeight(weight);
    setCurrentValue(value);
  }, [selectedItems]);

  // Toggle item selection
  const toggleItem = (item) => {
    const isSelected = selectedItems.some(i => i.id === item.id);
    
    if (isSelected) {
      // Remove item
      setSelectedItems(selectedItems.filter(i => i.id !== item.id));
    } else {
      // Add item if capacity allows
      const newWeight = currentWeight + item.weight;
      if (newWeight <= capacity) {
        setSelectedItems([...selectedItems, item]);
      }
    }
  };

  // Dynamic programming solution for 0/1 knapsack
  const solveKnapsack = () => {
    const n = items.length;
    // Create a 2D array for memoization
    const dp = Array(n + 1).fill().map(() => Array(capacity + 1).fill(0));
    
    // Build table dp[][] in bottom-up manner
    for (let i = 1; i <= n; i++) {
      for (let w = 0; w <= capacity; w++) {
        if (items[i-1].weight <= w) {
          dp[i][w] = Math.max(
            items[i-1].value + dp[i-1][w - items[i-1].weight],
            dp[i-1][w]
          );
        } else {
          dp[i][w] = dp[i-1][w];
        }
      }
    }
    
    // Find items included in the optimal solution
    const optimalItems = [];
    let w = capacity;
    for (let i = n; i > 0 && w > 0; i--) {
      if (dp[i][w] !== dp[i-1][w]) {
        optimalItems.push(items[i-1]);
        w -= items[i-1].weight;
      }
    }
    
    return {
      optimalItems,
      maxValue: dp[n][capacity]
    };
  };

  // Check result
  const checkResult = () => {
    const { optimalItems, maxValue } = solveKnapsack();
    setOptimalSolution({
      items: optimalItems,
      value: maxValue,
      weight: optimalItems.reduce((sum, item) => sum + item.weight, 0)
    });
    
    // Check if user's solution matches the optimal solution
    setIsOptimal(currentValue === maxValue);
    setShowResult(true);
  };

  // Reset selection
  const resetSelection = () => {
    setSelectedItems([]);
    setShowResult(false);
  };

  return (
    <Layout style={{ minHeight: '100vh', background: '#f0f2f5' }}>
      <Content style={{ padding: '24px' }}>
        <Title level={2} style={{ color: '#34495e', textAlign: 'center', marginBottom: 30 }}>
          Problema de la Mochila (Knapsack)
        </Title>
        
        <Row gutter={[16, 16]} justify="center">
          <Col xs={24} md={16}>
            {/* Knapsack Status */}
            <Card 
              title="Estado de la Mochila" 
              bordered={false} 
              style={{ marginBottom: 20 }}
            >
              <Row gutter={16} align="middle">
                <Col span={6}>
                  <Image 
                    src={mochila} 
                    alt="Mochila"
                    preview={false}
                    style={{ maxWidth: 120 }}
                    fallback="data:image/png;base64,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"
                  />
                </Col>
                <Col span={18}>
                  <div style={{ marginBottom: 10 }}>
                    <Text strong>Peso:</Text> {currentWeight}/{capacity} kg
                    <Progress 
                      percent={(currentWeight / capacity) * 100} 
                      status={currentWeight === capacity ? "success" : "active"}
                      strokeColor={{
                        '0%': '#108ee9',
                        '100%': currentWeight === capacity ? '#52c41a' : '#1890ff',
                      }}
                    />
                  </div>
                  <div>
                    <Text strong>Valor Total:</Text> ${currentValue}
                  </div>
                </Col>
              </Row>
              
              <Divider />
              
              <Row gutter={16} justify="center">
                <Col>
                  <Button 
                    type="primary" 
                    onClick={checkResult}
                    disabled={selectedItems.length === 0}
                  >
                    Comprobar Solución
                  </Button>
                </Col>
                <Col>
                  <Button onClick={resetSelection}>
                    Reiniciar
                  </Button>
                </Col>
              </Row>
            </Card>
            
            {/* Results */}
            {showResult && (
              <Alert
                message={isOptimal ? "¡Solución Óptima!" : "No es la solución óptima"}
                description={
                  isOptimal
                    ? "¡Felicidades! Has encontrado la combinación óptima de objetos."
                    : `La combinación óptima tiene un valor de $${optimalSolution.value} 
                       con un peso de ${optimalSolution.weight}kg.`
                }
                type={isOptimal ? "success" : "info"}
                showIcon
                style={{ marginBottom: 20 }}
                action={
                  !isOptimal && (
                    <Button size="small" onClick={() => {
                      Modal.info({
                        title: 'Solución Óptima',
                        content: (
                          <div>
                            <p>La mejor combinación de objetos es:</p>
                            <ul>
                              {optimalSolution.items.map(item => (
                                <li key={item.id}>
                                  {item.name} (Peso: {item.weight}kg, Valor: ${item.value})
                                </li>
                              ))}
                            </ul>
                          </div>
                        ),
                      });
                    }}>
                      Ver solución óptima
                    </Button>
                  )
                }
              />
            )}
          </Col>
        </Row>
        
        {/* Available Items */}
        <Title level={3} style={{ textAlign: 'center', margin: '30px 0 20px' }}>
          Objetos Disponibles
        </Title>
        
        <Row gutter={[16, 16]} justify="center">
          {items.map(item => {
            const isSelected = selectedItems.some(i => i.id === item.id);
            const canBeAdded = !isSelected && (currentWeight + item.weight <= capacity);
            
            return (
              <Col xs={24} sm={12} md={8} lg={6} key={item.id}>
                <Card
                  hoverable
                  style={{ 
                    border: isSelected ? '2px solid #52c41a' : '1px solid #d9d9d9',
                    backgroundColor: isSelected ? '#f6ffed' : 'white'
                  }}
                  cover={
                    <div style={{ height: 140, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 8 }}>
                      <Image
                        alt={item.name}
                        src={item.image}
                        style={{ maxHeight: 120, objectFit: 'contain' }}
                        preview={false}
                        fallback="data:image/png;base64,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"
                      />
                    </div>
                  }
                  actions={[
                    isSelected ? (
                      <Button 
                        icon={<CloseOutlined />} 
                        onClick={() => toggleItem(item)}
                        danger
                      >
                        Quitar
                      </Button>
                    ) : (
                      <Button 
                        icon={<CheckOutlined />} 
                        onClick={() => toggleItem(item)}
                        type="primary"
                        disabled={!canBeAdded}
                      >
                        {canBeAdded ? 'Seleccionar' : 'No espacio'}
                      </Button>
                    )
                  ]}
                >
                  <Card.Meta
                    title={item.name}
                    description={
                      <div>
                        <p><strong>Peso:</strong> {item.weight} kg</p>
                        <p><strong>Valor:</strong> ${item.value}</p>
                      </div>
                    }
                  />
                </Card>
              </Col>
            );
          })}
        </Row>
      </Content>
    </Layout>
  );
};

export default Knapsack;