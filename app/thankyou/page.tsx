'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import styles from './thankyou.module.css';

export default function ThankYouPage() {
  const router = useRouter();

  const handleCTA = () => {
    // Redirection vers la page d'accueil
    router.push('/');
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Merci pour votre aide !</h1>
      <p className={styles.subtitle}>
        Vous êtes curieux d'en apprendre plus sur le choix des plats ?
      </p>
      <button className={styles.moreButton} onClick={handleCTA}>
        En savoir plus
      </button>
    </div>
  );
}