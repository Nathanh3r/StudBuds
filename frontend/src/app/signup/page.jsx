'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';

export default function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [major, setMajor] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();
  const { signup } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.endsWith('.edu')) {
      setError('Must use .edu email');
      return;
    }

    const result = await signup(name, email, password, major);

    if (result.success) {
      router.push('/dashboard');
    } else {
      setError(result.error);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '400px', margin: '0 auto' }}>
      <h1>Sign Up</h1>
      
      {error && <p style={{ color: 'red' }}>{error}</p>}
      
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '10px' }}>
          <label>Name:</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{ width: '100%', padding: '8px', border: '1px solid #ccc' }}
          />
        </div>

        <div style={{ marginBottom: '10px' }}>
          <label>Email (.edu):</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ width: '100%', padding: '8px', border: '1px solid #ccc' }}
          />
        </div>

        <div style={{ marginBottom: '10px' }}>
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: '100%', padding: '8px', border: '1px solid #ccc' }}
          />
        </div>

        <div style={{ marginBottom: '10px' }}>
          <label>Major:</label>
          <input
            type="text"
            value={major}
            onChange={(e) => setMajor(e.target.value)}
            style={{ width: '100%', padding: '8px', border: '1px solid #ccc' }}
          />
        </div>

        <button type="submit" style={{ padding: '10px 20px' }}>
          Sign Up
        </button>
      </form>

      <p style={{ marginTop: '20px' }}>
        Already have an account? <a href="/login">Login</a>
      </p>
    </div>
  );
}