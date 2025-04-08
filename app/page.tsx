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
      year: 'numeric',
    });
    setFormattedDate(formatted);

    // Récupération du menu
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
      {/* Header / Barre supérieure */}
      <header className={styles.header}>
        <div className={styles.logoSection}>
          {/* Remplacez par votre logo ou laissez un texte */}
          <img
            src="/images/logo-crous.png"
            alt="Logo Crous"
            className={styles.logo}
          />
          <h1 className={styles.discuTitle}>Discu-Table</h1>
        </div>
        <nav className={styles.nav}>
          <Link href="/" className={styles.navLink}>
            Accueil
          </Link>
        </nav>
      </header>

      {/* Section "Qui sommes-nous ?" */}
      <section className={styles.aboutSection}>
        <h2 className={styles.sectionTitle}>Qui sommes-nous ?</h2>
        <p className={styles.sectionText}>
          Discu-Table est une initiative du Crous qui permet aux étudiants
          de découvrir et d’évaluer les repas, tout en offrant des informations
          sur l’origine et la préparation de chaque plat.
        </p>
      </section>

      {/* Section "Repas du jour" */}
      <section className={styles.menuSection}>
        <h2 className={styles.sectionTitle}>Repas du jour</h2>
        <div className={styles.menuInfo}>
          <p className={styles.sectionText}>
            Aujourd'hui, nous sommes le <strong>{formattedDate}</strong>
            &nbsp;et il s’agit du service <strong>{mealPeriod}</strong>.
          </p>

          {/* Affichage du menu */}
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
            <p className={styles.sectionText}>
              Aucun menu disponible pour cette date.
            </p>
          )}

          {/* Bouton vers le formulaire */}
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
            <img
              src="/images/phone-icon.png"
              alt="Contact"
              className={styles.infoIcon}
            />
            <p>Numéro de contact<br />(ex: 01 23 45 67 89)</p>
          </div>
          <div className={styles.infoItem}>
            <img
              src="/images/payment-icon.png"
              alt="Paiement"
              className={styles.infoIcon}
            />
            <p>Paiement par carte bancaire<br />et Izly</p>
          </div>
          <div className={styles.infoItem}>
            <img
              src="/images/time-icon.png"
              alt="Horaires"
              className={styles.infoIcon}
            />
            <p>Horaires d’ouverture<br />(ex: 11h30-14h / 18h-20h)</p>
          </div>
        </div>
      </section>

      {/* Section "Provenance des aliments" */}
      <section className={styles.alimentsSection}>
        <h2 className={styles.sectionTitle}>D'où viennent vos aliments ?</h2>
        <div className={styles.alimentsGrid}>
          <div className={styles.alimentItem}>
            <img
              src="/images/local-producer-icon.png"
              alt="Vache"
              className={styles.alimentIcon}
            />
            <p>Viande bovine française</p>
          </div>
          <div className={styles.alimentItem}>
            <img
              src="/images/ecolabel-icon.png"
              alt="Label écolo"
              className={styles.alimentIcon}
            />
            <p>Pêche durable / Label MSC</p>
          </div>
          <div className={styles.alimentItem}>
            <img
              src="/images/bio-icon.png"
              alt="Bio"
              className={styles.alimentIcon}
            />
            <p>Ingrédients d’agriculture biologique</p>
          </div>
        </div>
      </section>

      {/* Section "Préparation des plats" */}
      <section className={styles.preparationSection}>
        <h2 className={styles.sectionTitle}>Préparation des plats</h2>
        <div className={styles.preparationGrid}>
          <div className={styles.prepItem}>
            <img
              src="/images/kitchen-icon.png"
              alt="Cuisine"
              className={styles.prepIcon}
            />
            <p>Cuisson sur place</p>
          </div>
          <div className={styles.prepItem}>
            <img
              src="/images/hygiene-icon.png"
              alt="Hygiène"
              className={styles.prepIcon}
            />
            <p>Hygiène et sécurité sanitaire</p>
          </div>
          <div className={styles.prepItem}>
            <img
              src="/images/recycle-icon.png"
              alt="Recyclage"
              className={styles.prepIcon}
            />
            <p>Tri et recyclage des déchets</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <p className={styles.footerText}>
          © {new Date().getFullYear()} Discu-Table
        </p>
      </footer>
    </div>
  );
}
