import React, { useState, useEffect } from 'react';
import { Layout, Typography, Card, Button, Row, Col, Divider, message, Tag } from 'antd';
import { DragOutlined, CheckOutlined, ReloadOutlined } from '@ant-design/icons';
import { 
  DndContext, 
  useDraggable,
  useDroppable,
  MouseSensor, 
  TouchSensor, 
  useSensor, 
  useSensors,
  DragOverlay
} from '@dnd-kit/core';

const { Content } = Layout;
const { Title, Text } = Typography;

// Generate random numbers for our array
const generateRandomNumbers = (count, min, max) => {
  const numbers = [];
  for (let i = 0; i < count; i++) {
    numbers.push(Math.floor(Math.random() * (max - min + 1) + min));
  }
  return numbers;
};

// Generate a target sum that is solvable
const generateTargetSum = (numbers) => {
  // Create a random subset of numbers
  const subset = numbers.filter(() => Math.random() > 0.5);
  
  // If subset is empty, just return the first number
  if (subset.length === 0 && numbers.length > 0) {
    return numbers[0];
  }
  
  // Return sum of subset
  return subset.reduce((sum, num) => sum + num, 0);
};

// Draggable item component
const DraggableItem = ({ id, value }) => {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id,
    data: { value }
  });

  return (
    <Tag
      ref={setNodeRef}
      color="blue"
      style={{
        opacity: isDragging ? 0.5 : 1,
        cursor: 'grab',
        fontSize: '16px',
        padding: '8px 16px',
        marginRight: '8px',
        marginBottom: '8px',
        userSelect: 'none',
        display: 'inline-block'
      }}
      {...listeners}
      {...attributes}
    >
      {value} <DragOutlined style={{ marginLeft: 5 }} />
    </Tag>
  );
};

// Droppable container
const DroppableContainer = ({ id, items, renderItem, style }) => {
  const { setNodeRef } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      style={{
        ...style,
        padding: '20px',
        minHeight: '150px',
        border: '1px dashed #d9d9d9',
        borderRadius: '8px',
        display: 'flex',
        flexWrap: 'wrap',
        alignContent: 'flex-start'
      }}
    >
      {items.map((item, index) => renderItem(item, index))}
    </div>
  );
};

