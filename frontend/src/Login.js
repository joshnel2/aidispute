import React, { useState } from 'react';
import { getAuth, signInWithPhoneNumber, RecaptchaVerifier } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [confirmation, setConfirmation] = useState(null);
  const navigate = useNavigate();
  const auth = getAuth();

  const sendCode = async () => {
    const recaptcha = new RecaptchaVerifier('recaptcha', { size: 'invisible' }, auth);
    const conf = await signInWithPhoneNumber(auth, phone, recaptcha);
    setConfirmation(conf);
  };

  const verifyCode = async () => {
    await confirmation.confirm(code);
    navigate('/dashboard');
  };

  return (
    <div style={{ padding: '20px' }}>
      <input type="text" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+1 Phone" />
      <button onClick={sendCode}>Send Code</button>
      <div id="recaptcha"></div>
      <input type="text" value={code} onChange={e => setCode(e.target.value)} placeholder="Code" />
      <button onClick={verifyCode}>Verify</button>
    </div>
  );
};

export default Login;
