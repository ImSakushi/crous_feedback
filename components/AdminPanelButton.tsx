'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './AdminPanelButton.module.css';

export default function AdminPanelButton() {
  const [isAdmin, setIsAdmin] = useState(false);
  const router = useRouter();

  useEffect(() => {
    async function fetchAdminStatus() {
      try {
        const res = await fetch('/api/admin/me');
        if (res.ok) {
          const data = await res.json();
          // Vérifie si le rôle est "admin" ou "superadmin"
          if (data.admin && (data.admin.role === 'admin' || data.admin.role === 'superadmin')) {
            setIsAdmin(true);
          }
        }
      } catch (err) {
        console.error(err);
      }
    }
    fetchAdminStatus();
  }, []);

  if (!isAdmin) return null;

  return (
    <button 
      className={styles.stickyButton}
      onClick={() => router.push('/admin')}
    >
      Admin Panel
    </button>
  );
}