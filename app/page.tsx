'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './page.module.css';

export default function HomePage() {
  const [currentDate, setCurrentDate] = useState('');
  const [menu, setMenu] = useState<{ starters: string[]; main_courses: string[] } | null>(null);
  const [mealPeriod, setMealPeriod] = useState('');

  useEffect(() => {
    // Détermination de la date actuelle au format YYYY-MM-DD
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    setCurrentDate(dateStr);

    // Détermination de la période de repas : 'midi' avant 18h, 'soir' après
    const hour = now.getHours();
    const period = hour < 18 ? 'midi' : 'soir';
    setMealPeriod(period);

    // Récupération du menu via l'API
    fetch(`/api/menu?date=${dateStr}&mealPeriod=${period}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) {
          setMenu(data);
        }
      })
      .catch((err) => console.error(err));
  }, []);

  // Formatage de la date en français
  const formattedDate = currentDate
    ? new Date(currentDate).toLocaleDateString('fr-FR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : '';

  return (
    <div className={styles.container}>
      <h1>Accueil</h1>
      <p>Aujourd'hui, nous sommes le {formattedDate}</p>

      <h2>Menu du {mealPeriod}</h2>
      {menu ? (
        <div>
          <h3>Entrées</h3>
          <ul>
            {menu.starters &&
              menu.starters.map((starter, index) => <li key={index}>{starter}</li>)}
          </ul>
          <h3>Plats</h3>
          <ul>
            {menu.main_courses &&
              menu.main_courses.map((dish, index) => <li key={index}>{dish}</li>)}
          </ul>
        </div>
      ) : (
        <p>Aucun menu trouvé pour aujourd'hui.</p>
      )}

      <div style={{ marginTop: '20px' }}>
        <Link href="/feedback">
          <button className={styles.submitButton}>Note ton repas</button>
        </Link>
      </div>
    </div>
  );
}
