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
    // Récupération de la date courante au format YYYY-MM-DD
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    setCurrentDate(dateStr);

    // Détermination de la période (midi / soir)
    const hour = now.getHours();
    const period = hour < 18 ? 'midi' : 'soir';
    setMealPeriod(period);

    // Formatage en français, ex: "mercredi 12 avril 2023"
    const formatted = now.toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
    setFormattedDate(formatted);

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

  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <h1 className={styles.discuTitle}>Discu-Table</h1>
        <nav className={styles.nav}>
          <Link href="/" className={styles.navLink}>Accueil</Link>
          <Link href="/feedback" className={styles.navLink}>Feedback</Link>
        </nav>
      </header>

      {/* Contenu principal */}
      <main className={styles.main}>
        {/* Section "Repas du jour" */}
        <section className={styles.menuSection}>
          <h2 className={styles.sectionTitle}>Repas du jour</h2>
          <div className={styles.menuInfo}>
            <p className={styles.sectionText}>
              Aujourd'hui, nous sommes le <strong>{formattedDate}</strong> et il s'agit du service <strong>{mealPeriod}</strong>.
            </p>

            {menu ? (
              <div className={styles.menuGrid}>
                {/* Entrées */}
                <div className={styles.menuBox}>
                  <ul className={styles.dishList}>
                    {menu.starters.map((starter, index) => (
                      <li key={index}>{starter}</li>
                    ))}
                  </ul>
                </div>

                {/* Plat principal */}
                <div className={styles.menuBox}>
                  <h3 className={styles.menuSubTitle}>Plat principal</h3>
                  <ul className={styles.dishList}>
                    {menu.main_courses.map((dish, index) => (
                      <li key={index}>{dish}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <p className={styles.sectionText}>Aucun menu disponible pour cette date.</p>
            )}

            <div className={styles.buttonContainer}>
              <Link href="/feedback">
                <button className={styles.noteButton}>Notez le repas du jour</button>
              </Link>
            </div>
          </div>
        </section>


        {/* Section "Qui sommes-nous ?" */}
        <section className={styles.aboutSection}>
          <h2 className={styles.sectionTitle}>Qui sommes-nous ?</h2>
          <p className={styles.sectionText}>
          Discu-Table est une initiative du CROUS Crew, un groupe d'étudiants en MMI à l'IUT Bordeaux Montaigne. Notre objectif est de permettre aux étudiants de découvrir, évaluer et mieux comprendre ce qu'ils mangent au RU, en mettant en avant l'origine et la préparation des plats.
          </p>
        </section>

        {/* Section "Selection des plats" */}
        <section className={styles.menuSection}>
          <h2 className={styles.sectionTitle}>Selection des plats</h2>
          <p className={styles.sectionText}>
            Tous les six semaines, le Conseil de Restauration élabore les menus du RU. Il réunit des étudiants, des membres du Crous, une diététicienne et un représentant budgétaire.
            Les plats sont choisis collectivement pour offrir une cuisine variée, équilibrée et appréciée du plus grand nombre. La diététicienne veille à l'équilibre nutritionnel, tandis que le budget est rigoureusement respecté.
          </p>
        </section>

        {/* Section "Infos pratiques" */}
        <section className={styles.infoSection}>
          <h2 className={styles.sectionTitle}>Infos pratiques</h2>
          <div className={styles.infoGrid}>
            <div className={styles.infoItem}>
              <p className={styles.infoIcon}>📞 Contact</p>
              <p>01 23 45 67 89</p>
            </div>
            <div className={styles.infoItem}>
              <p className={styles.infoIcon}>💳 Paiement</p>
              <p>Carte bancaire et Izly</p>
            </div>
            <div className={styles.infoItem}>
              <p className={styles.infoIcon}>⏰ Horaires</p>
              <p>11h30 - 14h / 18h - 20h</p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className={styles.footer}>
        <p className={styles.footerText}>© {new Date().getFullYear()} Discu-Table - Tous droits réservés</p>
      </footer>
    </div>
  );
}
