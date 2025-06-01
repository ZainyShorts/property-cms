// pages/login.js
'use client'
import { useState } from 'react';

export default function Login() {
  const [email, setEmail] = useState('zain@example.com');
  const [password, setPassword] = useState('123');
  const [error, setError] = useState('');

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');

    const res = await fetch('http://localhost:3013/auth/login', {
      method: 'POST',
      credentials: 'include', // send cookies
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    console.log(data)

    if (!res.ok) {
      setError(data.message || 'Login failed');
      return;
    }

    // router.push('/profile'); 
  };

  const get = async e => {
    e.preventDefault();
    setError('');

    const res = await fetch('http://localhost:3013/auth/test', {
      method: 'Get',
      credentials: 'include', // send cookies
    });

    const data = await res.json();

    console.log(data)

    if (!res.ok) {
      setError(data.message || 'Login failed');
      return;
    }

    // router.push('/profile'); 
  };

  return (
    <div >
      <input value={email} onChange={e => setEmail(e.target.value)} />
      <input
        type="password"
        value={password}
        onChange={e => setPassword(e.target.value)}
      />
      <button onClick={handleSubmit} type="submit">Login</button>
      <br/>
      <button onClick={get} type="submit">get</button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
}
