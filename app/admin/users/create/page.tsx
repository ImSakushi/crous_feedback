'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from '../../admin.module.css';
import FormSection from '@/components/FormSection';

export default function CreateUser() {
  const [username, setUsername] = useState('');
  const [role, setRole] = useState('admin');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, role })
      });
      if (res.ok) {
        alert('Utilisateur créé avec succès');
        router.push('/admin/users');
      } else {
        const data = await res.json();
        setMessage(data.error || 'Erreur lors de la création de l’utilisateur');
      }
    } catch (error) {
      console.error(error);
      setMessage('Erreur lors de la création de l’utilisateur');
    }
  };

  return (
    <div className={styles.container}>
      {/* Bouton retour */}
      <p 
        className={styles.backLink}
        onClick={() => router.push('/admin/users')}
      >
        ← Retour
      </p>
      <h1>Créer un nouvel utilisateur</h1>
      <form onSubmit={handleSubmit}>
        <FormSection 
          title="Informations Utilisateur" 
          icon={<span role="img" aria-label="utilisateur">👤</span>}
        >
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
            <label className={styles.label}>Rôle :</label>
            <select value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="admin">Admin</option>
              <option value="superadmin">Superadmin</option>
            </select>
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
        </FormSection>
        <button type="submit" className={styles.submitButton}>
          Créer
        </button>
        {message && <p>{message}</p>}
      </form>
    </div>
  );
}