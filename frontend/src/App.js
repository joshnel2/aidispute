import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './Login';
import Dashboard from './Dashboard';
import Dispute from './Dispute';

const App = () => {
  return (
    <div style={{ background: 'black', color: 'white', fontFamily: 'Inter, sans-serif', minHeight: '100vh' }}>
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/dispute/:id" element={<Dispute />} />
        </Routes>
      </Router>
      <footer style={{ textAlign: 'center', padding: '10px' }}>Decentralized Technology Solutions 2025</footer>
    </div>
  );
};

export default App;
