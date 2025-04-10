'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './page.module.css';

interface Menu {
  starters: string[];
  main_courses: string[];
}

export default function HomePage() {
  const [currentDate, setCurrentDate] = useState('');
  const [formattedDate, setFormattedDate] = useState('');
  const [menu, setMenu] = useState<Menu | null>(null);
  const [mealPeriod, setMealPeriod] = useState<'midi' | 'soir'>('midi');

  useEffect(() => {
    // Get current date in YYYY-MM-DD format
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    setCurrentDate(dateStr);

    // Determine meal period
    const hour = now.getHours();
    const period = hour < 18 ? 'midi' : 'soir';
    setMealPeriod(period);

    // Format date in French format, e.g. "mercredi 12 avril 2023"
    const formatted = now.toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
    setFormattedDate(formatted);

    // Fetch menu from API
    fetch(`/api/menu?date=${dateStr}&mealPeriod=${period}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) {
          setMenu(data);
        }
      })
      .catch((err) => console.error(err));
  }, []);

  return (
    <div className={styles.pageContainer}>
      <header className={styles.header}>
        <img src="/icons/crous_logo.svg" alt="Logo" className={styles.logo} />
        <nav className={styles.nav}>
          <Link href="/" className={styles.navLink}>Accueil</Link>
          <Link href="/feedback" className={styles.navLink}>Feedback</Link>
        </nav>
      </header>
      <main className={styles.mainContent}>
        <section className={styles.menuSection}>
          <h2 className={styles.sectionTitle}>MENU DU JOUR</h2>
          {/* Plats ET Accompagnements */}
          <div className={styles.menuItem}>
            <h3>Plats ET Accompagnements :</h3>
            {menu ? (
              <ul>
                {menu.starters.concat(menu.main_courses).map((dish, index) => (
                  <li key={index}>{dish}</li>
                ))}
              </ul>
            ) : (
              <p>Liste des plats et accompagnements ici.</p>
            )}
          </div>
          {/* Desserts */}
          <div className={styles.menuItem}>
            <h3>Desserts :</h3>
            <p>Liste des desserts ici.</p>
          </div>
          {/* Extras */}
          <div className={styles.menuItem}>
            <h3>Extras :</h3>
            <p>Liste des extras ici.</p>
          </div>

              <Link href="/feedback">
                <button className={styles.noteButton}>Notez le repas</button>
              </Link>
            
        </section>

        <section className={styles.infoSection}>
          <h2 className={styles.sectionTitle}>COMMENT LES REPAS SONT DECIDES</h2>
          <p className={styles.sectionText}>
            Le conseil de restauration crée les menus toutes les 6 semaines. Il est composé d'étudiants, d'une diététicienne et d'un représentant budgétaire.
          </p>
        </section>

        <section className={styles.aboutSection}>
          <h2 className={styles.sectionTitle}>QUI SOMMES NOUS</h2>
          <p className={styles.sectionText}>
            Nous sommes le CROUS Crew, un groupe d'étudiants MMI de l'IUT Bordeaux Montaigne, et pour nous, notre alimentation est une priorité!
          </p>
        </section>
      </main>
      <footer className={styles.footer}>
        <p className={styles.footerText}>
          © {new Date().getFullYear()} Discu-Table - Tous droits réservés
        </p>
      </footer>
    </div>
  );
}
