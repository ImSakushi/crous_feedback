'use client';

import React, { useEffect, useState } from 'react';
import styles from '../admin.module.css'; // Réutilisation des styles du panel admin
import FormSection from '@/components/FormSection';

interface AdminUser {
  id: number;
  username: string;
  role: string;
}

export default function UserManagement() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [editUser, setEditUser] = useState<AdminUser | null>(null);
  const [newPassword, setNewPassword] = useState('');

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

  const handleEdit = (user: AdminUser) => {
    setEditUser(user);
    setNewPassword('');
  };

  const handleSave = async () => {
    if (!editUser) return;
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editUser.id,
          username: editUser.username,
          role: editUser.role,
          password: newPassword // Si vide, le backend n'actualisera pas le mot de passe
        }),
      });
      if (res.ok) {
        alert('Utilisateur mis à jour');
        setEditUser(null);
        fetchUsers();
      } else {
        const err = await res.json();
        alert(err.error || 'Erreur lors de la mise à jour');
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className={styles.container}>
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
                    <button onClick={() => handleEdit(user)} className={styles.submitButton}>
                      Modifier
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {editUser && (
            <div style={{ marginTop: '20px' }}>
              <h2>Modifier l'utilisateur</h2>
              <FormSection title="Informations Utilisateur" icon={<span role="img" aria-label="utilisateur">👤</span>}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Nom d'utilisateur :</label>
                  <input 
                    type="text" 
                    value={editUser.username} 
                    onChange={(e) => setEditUser({ ...editUser, username: e.target.value })}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Rôle :</label>
                  <select 
                    value={editUser.role} 
                    onChange={(e) => setEditUser({ ...editUser, role: e.target.value })}
                  >
                    <option value="admin">Admin</option>
                    <option value="superadmin">Superadmin</option>
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>
                    Nouveau mot de passe (laisser vide pour ne pas changer) :
                  </label>
                  <input 
                    type="password" 
                    value={newPassword} 
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </div>
              </FormSection>
              <button onClick={handleSave} className={styles.submitButton}>
                Sauvegarder
              </button>
              <button onClick={() => setEditUser(null)} style={{ marginLeft: '10px' }}>
                Annuler
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}