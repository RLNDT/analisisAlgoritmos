import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/navbar'; // Importar Navbar
import TspPage from './pages/Tsp';
const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navbar />}> {/* Navbar como layout principal */}
           <Route path="/tsp" element={<TspPage />} /> {}
        </Route>
      </Routes>
    </Router>
  );
};

export default App;