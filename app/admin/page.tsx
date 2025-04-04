'use client';

import React, { useState, useEffect } from 'react';
import FormSection from '@/components/FormSection';
import styles from './admin.module.css';
import { Line, Pie, Bar } from 'react-chartjs-2';
import 'chart.js/auto';
import { useRouter } from 'next/navigation';

interface Menu {
  id: number;
  date: string;
  meal_period: string;
  starters: string[];
  main_courses: string[];
}

export default function AdminPanel() {
  // Gestion des onglets
  const [activeTab, setActiveTab] = useState<'ajouter' | 'plats' | 'statistiques'>('ajouter');
  const [currentAdmin, setCurrentAdmin] = useState<{ id: number; username: string; role: string } | null>(null);
  const router = useRouter();

  // États pour l'onglet "Ajouter un menu"
  const [date, setDate] = useState('');
  const [mealPeriod, setMealPeriod] = useState('midi');
  const [starters, setStarters] = useState<string[]>(['']);
  const [mainCourses, setMainCourses] = useState<string[]>(['']);
  const [message, setMessage] = useState('');

  // États pour l'onglet "Plats" (édition de menus)
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedMealPeriod, setSelectedMealPeriod] = useState('midi');
  const [menu, setMenu] = useState<Menu | null>(null);
  const [menuLoading, setMenuLoading] = useState(false);
  const [updatedStarters, setUpdatedStarters] = useState<string[]>([]);
  const [updatedMainCourses, setUpdatedMainCourses] = useState<string[]>([]);
  const [updateMessage, setUpdateMessage] = useState('');

  // États pour l'onglet "Statistiques"
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');
  const [stats, setStats] = useState<any>(null);
  const [loadingStats, setLoadingStats] = useState(false);

  // Récupérer les infos de l'admin connecté
  useEffect(() => {
    async function fetchCurrentAdmin() {
      try {
        const res = await fetch('/api/admin/me');
        if (res.ok) {
          const data = await res.json();
          setCurrentAdmin(data.admin);
        }
      } catch (e) {
        console.error(e);
      }
    }
    fetchCurrentAdmin();
  }, []);

  // Fonction de formatage de la date
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

  // Fonction d'ajout d'un menu
  const handleAddMenuSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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

  // Fonction pour récupérer un menu existant (onglet Plats)
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

  const handleStarterInputChange = (index: number, value: string) => {
    const newStarters = [...starters];
    newStarters[index] = value;
    setStarters(newStarters);
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

  // Récupération des statistiques depuis l'API
  const fetchStatistics = async () => {
    setLoadingStats(true);
    let url = '/api/admin/statistics';
    if (filterStartDate && filterEndDate) {
      url += `?startDate=${filterStartDate}&endDate=${filterEndDate}`;
    }
    try {
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      } else {
        setStats(null);
      }
    } catch (error) {
      console.error(error);
      setStats(null);
    } finally {
      setLoadingStats(false);
    }
  };

  // Données pour le graphique linéaire (feedbacks par date)
  const lineChartData = {
    labels: stats ? stats.groupByDate.map((item: any) => item.feedback_date) : [],
    datasets: [
      {
        label: 'Nombre de feedbacks',
        data: stats ? stats.groupByDate.map((item: any) => item.count) : [],
        fill: false,
        borderColor: 'rgba(75,192,192,1)',
        tension: 0.1,
      },
    ],
  };

  const lineChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
  };

  // Données pour le graphique en camembert (feedbacks selon finished_plate)
  const pieChartData = {
    labels: stats ? stats.finished.map((item: any) => item.finished_plate ? 'Tout mangé' : 'Partiellement mangé') : [],
    datasets: [
      {
        data: stats ? stats.finished.map((item: any) => item.count) : [],
        backgroundColor: ['#4CAF50', '#F44336'],
      },
    ],
  };

  const pieChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
  };

  // Options communes pour les graphiques en barres
  const barChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
  };

  // Données pour les distributions de notes
  const barChartDataAppetizer = {
    labels: stats ? stats.distribution.appetizer.map((item: any) => item.rating) : [],
    datasets: [
      {
        label: 'Entrée',
        data: stats ? stats.distribution.appetizer.map((item: any) => item.count) : [],
        backgroundColor: 'rgba(255,99,132,0.5)',
      },
    ],
  };

  const barChartDataMainCourse = {
    labels: stats ? stats.distribution.mainCourse.map((item: any) => item.rating) : [],
    datasets: [
      {
        label: 'Plat principal',
        data: stats ? stats.distribution.mainCourse.map((item: any) => item.count) : [],
        backgroundColor: 'rgba(54, 162, 235, 0.5)',
      },
    ],
  };

  const barChartDataTaste = {
    labels: stats ? stats.distribution.taste.map((item: any) => item.rating) : [],
    datasets: [
      {
        label: 'Goût général',
        data: stats ? stats.distribution.taste.map((item: any) => item.count) : [],
        backgroundColor: 'rgba(255, 206, 86, 0.5)',
      },
    ],
  };

  const barChartDataPortion = {
    labels: stats ? stats.distribution.portion.map((item: any) => item.rating) : [],
    datasets: [
      {
        label: 'Portion',
        data: stats ? stats.distribution.portion.map((item: any) => item.count) : [],
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
      },
    ],
  };

  return (
    <div className={styles.container}>
      <h1>Panel Admin - Gestion des menus et Statistiques</h1>
      
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
        <button 
          className={activeTab === 'statistiques' ? styles.activeTab : styles.tab}
          onClick={() => setActiveTab('statistiques')}
        >
          Statistiques
        </button>
        {currentAdmin?.role === 'superadmin' && (
          <button 
            onClick={() => router.push('/admin/users')}
            className={styles.tab}
          >
            Utilisateurs
          </button>
        )}
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

      {activeTab === 'statistiques' && (
        <div>
          <h2>Statistiques</h2>
          <div className={styles.filterSection}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Du :</label>
              <input type="date" value={filterStartDate} onChange={(e) => setFilterStartDate(e.target.value)} />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Au :</label>
              <input type="date" value={filterEndDate} onChange={(e) => setFilterEndDate(e.target.value)} />
            </div>
            <button onClick={fetchStatistics} className={styles.submitButton}>Filtrer</button>
          </div>
          {loadingStats ? (
            <p>Chargement des statistiques...</p>
          ) : stats ? (
            <div>
              <p>Total des feedbacks : {stats.total}</p>
              <p>Moyenne entrée : {stats.averages.avg_appetizer ? parseFloat(stats.averages.avg_appetizer).toFixed(1) : '-'}</p>
              <p>Moyenne plat principal : {stats.averages.avg_main_course ? parseFloat(stats.averages.avg_main_course).toFixed(1) : '-'}</p>
              <p>Moyenne goût général : {stats.averages.avg_taste ? parseFloat(stats.averages.avg_taste).toFixed(1) : '-'}</p>
              <p>Moyenne portion : {stats.averages.avg_portion ? parseFloat(stats.averages.avg_portion).toFixed(1) : '-'}</p>

              <div className={styles.chartContainer}>
                <Line data={lineChartData} options={lineChartOptions} />
              </div>
              <div className={styles.chartContainer}>
                <Pie data={pieChartData} options={pieChartOptions} />
              </div>
              <div className={styles.chartContainer}>
                <h3>Distribution des notes - Entrée</h3>
                <Bar data={barChartDataAppetizer} options={barChartOptions} />
              </div>
              <div className={styles.chartContainer}>
                <h3>Distribution des notes - Plat principal</h3>
                <Bar data={barChartDataMainCourse} options={barChartOptions} />
              </div>
              <div className={styles.chartContainer}>
                <h3>Distribution des notes - Goût général</h3>
                <Bar data={barChartDataTaste} options={barChartOptions} />
              </div>
              <div className={styles.chartContainer}>
                <h3>Distribution des notes - Portion</h3>
                <Bar data={barChartDataPortion} options={barChartOptions} />
              </div>
            </div>
          ) : (
            <p>Aucune statistique disponible pour la période sélectionnée.</p>
          )}
        </div>
      )}
    </div>
  );
}

