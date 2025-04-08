'use client';

import React, { useState, useEffect } from 'react';
import FormSection from '@/components/FormSection';
import styles from './admin.module.css';
import { Line, Pie, Bar } from 'react-chartjs-2';
import 'chart.js/auto';
import { useRouter } from 'next/navigation';

interface Menu {
  id?: number;
  date: string;
  meal_period: string;
  starters: string[];
  main_courses: string[];
  desserts?: string[];
  extra?: string; // Nouvelle propriété pour les informations "Extra"
}

export default function AdminPanel() {
  const router = useRouter();

  // Gestion des onglets
  const [activeTab, setActiveTab] = useState<'menus' | 'statistiques'>('menus');

  // États pour le menu
  const [menuDate, setMenuDate] = useState('');
  const [menuMealPeriod, setMenuMealPeriod] = useState('midi');
  const [menu, setMenu] = useState<Menu | null>(null);
  const [starters, setStarters] = useState<string[]>(['']);
  const [mainCourses, setMainCourses] = useState<string[]>(['']);
  const [desserts, setDesserts] = useState<string[]>(['']); // Nouvel état pour les desserts
  const [extra, setExtra] = useState(''); // Nouvel état pour la partie "Extra"
  const [message, setMessage] = useState('');

  // États des statistiques (inchangés)
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');
  const [stats, setStats] = useState<any>(null);
  const [loadingStats, setLoadingStats] = useState(false);

  // Récupérer l'admin connecté
  const [currentAdmin, setCurrentAdmin] = useState<{ id: number; username: string; role: string } | null>(null);
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

  // Récupération du menu (mise à jour pour inclure les desserts et la partie extra)
  useEffect(() => {
    async function fetchMenuData() {
      if (!menuDate) {
        setMenu(null);
        setStarters(['']);
        setMainCourses(['']);
        setDesserts(['']);
        setExtra('');
        return;
      }
      try {
        const res = await fetch(`/api/menu?date=${menuDate}&mealPeriod=${menuMealPeriod}`);
        if (res.ok) {
          const data = await res.json();
          setMenu(data);
          setStarters(data.starters);
          setMainCourses(data.main_courses);
          setDesserts(data.desserts || ['']);
          setExtra(data.extra || '');
        } else {
          setMenu(null);
          setStarters(['']);
          setMainCourses(['']);
          setDesserts(['']);
          setExtra('');
        }
      } catch (error) {
        console.error(error);
        setMenu(null);
      }
    }
    fetchMenuData();
  }, [menuDate, menuMealPeriod]);

  // Gestion des entrées et des plats
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

  // Gestion des desserts
  const handleDessertInputChange = (index: number, value: string) => {
    const newDesserts = [...desserts];
    newDesserts[index] = value;
    setDesserts(newDesserts);
    if (index === newDesserts.length - 1 && value.trim() !== '') {
      setDesserts([...newDesserts, '']);
    }
  };

  // Ajout d'un menu (mise à jour pour inclure desserts et extra)
  const handleAddMenuSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const filteredStarters = starters.filter(s => s.trim() !== '');
    const filteredMainCourses = mainCourses.filter(s => s.trim() !== '');
    const filteredDesserts = desserts.filter(d => d.trim() !== '');

    try {
      const res = await fetch('/api/admin/menu', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: menuDate,
          mealPeriod: menuMealPeriod,
          starters: filteredStarters,
          mainCourses: filteredMainCourses,
          desserts: filteredDesserts, // Envoi des desserts
          extra, // Envoi de la partie "Extra"
        }),
      });
      if (res.ok) {
        setMessage('Menu ajouté avec succès');
        const data = await res.json();
        setMenu(data);
      } else {
        setMessage("Erreur lors de l'ajout du menu");
      }
    } catch (error) {
      console.error(error);
      setMessage("Erreur lors de l'ajout du menu");
    }
  };

  // Modification d'un menu existant (mise à jour pour inclure desserts et extra)
  const handleSaveMenu = async () => {
    if (!menu || !menu.id) return;
    try {
      const res = await fetch('/api/admin/menu/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: menu.id,
          starters,
          mainCourses,
          desserts, // Envoi des desserts
          extra,     // Envoi de la partie "Extra"
        }),
      });
      if (res.ok) {
        setMessage('Menu mis à jour avec succès');
      } else {
        setMessage('Erreur lors de la mise à jour du menu');
      }
    } catch (error) {
      console.error(error);
      setMessage('Erreur lors de la mise à jour du menu');
    }
  };

  // Gestion des statistiques
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

  // Données pour le graphique linéaire (statistiques)
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

  // Données pour le graphique en camembert (statistiques)
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

  // Options communes pour les graphiques en barres (statistiques)
  const barChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
  };

  // Données pour la distribution des notes (statistiques)
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

  // Fonction de déconnexion
  const handleLogout = async () => {
    try {
      const res = await fetch('/api/admin/logout', { method: 'POST' });
      if (res.ok) {
        router.push('/admin/login');
      } else {
        alert('Erreur lors de la déconnexion');
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className={styles.container} style={{ position: 'relative' }}>
      {/* Bouton de déconnexion sticky en haut à droite */}
      <button onClick={handleLogout} className={styles.logoutButton}>
        Déconnexion
      </button>

      <h1>Panel Admin - Gestion des menus et Statistiques</h1>

      {/* Onglets pour basculer entre "Menus" et "Statistiques" */}
      <div className={styles.tabs}>
        <button
          className={activeTab === 'menus' ? styles.activeTab : styles.tab}
          onClick={() => setActiveTab('menus')}
        >
          Menus
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

      {activeTab === 'menus' && (
        <div>
          <h2>Gérer les menus</h2>
          <div className={styles.timeline}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Choisissez la date :</label>
              <input
                type="date"
                value={menuDate}
                onChange={(e) => setMenuDate(e.target.value)}
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Repas :</label>
              <select
                value={menuMealPeriod}
                onChange={(e) => setMenuMealPeriod(e.target.value)}
              >
                <option value="midi">Midi</option>
                <option value="soir">Soir</option>
              </select>
            </div>
          </div>

          {menu ? (
            // Mode modification d'un menu existant
            <div>
              <h3>Modifier le menu du {menuMealPeriod} du {new Date(menu.date).toLocaleDateString('fr-FR')}</h3>
              <FormSection title="Entrées" icon={<span role="img" aria-label="entrée">🍽️</span>}>
                {starters.map((starter, index) => (
                  <input
                    key={index}
                    type="text"
                    value={starter}
                    onChange={(e) => handleStarterInputChange(index, e.target.value)}
                    placeholder={`Entrée ${index + 1}`}
                    className={styles.dishInput}
                  />
                ))}
              </FormSection>
              <FormSection title="Plats" icon={<span role="img" aria-label="plat">🍽️</span>}>
                {mainCourses.map((course, index) => (
                  <input
                    key={index}
                    type="text"
                    value={course}
                    onChange={(e) => handleMainCourseInputChange(index, e.target.value)}
                    placeholder={`Plat ${index + 1}`}
                    className={styles.dishInput}
                    required={index === 0}
                  />
                ))}
              </FormSection>
              <FormSection title="Desserts" icon={<span role="img" aria-label="dessert">🍰</span>}>
                {desserts.map((dessert, index) => (
                  <input
                    key={index}
                    type="text"
                    value={dessert}
                    onChange={(e) => handleDessertInputChange(index, e.target.value)}
                    placeholder={`Dessert ${index + 1}`}
                    className={styles.dishInput}
                  />
                ))}
              </FormSection>
              {/* Nouvelle section Extra avec le même style que dishInput */}
              <FormSection title="Extra" icon={<span role="img" aria-label="extra">✨</span>}>
                <textarea
                  value={extra}
                  onChange={(e) => setExtra(e.target.value)}
                  placeholder="Ajoutez des informations supplémentaires ici..."
                  className={styles.dishInput}
                  rows={3}
                />
              </FormSection>
              <button onClick={handleSaveMenu} className={styles.submitButton}>
                Sauvegarder
              </button>
              {message && <p>{message}</p>}
            </div>
          ) : (
            // Mode ajout d'un nouveau menu
            <form onSubmit={handleAddMenuSubmit}>
              <h3>Ajouter un nouveau menu</h3>
              <FormSection title="Entrées" icon={<span role="img" aria-label="entrée">🍽️</span>}>
                {starters.map((starter, index) => (
                  <input
                    key={index}
                    type="text"
                    value={starter}
                    onChange={(e) => handleStarterInputChange(index, e.target.value)}
                    placeholder={`Entrée ${index + 1}`}
                    className={styles.dishInput}
                  />
                ))}
              </FormSection>
              <FormSection title="Plats" icon={<span role="img" aria-label="plat">🍽️</span>}>
                {mainCourses.map((course, index) => (
                  <input
                    key={index}
                    type="text"
                    value={course}
                    onChange={(e) => handleMainCourseInputChange(index, e.target.value)}
                    placeholder={`Plat ${index + 1}`}
                    className={styles.dishInput}
                    required={index === 0}
                  />
                ))}
              </FormSection>
              <FormSection title="Desserts" icon={<span role="img" aria-label="dessert">🍰</span>}>
                {desserts.map((dessert, index) => (
                  <input
                    key={index}
                    type="text"
                    value={dessert}
                    onChange={(e) => handleDessertInputChange(index, e.target.value)}
                    placeholder={`Dessert ${index + 1}`}
                    className={styles.dishInput}
                  />
                ))}
              </FormSection>
              {/* Section Extra pour ajout */}
              <FormSection title="Extra" icon={<span role="img" aria-label="extra">✨</span>}>
                <input
                  value={extra}
                  onChange={(e) => setExtra(e.target.value)}
                  placeholder="Extra 1"
                  className={styles.dishInput}
                />
              </FormSection>
              <button type="submit" className={styles.submitButton}>
                Ajouter le menu
              </button>
              {message && <p>{message}</p>}
            </form>
          )}
        </div>
      )}

      {activeTab === 'statistiques' && (
        <div>
          <h2>Statistiques</h2>
          <div className={styles.filterSection}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Du :</label>
              <input
                type="date"
                value={filterStartDate}
                onChange={(e) => setFilterStartDate(e.target.value)}
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Au :</label>
              <input
                type="date"
                value={filterEndDate}
                onChange={(e) => setFilterEndDate(e.target.value)}
              />
            </div>
            <button onClick={fetchStatistics} className={styles.submitButton}>
              Filtrer
            </button>
          </div>
          {loadingStats ? (
            <p>Chargement des statistiques...</p>
          ) : stats ? (
            <div>
              <p>Total des feedbacks : {stats.total}</p>
              <p>
                Moyennes : Entrée {stats.averages.avg_appetizer ? parseFloat(stats.averages.avg_appetizer).toFixed(1) : '-'} | Plat{' '}
                {stats.averages.avg_main_course ? parseFloat(stats.averages.avg_main_course).toFixed(1) : '-'} | Goût{' '}
                {stats.averages.avg_taste ? parseFloat(stats.averages.avg_taste).toFixed(1) : '-'} | Portion{' '}
                {stats.averages.avg_portion ? parseFloat(stats.averages.avg_portion).toFixed(1) : '-'} | Dessert{' '}
                {stats.averages.avg_dessert ? parseFloat(stats.averages.avg_dessert).toFixed(1) : '-'} | Extra{' '}
                {stats.averages.avg_extra ? parseFloat(stats.averages.avg_extra).toFixed(1) : '-'}
              </p>

              {/* Graphique linéaire : Evolution des feedbacks */}
              <div className={styles.chartContainer}>
                <h3>Évolution des feedbacks</h3>
                <Line
                  data={{
                    labels: stats.groupByDate.map((item: any) => item.feedback_date),
                    datasets: [
                      {
                        label: 'Nombre de feedbacks',
                        data: stats.groupByDate.map((item: any) => parseInt(item.count)),
                        fill: false,
                        borderColor: 'rgba(75,192,192,1)',
                        tension: 0.1,
                      },
                    ],
                  }}
                  options={lineChartOptions}
                />
              </div>

              {/* Graphique donut : Statut de l’assiette */}
              <div className={styles.chartContainer} style={{ maxWidth: '400px', margin: '0 auto' }}>
                <h3>Statut de l'assiette</h3>
                <Pie
                  data={{
                    labels: stats.finished.map((item: any) =>
                      item.finished_plate ? 'Tout mangé' : 'Partiellement mangé'
                    ),
                    datasets: [
                      {
                        data: stats.finished.map((item: any) => parseInt(item.count)),
                        backgroundColor: ['#F44336', '#4CAF50'],
                      },
                    ],
                  }}
                  options={pieChartOptions}
                />
              </div>

              {/* Graphique groupé en barres : Distribution des notes */}
              <div className={styles.chartContainer}>
                <h3>Distribution des notes</h3>
                <Bar
                  data={{
                    labels: [1, 2, 3, 4, 5],
                    datasets: [
                      {
                        label: 'Entrée',
                        data: stats.distribution.appetizer.map((item: any) => parseInt(item.count)),
                        backgroundColor: 'rgba(255,99,132,0.5)',
                      },
                      {
                        label: 'Plat principal',
                        data: stats.distribution.mainCourse.map((item: any) => parseInt(item.count)),
                        backgroundColor: 'rgba(54, 162, 235, 0.5)',
                      },
                      {
                        label: 'Goût général',
                        data: stats.distribution.taste.map((item: any) => parseInt(item.count)),
                        backgroundColor: 'rgba(255,206,86,0.5)',
                      },
                      {
                        label: 'Portion',
                        data: stats.distribution.portion.map((item: any) => parseInt(item.count)),
                        backgroundColor: 'rgba(75,192,192,0.5)',
                      },
                      {
                        label: 'Dessert',
                        data: stats.distribution.dessert.map((item: any) => parseInt(item.count)),
                        backgroundColor: 'rgba(153,102,255,0.5)',
                      },
                    ],
                  }}
                  options={barChartOptions}
                />
              </div>

              {/* Fréquence des sélections de plats */}
              <div className={styles.chartContainer}>
                <h3>Fréquence des sélections - Entrées</h3>
                <Bar
                  data={{
                    labels: stats.dishFrequencies.starter.map((item: any) => item.dish),
                    datasets: [
                      {
                        label: 'Entrées',
                        data: stats.dishFrequencies.starter.map((item: any) => parseInt(item.count)),
                        backgroundColor: 'rgba(255,159,64,0.5)',
                      },
                    ],
                  }}
                  options={barChartOptions}
                />
              </div>
              <div className={styles.chartContainer}>
                <h3>Fréquence des sélections - Plats principaux</h3>
                <Bar
                  data={{
                    labels: stats.dishFrequencies.mainCourse.map((item: any) => item.dish),
                    datasets: [
                      {
                        label: 'Plats principaux',
                        data: stats.dishFrequencies.mainCourse.map((item: any) => parseInt(item.count)),
                        backgroundColor: 'rgba(75,192,192,0.5)',
                      },
                    ],
                  }}
                  options={barChartOptions}
                />
              </div>
              <div className={styles.chartContainer}>
                <h3>Fréquence des sélections - Desserts</h3>
                <Bar
                  data={{
                    labels: stats.dishFrequencies.dessert.map((item: any) => item.dish),
                    datasets: [
                      {
                        label: 'Desserts',
                        data: stats.dishFrequencies.dessert.map((item: any) => parseInt(item.count)),
                        backgroundColor: 'rgba(153,102,255,0.5)',
                      },
                    ],
                  }}
                  options={barChartOptions}
                />
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
