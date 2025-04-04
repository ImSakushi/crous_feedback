'use client';

import React, { useState, useEffect } from 'react';
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

  // États pour l'ajout d'un menu (stockés en tableaux dynamiques)
  const [date, setDate] = useState('');
  const [mealPeriod, setMealPeriod] = useState('midi');
  const [starters, setStarters] = useState<string[]>(['']);
  const [mainCourses, setMainCourses] = useState<string[]>(['']);
  const [message, setMessage] = useState('');

  // États pour l'édition via la frise (onglet "Plats")
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedMealPeriod, setSelectedMealPeriod] = useState('midi');
  const [menu, setMenu] = useState<Menu | null>(null);
  const [menuLoading, setMenuLoading] = useState(false);
  const [updatedStarters, setUpdatedStarters] = useState<string[]>([]);
  const [updatedMainCourses, setUpdatedMainCourses] = useState<string[]>([]);
  const [updateMessage, setUpdateMessage] = useState('');

  // Fonction de formatage de la date : "2025-04-02T22:00:00.000Z" -> "04 Avril 2025"
  function formatDate(dateStr: string): string {
    const dateObj = new Date(dateStr);
    const parts = dateObj.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    }).split(' ');
    if (parts.length === 3) {
      parts[1] = parts[1].charAt(0).toUpperCase() + parts[1].slice(1);
    }
    return parts.join(' ');
  }

  const handleAddMenuSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Filtrer les champs vides
    const filteredStarters = starters.filter(s => s.trim() !== '');
    const filteredMainCourses = mainCourses.filter(s => s.trim() !== '');

    const res = await fetch('/api/admin/menu', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        date,
        mealPeriod,
        starters: filteredStarters,
        mainCourses: filteredMainCourses,
      }),
    });
    if (res.ok) {
      setMessage('Menu ajouté avec succès');
      setDate('');
      setMealPeriod('midi');
      setStarters(['']);
      setMainCourses(['']);
    } else {
      setMessage("Erreur lors de l'ajout du menu");
    }
  };

  const fetchMenu = async () => {
    if (!selectedDate) {
      setMenu(null);
      return;
    }
    setMenuLoading(true);
    setMenu(null);
    setUpdateMessage('');
    try {
      const res = await fetch(`/api/menu?date=${selectedDate}&mealPeriod=${selectedMealPeriod}`);
      if (res.ok) {
        const data = await res.json();
        setMenu(data);
        setUpdatedMainCourses(data.main_courses);
        setUpdatedStarters(data.starters);
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

  useEffect(() => {
    if (selectedDate) {
      fetchMenu();
    }
  }, [selectedDate, selectedMealPeriod]);

  const handleDishChange = (index: number, value: string) => {
    const newCourses = [...updatedMainCourses];
    newCourses[index] = value;
    setUpdatedMainCourses(newCourses);
  };

  const handleStarterChange = (index: number, value: string) => {
    const newStarters = [...updatedStarters];
    newStarters[index] = value;
    setUpdatedStarters(newStarters);
  };

  const handleSaveMenu = async () => {
    if (!menu) return;
    const res = await fetch('/api/admin/menu/update', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: menu.id,
        mainCourses: updatedMainCourses,
        starters: updatedStarters,
      }),
    });
    if (res.ok) {
      setUpdateMessage('Menu mis à jour avec succès');
    } else {
      setUpdateMessage('Erreur lors de la mise à jour du menu');
    }
  };

  // Fonctions pour gérer les inputs dynamiques lors de l'ajout d'un menu
  const handleStarterInputChange = (index: number, value: string) => {
    const newStarters = [...starters];
    newStarters[index] = value;
    setStarters(newStarters);
    // Ajoute un nouvel input si le dernier champ devient non vide
    if (index === newStarters.length - 1 && value.trim() !== '') {
      setStarters([...newStarters, '']);
    }
  };

  const handleMainCourseInputChange = (index: number, value: string) => {
    const newMainCourses = [...mainCourses];
    newMainCourses[index] = value;
    setMainCourses(newMainCourses);
    if (index === newMainCourses.length - 1 && value.trim() !== '') {
      setMainCourses([...newMainCourses, '']);
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
              <label className={styles.label}>Entrées :</label>
              {starters.map((starter, index) => (
                <input 
                  key={index}
                  type="text" 
                  value={starter}
                  onChange={(e) => handleStarterInputChange(index, e.target.value)}
                  placeholder={`Entrée ${index + 1}`}
                  required={index === 0}
                  className={styles.dishInput}
                />
              ))}
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Plats :</label>
              {mainCourses.map((course, index) => (
                <input 
                  key={index}
                  type="text" 
                  value={course}
                  onChange={(e) => handleMainCourseInputChange(index, e.target.value)}
                  placeholder={`Plat ${index + 1}`}
                  required={index === 0}
                  className={styles.dishInput}
                />
              ))}
            </div>
          </FormSection>
          <button type="submit" className={styles.submitButton}>Ajouter le menu</button>
          {message && <p>{message}</p>}
        </form>
      )}

      {activeTab === 'plats' && (
        <div>
          <h2>Modifier les menus</h2>
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
          </div>
          {menuLoading ? (
            <p>Chargement...</p>
          ) : menu ? (
            <div>
              <h3>Menu du {menu.meal_period} du {formatDate(menu.date)}</h3>
              <div>
                <h4>Entrées</h4>
                {updatedStarters.map((starter, index) => (
                  <div key={`starter-${index}`} className={styles.dishItem}>
                    <input 
                      type="text" 
                      value={starter} 
                      onChange={(e) => handleStarterChange(index, e.target.value)}
                      className={styles.dishInput}
                    />
                  </div>
                ))}
              </div>
              <div>
                <h4>Plats</h4>
                {updatedMainCourses.map((dish, index) => (
                  <div key={`dish-${index}`} className={styles.dishItem}>
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