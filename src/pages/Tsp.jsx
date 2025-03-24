import React, { useState, useRef, useEffect, useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import * as THREE from "three";
import { Html, OrbitControls } from "@react-three/drei";
import { Layout, Form, InputNumber, Button, Typography, Row, Col } from "antd";
import { FaBuilding } from "react-icons/fa";
import "antd/dist/reset.css";

const { Header, Content, Footer } = Layout;
const { Title, Text } = Typography;

const calculateDistance = (a, b) => {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
};

const AnimatedRoute = ({ cities, stepIndex, route }) => {
  const lineRef = useRef();
  const points = useMemo(() => {
    const tempPoints = [];
    for (let i = 0; i <= stepIndex && i < route.length; i++) {
      const city = cities[route[i]];
      tempPoints.push(new THREE.Vector3(city.x, city.y, 0));
    }
    return tempPoints;
  }, [cities, route, stepIndex]);

  useEffect(() => {
    if (lineRef.current) {
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      lineRef.current.geometry.dispose();
      lineRef.current.geometry = geometry;
    }
  }, [points]);

  return (
    <line ref={lineRef}>
      <bufferGeometry />
      <lineDashedMaterial color="black" dashSize={0.5} gapSize={0.2} linewidth={2} />
    </line>
  );
};

const Tsp = () => {
  const [numCities, setNumCities] = useState(5);
  const [cities, setCities] = useState([]);
  const [route, setRoute] = useState([]);
  const [visited, setVisited] = useState([]);
  const [stepIndex, setStepIndex] = useState(-1);
  const [executionTime, setExecutionTime] = useState(0);

  const generateCities = () => {
    const newCities = Array.from({ length: numCities }, () => ({
      x: Math.random() * 10 - 5,
      y: Math.random() * 10 - 5,
    }));
    setCities(newCities);
    resetVisualization();
  };

  const resetVisualization = () => {
    setRoute([]);
    setVisited([]);
    setStepIndex(-1);
  };

  const calculateExactRoute = () => {
    const start = performance.now();

    const distances = cities.map((_, i) =>
      cities.map((_, j) => calculateDistance(cities[i], cities[j]))
    );

    const allRoutes = permute(Array.from({ length: cities.length }, (_, i) => i).slice(1));
    let shortestRoute = null;
    let shortestDistance = Infinity;

    allRoutes.forEach((route) => {
      const fullRoute = [0, ...route, 0];
      const distance = fullRoute.reduce(
        (sum, city, i) => sum + (i === fullRoute.length - 1 ? 0 : distances[city][fullRoute[i + 1]]),
        0
      );
      if (distance < shortestDistance) {
        shortestDistance = distance;
        shortestRoute = fullRoute;
      }
    });

    const end = performance.now();
    setExecutionTime(end - start);
    setRoute(shortestRoute);
    setStepIndex(0);
  };

  const calculateApproximateRoute = () => {
    const start = performance.now();

    const distances = cities.map((_, i) =>
      cities.map((_, j) => calculateDistance(cities[i], cities[j]))
    );
    const visitedCities = Array(cities.length).fill(false);
    let currentCity = 0;
    visitedCities[currentCity] = true;
    const currentRoute = [currentCity];

    for (let step = 1; step < cities.length; step++) {
      const nearestCity = distances[currentCity]
        .map((dist, i) => ({ dist, i }))
        .filter(({ i }) => !visitedCities[i])
        .reduce((min, next) => (next.dist < min.dist ? next : min)).i;

      visitedCities[nearestCity] = true;
      currentRoute.push(nearestCity);
      currentCity = nearestCity;
    }
    currentRoute.push(0);

    const end = performance.now();
    setExecutionTime(end - start);
    setRoute(currentRoute);
    setStepIndex(0);
  };

  useEffect(() => {
    if (stepIndex >= 0 && stepIndex < route.length - 1) {
      const timer = setTimeout(() => {
        setVisited((prev) => {
          const newVisited = [...prev];
          newVisited[route[stepIndex]] = true;
          return newVisited;
        });
        setStepIndex((prev) => prev + 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [stepIndex, route]);

  return (
    <Layout style={{ minHeight: "100vh", background: "#f0f2f5" }}>
      <Header style={{ backgroundColor: "#001529", padding: "0 20px" }}>
        <Title style={{ color: "#fff", margin: 0, lineHeight: "64px" }}>TSP Visualizer</Title>
      </Header>
      <Content style={{ padding: "24px" }}>
        <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
          <Col>
            <Form layout="inline">
              <Form.Item label="Número de ciudades">
                <InputNumber
                  min={2}
                  value={numCities}
                  onChange={(value) => setNumCities(value || 2)}
                />
              </Form.Item>
              <Form.Item>
                <Button type="primary" onClick={generateCities}>
                  Generar Ciudades
                </Button>
              </Form.Item>
              <Form.Item>
                <Button
                  type="primary"
                  onClick={calculateExactRoute}
                  disabled={cities.length === 0}
                >
                  Algoritmo Exacto
                </Button>
              </Form.Item>
              <Form.Item>
                <Button
                  type="primary"
                  onClick={calculateApproximateRoute}
                  disabled={cities.length === 0}
                >
                  Algoritmo Aproximado
                </Button>
              </Form.Item>
              <Form.Item>
                <Button
                  type="default"
                  onClick={resetVisualization}
                  disabled={cities.length === 0}
                >
                  Limpiar Ciudades
                </Button>
              </Form.Item>
            </Form>
          </Col>
        </Row>

        <Row>
          <Col span={24}>
            <Canvas
              style={{ width: "100%", height: "60vh", background: "#fff", borderRadius: "8px", boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)" }}
              camera={{ position: [0, 0, 15], fov: 50 }}
            >
              {cities.map((city, index) => (
                <Html key={index} position={[city.x, city.y, 0]}>
                  <div style={{ textAlign: "center", color: visited[index] ? "#2c3e50" : "#e74c3c" }}>
                    <FaBuilding size={24} color={visited[index] ? "#2c3e50" : "#e74c3c"} />
                    <div style={{ fontSize: "12px" }}>{index + 1}</div>
                  </div>
                </Html>
              ))}
              <AnimatedRoute cities={cities} stepIndex={stepIndex} route={route} />
              <ambientLight />
              <pointLight position={[10, 10, 10]} />
              <OrbitControls />
            </Canvas>
          </Col>
        </Row>

        <Row style={{ marginTop: "24px" }}>
          <Col>
            <Text strong>Tiempo de ejecución: </Text>
            <Text>{executionTime.toFixed(2)} ms</Text>
          </Col>
        </Row>
      </Content>
      <Footer style={{ textAlign: "center" }}>
        TSP Visualizer ©2024 - Powered by React & Ant Design
      </Footer>
    </Layout>
  );
};

const permute = (arr) => {
  if (arr.length <= 1) return [arr];
  const permutations = [];
  for (let i = 0; i < arr.length; i++) {
    const rest = permute([...arr.slice(0, i), ...arr.slice(i + 1)]);
    rest.forEach((perm) => permutations.push([arr[i], ...perm]));
  }
  return permutations;
};

export default Tsp;