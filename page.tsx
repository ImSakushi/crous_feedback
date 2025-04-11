'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './page.module.css';

interface Menu {
  starters: string[];
  main_courses: string[];
}

export default function HomePage() {
  const [formattedDate, setFormattedDate] = useState('');
  const [menu, setMenu] = useState<Menu | null>(null);
  const [mealPeriod, setMealPeriod] = useState<'midi' | 'soir'>('midi');

  useEffect(() => {
    const now = new Date();
    // Format ISO pour l'API
    const dateStr = now.toISOString().split('T')[0];
    // Formatage en français (exemple : "mercredi 12 avril 2023")
    const formatted = now.toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
    setFormattedDate(formatted);

    // Détermination de la période
    const period: 'midi' | 'soir' = now.getHours() < 18 ? 'midi' : 'soir';
    setMealPeriod(period);

    // Récupération automatique du menu via l'API
    fetch(`/api/menu?date=${dateStr}&mealPeriod=${period}`)
      .then(res => (res.ok ? res.json() : null))
      .then(data => {
        if (data) {
          setMenu(data);
        }
      })
      .catch(err => console.error(err));
  }, []);

  return (
    <div className={styles.pageContainer}>
      {/* Header */}
      <header className={styles.header}>
        <h1 className={styles.title}>Discu-Table</h1>
      </header>

      {/* Contenu principal */}
      <main className={styles.main}>
        <div className={styles.content}>
          <p className={styles.date}>{formattedDate}</p>
          <h2 className={styles.sectionTitle}>Repas du jour – {mealPeriod}</h2>
          {menu ? (
            <div className={styles.menu}>
              <div className={styles.menuSection}>
                <h3 className={styles.subTitle}>Entrées</h3>
                <ul className={styles.menuList}>
                  {menu.starters.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>
              <div className={styles.menuSection}>
                <h3 className={styles.subTitle}>Plat principal</h3>
                <ul className={styles.menuList}>
                  {menu.main_courses.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <p className={styles.noMenu}>Aucun menu disponible.</p>
          )}
          <div className={styles.buttonContainer}>
            <Link href="/feedback">
              <button className={styles.button}>Noter le repas</button>
            </Link>
          </div>

          {/* Espace entre les sections */}
          <div style={{ margin: '2rem 0' }}></div>

          {/* Nouvelle partie : COMMENT LES REPAS SONT DECIDES */}
          <div className={styles.infoSection}>
            <h2 className={styles.infoTitle}>COMMENT LES REPAS SONT DECIDES:</h2>
            <p className={styles.infoText}>
              Le conseil de restauration creer les menus toutes les 6 semaines. Il est composer d'étudiants, d'une dietetitienne et d'un représentant budgetaire.
            </p>
          </div>

          {/* Espace entre les sections */}
          <div style={{ margin: '2rem 0' }}></div>

          {/* Nouvelle partie : QUI SOMMES NOUS */}
          <div className={styles.infoSection}>
            <h2 className={styles.infoTitle}>QUI SOMMES NOUS:</h2>
            <p className={styles.infoText}>
              Nous somme le CROUS Crew, un groupe d'étudiants MMI de l'IUT Bordeaux Montaigne, et pour nous, notre alimentation est une priorité!
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
