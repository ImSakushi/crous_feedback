'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import styles from './thankyou.module.css';

export default function ThankYouPage() {
  const router = useRouter();

  const handleCTA = () => {
    // Redirige vers la page d'accueil
    router.push('/');
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Merci pour votre aide !</h1>
      <p className={styles.subtitle} onClick={handleCTA}>
        Vous êtes curieux d'en apprendre plus sur le choix des plats ?
      </p>
    </div>
  );
}