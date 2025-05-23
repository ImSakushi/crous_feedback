'use client';

import React, { useEffect, useState } from 'react';
import styles from '../admin.module.css';
import { useRouter } from 'next/navigation';

interface AdminUser {
  id: number;
  username: string;
  role: string;
}

export default function UserManagement() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/users');
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container} style={{ position: 'relative' }}>
      {/* Bouton de retour en haut à gauche */}
      <p 
        className={styles.backLink}
        onClick={() => router.push('/admin')}
      >
        ← Retour
      </p>
      <h1>Gestion des Utilisateurs</h1>
      
      {loading ? (
        <p>Chargement...</p>
      ) : (
        <>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Nom d'utilisateur</th>
                <th>Rôle</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id} style={{ borderBottom: '1px solid #ccc' }}>
                  <td>{user.id}</td>
                  <td>{user.username}</td>
                  <td>{user.role}</td>
                  <td>
                    <button 
                      onClick={() => router.push(`/admin/users/edit/${user.id}`)} 
                      className={styles.submitButton}
                      style={{ marginRight: '10px' }}
                    >
                      Modifier
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <button 
            onClick={() => router.push('/admin/users/create')}
            className={styles.submitButton}
            style={{ marginTop: '20px' }}
          >
            Créer un nouvel utilisateur
          </button>
        </>
      )}
    </div>
  );
}