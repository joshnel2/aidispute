import React from 'react';
import { getAuth } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const navigate = useNavigate();
  const auth = getAuth();

  const createDispute = async () => {
    const token = await auth.currentUser.getIdToken();
    const res = await fetch('http://localhost:5000/dispute', { method: 'POST', headers: { Authorization: token } });
    const data = await res.json();
    alert(`Share link: ${data.link}`);
  };

  return <button onClick={createDispute} style={{ background: '#007AFF', color: 'white', border: 'none', padding: '10px', borderRadius: '5px' }}>New Dispute</button>;
};

export default Dashboard;
