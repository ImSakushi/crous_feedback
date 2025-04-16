'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './thankyou.module.css';

export default function ThankYouPage() {
  const router = useRouter();

  const [streakCount, setStreakCount] = useState<number | null>(null);
  useEffect(() => {
    const lastDateKey = 'crous_last_vote_date';
    const streakKey = 'crous_streak_count';
    const today = new Date().toISOString().split('T')[0];
    const storedLast = localStorage.getItem(lastDateKey);
    let streak = parseInt(localStorage.getItem(streakKey) || '0', 10);
    if (storedLast === today) {
      // already counted for today
    } else {
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
      if (storedLast === yesterday) {
        streak += 1;
      } else {
        streak = 1;
      }
      localStorage.setItem(lastDateKey, today);
      localStorage.setItem(streakKey, streak.toString());
    }
    setStreakCount(streak);
  }, []);
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
      {/* Streak display */}
      {streakCount !== null && (
        <p style={{ color: 'red', marginBottom: '1rem' }}>
          🔥 Vous êtes sur une série de {streakCount} {streakCount === 1 ? 'contribution' : 'contributions'} pour le CROUS
        </p>
      )}
    </div>
  );
}