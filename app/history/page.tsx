// app/history/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import styles from './history.module.css';
import colors from '@/constants/colors';

interface HistoryItem {
  id: string;
  date: string;
  mealType: string;
  averageRating: number;
  mainCourse: string;
}

export default function HistoryPage() {
  const [historyData, setHistoryData] = useState<HistoryItem[]>([]);

  useEffect(() => {
    async function fetchHistory() {
      try {
        const res = await fetch('/api/feedback');
        if (res.ok) {
          const data = await res.json();
          setHistoryData(data);
        }
      } catch (error) {
        console.error(error);
      }
    }
    fetchHistory();
  }, []);

  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 0; i < 5; i++) {
      stars.push(
        <span key={i} style={{ fontSize: '16px', color: i < rating ? colors.starActive : colors.starInactive }}>
          ★
        </span>
      );
    }
    return <div>{stars} <span>{rating.toFixed(1)}</span></div>;
  };

  return (
    <div className={styles.container}>
      <h1>Historique des repas</h1>
      {historyData.length > 0 ? (
        <div className={styles.list}>
          {historyData.map(item => (
            <div key={item.id} className={styles.historyItem}>
              <div className={styles.header}>
                <span>{new Date(item.date).toLocaleDateString('fr-FR')}</span>
                <span>{item.mealType}</span>
              </div>
              <p>{item.mainCourse}</p>
              {renderStars(item.averageRating)}
            </div>
          ))}
        </div>
      ) : (
        <div className={styles.emptyState}>
          <p>Aucun historique disponible</p>
          <p>Vos évaluations apparaîtront ici</p>
        </div>
      )}
    </div>
  );
}