const SubsetSum = () => {
  // Generate initial numbers and target sum
  const initialNumbers = generateRandomNumbers(10, 1, 30);
  const initialTarget = generateTargetSum(initialNumbers);
  
  // State management
  const [availableNumbers, setAvailableNumbers] = useState(initialNumbers);
  const [selectedNumbers, setSelectedNumbers] = useState([]);
  const [targetSum, setTargetSum] = useState(initialTarget);
  const [currentSum, setCurrentSum] = useState(0);
  const [activeId, setActiveId] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [difficultyLevel, setDifficultyLevel] = useState('medium'); // easy, medium, hard
  
  // Configure sensors for drag and drop
  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: { distance: 10 }
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 250, tolerance: 5 }
    })
  );
  
  // Calculate current sum whenever selected numbers change
  useEffect(() => {
    setCurrentSum(selectedNumbers.reduce((sum, num) => sum + num, 0));
  }, [selectedNumbers]);
  
  // Generate new problem
  const generateNewProblem = () => {
    let newNumbers;
    let maxNumber;
    let count;
    
    // Adjust difficulty
    switch (difficultyLevel) {
      case 'easy':
        count = 8;
        maxNumber = 20;
        break;
      case 'hard':
        count = 15;
        maxNumber = 50;
        break;
      default: // medium
        count = 10;
        maxNumber = 30;
        break;
    }
    
    newNumbers = generateRandomNumbers(count, 1, maxNumber);
    const newTarget = generateTargetSum(newNumbers);
    
    setAvailableNumbers(newNumbers);
    setSelectedNumbers([]);
    setTargetSum(newTarget);
    setShowResult(false);
  };
  
  const handleDragStart = (event) => {
    setActiveId(event.active.id);
  };
  
  const handleDragEnd = (event) => {
    const { active, over } = event;
    
    if (!over) {
      setActiveId(null);
      return;
    }

    const id = active.id;
    const isFromAvailable = id.startsWith('available-');
    const isFromSelected = id.startsWith('selected-');
    const index = parseInt(id.split('-')[1]);
    
    // If dropped on the "available" container
    if (over.id === 'available') {
      if (isFromSelected) {
        // Move from selected to available
        const numberToMove = selectedNumbers[index];
        setSelectedNumbers(selectedNumbers.filter((_, i) => i !== index));
        setAvailableNumbers([...availableNumbers, numberToMove]);
      }
    }
    
    // If dropped on the "selected" container
    if (over.id === 'selected') {
      if (isFromAvailable) {
        // Move from available to selected
        const numberToMove = availableNumbers[index];
        setAvailableNumbers(availableNumbers.filter((_, i) => i !== index));
        setSelectedNumbers([...selectedNumbers, numberToMove]);
      }
    }
    
    setActiveId(null);
  };
  
  // Check if the solution is correct
  const checkSolution = () => {
    const sum = selectedNumbers.reduce((acc, num) => acc + num, 0);
    const correct = sum === targetSum;
    
    setIsCorrect(correct);
    setShowResult(true);
    
    if (correct) {
      message.success('¡Correcto! Encontraste una combinación que suma exactamente el valor objetivo.');
    } else {
      message.error(`Incorrecto. La suma actual es ${sum}, pero el objetivo es ${targetSum}.`);
    }
  };
  
  // Change difficulty level and generate new problem
  const changeDifficulty = (level) => {
    setDifficultyLevel(level);
    setTimeout(generateNewProblem, 100);
  };
  
  // Get container styles based on current state
  const getSelectedContainerStyle = () => {
    return {
      backgroundColor: currentSum === targetSum ? '#f6ffed' : currentSum > targetSum ? '#fff2f0' : '#f0f2f5',
      borderColor: currentSum === targetSum ? '#b7eb8f' : currentSum > targetSum ? '#ffccc7' : '#d9d9d9'
    };
  };
  
  // Render the component
  return (
    <Layout style={{ minHeight: '100vh', background: '#f0f2f5', padding: '24px' }}>
      <Content>
        <Title level={2} style={{ textAlign: 'center', marginBottom: 30 }}>
          Problema de Suma de Subconjuntos (Subset Sum)
        </Title>
        
        <Row gutter={[16, 16]} justify="center" style={{ marginBottom: 24 }}>
          <Col span={24} md={20} lg={16}>
            <Card title="Selecciona la Dificultad" bordered={false}>
              <Row justify="center" gutter={[16, 16]}>
                <Col>
                  <Button 
                    type={difficultyLevel === 'easy' ? 'primary' : 'default'}
                    onClick={() => changeDifficulty('easy')}
                  >
                    Fácil
                  </Button>
                </Col>
                <Col>
                  <Button 
                    type={difficultyLevel === 'medium' ? 'primary' : 'default'}
                    onClick={() => changeDifficulty('medium')}
                  >
                    Medio
                  </Button>
                </Col>
                <Col>
                  <Button 
                    type={difficultyLevel === 'hard' ? 'primary' : 'default'}
                    onClick={() => changeDifficulty('hard')}
                  >
                    Difícil
                  </Button>
                </Col>
              </Row>
            </Card>
          </Col>
        </Row>
        
        <Row gutter={[16, 16]} justify="center">
          <Col span={24} md={20} lg={16}>
            <Card bordered={false}>
              <Row>
                <Col span={24} style={{ textAlign: 'center', marginBottom: 20 }}>
                  <Title level={3}>Valor Objetivo: {targetSum}</Title>
                  <Text>
                    Arrastra números para formar un subconjunto cuya suma sea exactamente {targetSum}
                  </Text>
                </Col>
              </Row>
              
              <DndContext
                sensors={sensors}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
              >
                <Row gutter={[16, 24]} style={{ marginTop: 20 }}>
                  <Col xs={24} md={12}>
                    <Title level={4}>Números Disponibles</Title>
                    <DroppableContainer
                      id="available"
                      items={availableNumbers}
                      renderItem={(number, index) => (
                        <DraggableItem 
                          key={`available-${index}`} 
                          id={`available-${index}`} 
                          value={number} 
                        />
                      )}
                    />
                  </Col>
                  
                  <Col xs={24} md={12}>
                    <Title level={4}>Tu Selección (Suma: {currentSum})</Title>
                    <DroppableContainer
                      id="selected"
                      items={selectedNumbers}
                      renderItem={(number, index) => (
                        <DraggableItem 
                          key={`selected-${index}`} 
                          id={`selected-${index}`} 
                          value={number} 
                        />
                      )}
                      style={getSelectedContainerStyle()}
                    />
                  </Col>
                </Row>
                
                <DragOverlay>
                  {activeId ? (
                    <Tag
                      color="blue"
                      style={{
                        fontSize: '16px',
                        padding: '8px 16px',
                        cursor: 'grabbing'
                      }}
                    >
                      {
                        activeId.startsWith('available-') 
                          ? availableNumbers[parseInt(activeId.split('-')[1])]
                          : selectedNumbers[parseInt(activeId.split('-')[1])]
                      } <DragOutlined style={{ marginLeft: 5 }} />
                    </Tag>
                  ) : null}
                </DragOverlay>
              </DndContext>
              
              <Divider />
              
              <Row justify="center" gutter={[16, 16]}>
                <Col>
                  <Button
                    type="primary"
                    icon={<CheckOutlined />}
                    onClick={checkSolution}
                    disabled={selectedNumbers.length === 0}
                  >
                    Verificar Solución
                  </Button>
                </Col>
                <Col>
                  <Button
                    icon={<ReloadOutlined />}
                    onClick={generateNewProblem}
                  >
                    Nuevo Problema
                  </Button>
                </Col>
              </Row>
              
              {showResult && (
                <Row style={{ marginTop: 20 }}>
                  <Col span={24}>
                    <Card
                      style={{ 
                        backgroundColor: isCorrect ? '#f6ffed' : '#fff2f0',
                        borderColor: isCorrect ? '#b7eb8f' : '#ffccc7'
                      }}
                    >
                      <div style={{ textAlign: 'center' }}>
                        {isCorrect ? (
                          <>
                            <CheckOutlined style={{ fontSize: 24, color: '#52c41a', marginRight: 8 }} />
                            <Title level={4} style={{ display: 'inline', color: '#52c41a' }}>
                              ¡Correcto!
                            </Title>
                            <p>Has encontrado una combinación que suma exactamente {targetSum}.</p>
                          </>
                        ) : (
                          <>
                            <Title level={4} style={{ color: '#f5222d' }}>
                              Incorrecto
                            </Title>
                            <p>La suma actual es {currentSum}, pero el objetivo es {targetSum}.</p>
                            <p>Sigue intentando con diferentes combinaciones.</p>
                          </>
                        )}
                      </div>
                    </Card>
                  </Col>
                </Row>
              )}
            </Card>
          </Col>
        </Row>
        
        <Row gutter={[16, 16]} justify="center" style={{ marginTop: 24 }}>
          <Col span={24} md={20} lg={16}>
            <Card title="Sobre el Problema de Suma de Subconjuntos" bordered={false}>
              <p>
                El problema de la suma de subconjuntos es un problema de decisión en informática. 
                Se trata de determinar si un subconjunto de un conjunto dado de números enteros 
                puede sumar exactamente a un valor objetivo T.
              </p>
              <p>
                Es un problema NP-completo, lo que significa que no se conoce un algoritmo eficiente
                que pueda resolverlo para todos los casos en tiempo polinómico.
              </p>
              <p>
                <strong>Instrucciones:</strong> Arrastra números desde "Números Disponibles" a "Tu Selección" 
                para formar un subconjunto cuya suma sea exactamente igual al valor objetivo.
              </p>
            </Card>
          </Col>
        </Row>
      </Content>
    </Layout>
  );
};

export default SubsetSum;