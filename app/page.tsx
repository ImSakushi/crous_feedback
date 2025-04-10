'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './page.module.css';
import { useRouter } from 'next/navigation';

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
        {/* Section "Qui sommes-nous ?" */}
        <section className={styles.aboutSection}>
          <h2 className={styles.sectionTitle}>Qui sommes-nous ?</h2>
          <p className={styles.sectionText}>
            Discu-Table est une initiative du Crous permettant aux étudiants de découvrir et d’évaluer les repas, tout en fournissant des informations sur l’origine et la préparation de chaque plat.
          </p>
        </section>

        {/* Section "Repas du jour" */}
        <section className={styles.menuSection}>
          <h2 className={styles.sectionTitle}>Repas du jour</h2>
          <div className={styles.menuInfo}>
            <p className={styles.sectionText}>
              Aujourd'hui, nous sommes le <strong>{formattedDate}</strong> et il s’agit du service <strong>{mealPeriod}</strong>.
            </p>

            {menu ? (
              <div className={styles.menuGrid}>
                {/* Entrées */}
                <div className={styles.menuBox}>
                  <h3 className={styles.menuSubTitle}>Entrées</h3>
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
                <button className={styles.noteButton}>Notez le repas</button>
              </Link>
            </div>
          </div>
        </section>

        {/* Section "Infos pratiques" */}
        <section className={styles.infoSection}>
          <h2 className={styles.sectionTitle}>Infos pratiques</h2>
          <div className={styles.infoGrid}>
            <div className={styles.infoItem}>
              <img src="/images/phone-icon.png" alt="Contact" className={styles.infoIcon} />
              <p>Contact : (01 23 45 67 89)</p>
            </div>
            <div className={styles.infoItem}>
              <img src="/images/payment-icon.png" alt="Paiement" className={styles.infoIcon} />
              <p>Paiement par carte bancaire et Izly</p>
            </div>
            <div className={styles.infoItem}>
              <img src="/images/time-icon.png" alt="Horaires" className={styles.infoIcon} />
              <p>Horaires : 11h30 - 14h / 18h - 20h</p>
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
