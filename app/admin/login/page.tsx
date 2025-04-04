'use client';
import React, { useState } from 'react';
import styles from '../admin.module.css';
import { useRouter } from 'next/navigation';

export default function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include', // Permet de stocker le cookie dans le navigateur
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();
    if (res.ok) {
      // Rediriger vers le panel admin après connexion réussie
      router.push('/admin');
    } else {
      setMessage(data.error || "Erreur lors de la connexion");
    }
  };

  return (
    <div className={styles.container}>
      <h1>Connexion Admin</h1>
      <form onSubmit={handleSubmit}>
        <div className={styles.formGroup}>
          <label className={styles.label}>Nom d'utilisateur :</label>
          <input 
            type="text" 
            value={username} 
            onChange={(e) => setUsername(e.target.value)} 
            required 
          />
        </div>
        <div className={styles.formGroup}>
          <label className={styles.label}>Mot de passe :</label>
          <input 
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required 
          />
        </div>
        <button type="submit" className={styles.submitButton}>
          Se connecter
        </button>
        {message && <p>{message}</p>}
      </form>
    </div>
  );
}