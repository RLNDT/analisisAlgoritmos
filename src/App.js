import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/navbar'; // Importar Navbar
import TspPage from './pages/Tsp';
import KnapsackPage from './pages/Knapsack';
import SubsetSumPage from './pages/SubsetSum';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navbar />}> {/* Navbar como layout principal */}
           <Route path="/tsp" element={<TspPage />} /> {}
           <Route path="/knapsack" element={<KnapsackPage />} /> {}
            <Route path="/subset-sum" element={<SubsetSumPage />} /> {}
        </Route>
      </Routes>
    </Router>
  );
};

export default App;