'use client';

import React, { useState } from 'react';
import FormSection from '@/components/FormSection';
import styles from './admin.module.css';

interface Menu {
  id: number;
  date: string;
  meal_period: string;
  starters: string[];
  main_courses: string[];
}

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState<'ajouter' | 'plats'>('ajouter');

  // États pour l'ajout d'un menu
  const [date, setDate] = useState('');
  const [mealPeriod, setMealPeriod] = useState('midi');
  const [starters, setStarters] = useState('');
  const [mainCourses, setMainCourses] = useState('');
  const [message, setMessage] = useState('');

  // États pour l'édition via frise chronologique (onglet "Plats")
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedMealPeriod, setSelectedMealPeriod] = useState('midi');
  const [menu, setMenu] = useState<Menu | null>(null);
  const [menuLoading, setMenuLoading] = useState(false);
  const [updatedMainCourses, setUpdatedMainCourses] = useState<string[]>([]);
  const [updateMessage, setUpdateMessage] = useState('');

  const handleAddMenuSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/admin/menu', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        date,
        mealPeriod,
        // On découpe les chaînes saisies par virgule et on élimine les espaces inutiles
        starters: starters.split(',').map(s => s.trim()),
        mainCourses: mainCourses.split(',').map(s => s.trim()),
      }),
    });
    if (res.ok) {
      setMessage('Menu ajouté avec succès');
      setDate('');
      setMealPeriod('midi');
      setStarters('');
      setMainCourses('');
    } else {
      setMessage("Erreur lors de l'ajout du menu");
    }
  };

  const handleFetchMenu = async () => {
    if (!selectedDate) return;
    setMenuLoading(true);
    setMenu(null);
    setUpdateMessage('');
    try {
      const res = await fetch(`/api/menu?date=${selectedDate}&mealPeriod=${selectedMealPeriod}`);
      if (res.ok) {
        const data = await res.json();
        setMenu(data);
        setUpdatedMainCourses(data.main_courses);
      } else {
        setMenu(null);
      }
    } catch (error) {
      console.error(error);
      setMenu(null);
    } finally {
      setMenuLoading(false);
    }
  };

  const handleDishChange = (index: number, value: string) => {
    const newCourses = [...updatedMainCourses];
    newCourses[index] = value;
    setUpdatedMainCourses(newCourses);
  };

  const handleSaveMenu = async () => {
    if (!menu) return;
    const res = await fetch('/api/admin/menu/update', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: menu.id,
        mainCourses: updatedMainCourses,
      }),
    });
    if (res.ok) {
      setUpdateMessage('Menu mis à jour avec succès');
    } else {
      setUpdateMessage('Erreur lors de la mise à jour du menu');
    }
  };

  return (
    <div className={styles.container}>
      <h1>Panel Admin - Gestion des menus</h1>
      
      <div className={styles.tabs}>
        <button 
          className={activeTab === 'ajouter' ? styles.activeTab : styles.tab}
          onClick={() => setActiveTab('ajouter')}
        >
          Ajouter un menu
        </button>
        <button 
          className={activeTab === 'plats' ? styles.activeTab : styles.tab}
          onClick={() => setActiveTab('plats')}
        >
          Plats
        </button>
      </div>

      {activeTab === 'ajouter' && (
        <form onSubmit={handleAddMenuSubmit}>
          <FormSection title="Informations du menu" icon={<span role="img" aria-label="menu">📅</span>}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Date :</label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Repas :</label>
              <select value={mealPeriod} onChange={(e) => setMealPeriod(e.target.value)}>
                <option value="midi">Midi</option>
                <option value="soir">Soir</option>
              </select>
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Entrées (séparées par des virgules) :</label>
              <input type="text" value={starters} onChange={(e) => setStarters(e.target.value)} placeholder="Ex: Entrée 1, Entrée 2" required />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Plats (séparés par des virgules) :</label>
              <input type="text" value={mainCourses} onChange={(e) => setMainCourses(e.target.value)} placeholder="Ex: Plat 1, Plat 2" required />
            </div>
          </FormSection>
          <button type="submit" className={styles.submitButton}>Ajouter le menu</button>
          {message && <p>{message}</p>}
        </form>
      )}

      {activeTab === 'plats' && (
        <div>
          <h2>Modifier les plats</h2>
          <div className={styles.timeline}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Choisir la date :</label>
              <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Repas :</label>
              <select value={selectedMealPeriod} onChange={(e) => setSelectedMealPeriod(e.target.value)}>
                <option value="midi">Midi</option>
                <option value="soir">Soir</option>
              </select>
            </div>
            <button onClick={handleFetchMenu} className={styles.submitButton}>Afficher le menu</button>
          </div>
          {menuLoading ? (
            <p>Chargement...</p>
          ) : menu ? (
            <div>
              <h3>Menu du {menu.date} - {menu.meal_period}</h3>
              <div>
                {updatedMainCourses.map((dish, index) => (
                  <div key={index} className={styles.dishItem}>
                    <input 
                      type="text" 
                      value={dish} 
                      onChange={(e) => handleDishChange(index, e.target.value)}
                      className={styles.dishInput}
                    />
                  </div>
                ))}
              </div>
              <button onClick={handleSaveMenu} className={styles.submitButton}>Sauvegarder</button>
              {updateMessage && <p>{updateMessage}</p>}
            </div>
          ) : (
            <p>Aucun menu trouvé pour cette date et ce repas.</p>
          )}
        </div>
      )}
    </div>
  );
}