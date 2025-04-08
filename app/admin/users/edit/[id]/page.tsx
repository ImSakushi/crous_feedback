'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import styles from '../../../admin.module.css';
import FormSection from '@/components/FormSection';

interface AdminUser {
  id: number;
  username: string;
  role: string;
}

export default function EditUser() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const [user, setUser] = useState<AdminUser | null>(null);
  const [username, setUsername] = useState('');
  const [role, setRole] = useState('admin');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch('/api/admin/users');
        if (res.ok) {
          const data: AdminUser[] = await res.json();
          const foundUser = data.find(u => u.id.toString() === id);
          if (foundUser) {
            setUser(foundUser);
            setUsername(foundUser.username);
            setRole(foundUser.role);
          }
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    fetchUser();
  }, [id]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: user?.id,
          username,
          role,
          password: newPassword,
        }),
      });
      if (res.ok) {
        alert('Utilisateur mis à jour');
        router.push('/admin/users');
      } else {
        const err = await res.json();
        alert(err.error || 'Erreur lors de la mise à jour');
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cet utilisateur ?")) return;
    try {
      const res = await fetch(`/api/admin/users?id=${user?.id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        alert('Utilisateur supprimé');
        router.push('/admin/users');
      } else {
        const err = await res.json();
        alert(err.error || 'Erreur lors de la suppression');
      }
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) return <p>Chargement...</p>;
  if (!user) return <p>Utilisateur non trouvé</p>;

  return (
    <div className={styles.container}>
      <h1>Modifier l'utilisateur</h1>
      <form onSubmit={handleSave}>
        <FormSection title="Informations Utilisateur" icon={<span role="img" aria-label="utilisateur">👤</span>}>
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
            <select 
              value={role} 
              onChange={(e) => setRole(e.target.value)}
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
        <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
          <button type="submit" className={styles.submitButton}>Sauvegarder</button>
          <button 
            type="button" 
            onClick={() => router.push('/admin/users')}
            className={styles.submitButton}
          >
            Annuler
          </button>
          <button 
            type="button" 
            onClick={handleDelete}
            className={styles.submitButton}
            style={{ backgroundColor: '#F44336' }}
          >
            Supprimer
          </button>
        </div>
      </form>
    </div>
  );
}