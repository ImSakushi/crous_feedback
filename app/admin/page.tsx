'use client';

import React, { useState, useEffect } from 'react';
import FormSection from '@/components/FormSection';
import styles from './admin.module.css';
import { Line, Bar, Pie } from 'react-chartjs-2';
import 'chart.js/auto';
import { useRouter } from 'next/navigation';

interface Menu {
  id?: number;
  date: string;
  meal_period: string;
  main_courses: string[];
  accompaniments?: string[];
  extra?: string;
}

export default function AdminPanel() {
  const router = useRouter();

  // Gestion des onglets
  const [activeTab, setActiveTab] = useState<'menus' | 'statistiques'>('menus');

  // États pour la gestion du menu (nouveau schéma : plus d'entrée ni dessert, uniquement plat et accompagnement)
  const [menuDate, setMenuDate] = useState('');
  const [menuMealPeriod, setMenuMealPeriod] = useState('midi');
  const [menu, setMenu] = useState<Menu | null>(null);
  const [mainCourses, setMainCourses] = useState<string[]>(['']);
  const [accompaniments, setAccompaniments] = useState<string[]>(['']);
  const [extra, setExtra] = useState('');
  const [message, setMessage] = useState('');

  // États des statistiques
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

  // Récupération du menu (mise à jour : le menu retourne main_courses et accompaniments)
  useEffect(() => {
    async function fetchMenuData() {
      if (!menuDate) {
        setMenu(null);
        setMainCourses(['']);
        setAccompaniments(['']);
        setExtra('');
        return;
      }
      try {
        const res = await fetch(`/api/menu?date=${menuDate}&mealPeriod=${menuMealPeriod}`);
        if (res.ok) {
          const data = await res.json();
          setMenu(data);
          setMainCourses(data.main_courses);
          setAccompaniments(data.accompaniments || ['']);
          setExtra(data.extra || '');
        } else {
          setMenu(null);
          setMainCourses(['']);
          setAccompaniments(['']);
          setExtra('');
        }
      } catch (error) {
        console.error(error);
        setMenu(null);
      }
    }
    fetchMenuData();
  }, [menuDate, menuMealPeriod]);

  // Gestion du champ Plat principal
  const handleMainCourseInputChange = (index: number, value: string) => {
    const newMainCourses = [...mainCourses];
    newMainCourses[index] = value;
    setMainCourses(newMainCourses);
    if (index === newMainCourses.length - 1 && value.trim() !== '') {
      setMainCourses([...newMainCourses, '']);
    }
  };

  // Gestion du champ Accompagnement
  const handleAccompanimentInputChange = (index: number, value: string) => {
    const newAccompaniments = [...accompaniments];
    newAccompaniments[index] = value;
    setAccompaniments(newAccompaniments);
    if (index === newAccompaniments.length - 1 && value.trim() !== '') {
      setAccompaniments([...newAccompaniments, '']);
    }
  };

  // Ajout d'un menu (mise à jour pour inclure uniquement main_courses et accompaniments)
  const handleAddMenuSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const filteredMainCourses = mainCourses.filter(s => s.trim() !== '');
    const filteredAccompaniments = accompaniments.filter(s => s.trim() !== '');

    try {
      const res = await fetch('/api/admin/menu', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: menuDate,
          mealPeriod: menuMealPeriod,
          mainCourses: filteredMainCourses,
          accompaniments: filteredAccompaniments,
          extra,
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

  // Modification d'un menu existant
  const handleSaveMenu = async () => {
    if (!menu || !menu.id) return;
    try {
      const res = await fetch('/api/admin/menu/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: menu.id,
          mainCourses,
          accompaniments,
          extra,
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

  // Nouvelle fonction : déclenche le scraping des menus
  const handleScrapeMenus = async () => {
    try {
      const res = await fetch('/api/admin/menu/scrape', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setMessage('Menus scrappés et mis à jour avec succès');
      } else {
        setMessage('Erreur lors du scraping des menus');
      }
    } catch (error) {
      console.error(error);
      setMessage('Erreur lors du scraping des menus');
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

  // Options communes pour les graphiques
  const lineChartOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top' as const },
    },
  };

  const barChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: 'top' as const,
        labels: {
          font: { size: 14 },
        },
      },
      tooltip: {
        callbacks: {
          label: function (context: any) {
            return `${context.dataset.label} : ${context.parsed.y}`;
          },
        },
      },
    },
    scales: {
      x: {
        title: { display: true, text: 'Notes', font: { size: 14 } },
      },
      y: {
        title: { display: true, text: 'Nombre', font: { size: 14 } },
        beginAtZero: true,
      },
    },
  };

  const pieChartOptions = {
    responsive: true,
    plugins: { legend: { position: 'top' as const } },
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
      {/* Bouton de déconnexion sticky */}
      <button onClick={handleLogout} className={styles.logoutButton}>
        Déconnexion
      </button>

      <h1>Panel Admin - Gestion des menus et Statistiques</h1>

      {/* Onglets pour basculer */}
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
          <button onClick={handleScrapeMenus} className={styles.submitButton} style={{ marginBottom: '16px' }}>
            Mettre à jour les menus automatiquement
          </button>
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
            // Mode modification du menu existant
            <div>
              <h3>Modifier le menu du {menuMealPeriod} du {new Date(menu.date).toLocaleDateString('fr-FR')}</h3>
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
              <FormSection title="Accompagnements" icon={<span role="img" aria-label="accompagnement">🥦</span>}>
                {accompaniments.map((accompaniment, index) => (
                  <input
                    key={index}
                    type="text"
                    value={accompaniments[index]}
                    onChange={(e) => handleAccompanimentInputChange(index, e.target.value)}
                    placeholder={`Accompagnement ${index + 1}`}
                    className={styles.dishInput}
                  />
                ))}
              </FormSection>
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
              <FormSection title="Plats" icon={<span role="img" aria-label="plat">🍽️</span>}>
                {mainCourses.map((course, index) => (
                  <input
                    key={index}
                    type="text"
                    value={course}
                    onChange={(e) => handleMainCourseInputChange(index, e.target.value)}
                    placeholder={`Plat ${index + 1}`}
                    className={styles.dishInput}
                  />
                ))}
              </FormSection>
              <FormSection title="Accompagnements" icon={<span role="img" aria-label="accompagnement">🥦</span>}>
                {accompaniments.map((accompaniment, index) => (
                  <input
                    key={index}
                    type="text"
                    value={accompaniments[index]}
                    onChange={(e) => handleAccompanimentInputChange(index, e.target.value)}
                    placeholder={`Accompagnement ${index + 1}`}
                    className={styles.dishInput}
                  />
                ))}
              </FormSection>
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
                Moyennes : Plat principal {stats.averages.avg_main_dish ? parseFloat(stats.averages.avg_main_dish).toFixed(1) : '-'} | Goût du plat {stats.averages.avg_main_taste ? parseFloat(stats.averages.avg_main_taste).toFixed(1) : '-'} | Accompagnement {stats.averages.avg_accompaniment ? parseFloat(stats.averages.avg_accompaniment).toFixed(1) : '-'} | Goût de l'accompagnement {stats.averages.avg_accompaniment_taste ? parseFloat(stats.averages.avg_accompaniment_taste).toFixed(1) : '-'} | Portion {stats.averages.avg_portion ? parseFloat(stats.averages.avg_portion).toFixed(1) : '-'}
              </p>

              {/* Graphique linéaire : Évolution des feedbacks */}
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

              {/* Graphique donut : Statut de l'assiette */}
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

              {/* Graphique en barres : Distribution des notes */}
              <div className={styles.chartContainer}>
                <h3>Distribution des notes</h3>
                <Bar
                  data={{
                    labels: [1, 2, 3, 4, 5],
                    datasets: [
                      {
                        label: 'Plat principal',
                        data: stats.distribution.mainCourse.map((item: any) => parseInt(item.count)),
                        backgroundColor: 'rgba(54, 162, 235, 0.5)',
                      },
                      {
                        label: 'Goût du plat',
                        data: stats.distribution.taste.map((item: any) => parseInt(item.count)),
                        backgroundColor: 'rgba(255, 206, 86, 0.5)',
                      },
                      {
                        label: 'Accompagnement',
                        data: stats.distribution.accompaniment.map((item: any) => parseInt(item.count)),
                        backgroundColor: 'rgba(75,192,192,0.5)',
                      },
                      {
                        label: 'Goût de l’accompagnement',
                        data: stats.distribution.accompaniment_taste.map((item: any) => parseInt(item.count)),
                        backgroundColor: 'rgba(153, 102, 255, 0.5)',
                      },
                      {
                        label: 'Portion',
                        data: stats.distribution.portion.map((item: any) => parseInt(item.count)),
                        backgroundColor: 'rgba(255, 159, 64, 0.5)',
                      },
                    ],
                  }}
                  options={barChartOptions}
                />
              </div>

              {/* Fréquence des sélections pour le plat principal */}
              <div className={styles.chartContainer}>
                <h3>Fréquence des sélections - Plat principal</h3>
                <Bar
                  data={{
                    labels: stats.dishFrequencies.mainCourse.map((item: any) => item.dish),
                    datasets: [
                      {
                        label: 'Plat principal',
                        data: stats.dishFrequencies.mainCourse.map((item: any) => parseInt(item.count)),
                        backgroundColor: 'rgba(54, 162, 235, 0.5)',
                      },
                    ],
                  }}
                  options={barChartOptions}
                />
              </div>

              {/* Fréquence des sélections pour l’accompagnement */}
              <div className={styles.chartContainer}>
                <h3>Fréquence des sélections - Accompagnement</h3>
                <Bar
                  data={{
                    labels: stats.dishFrequencies.accompaniment.map((item: any) => item.dish),
                    datasets: [
                      {
                        label: 'Accompagnement',
                        data: stats.dishFrequencies.accompaniment.map((item: any) => parseInt(item.count)),
                        backgroundColor: 'rgba(75,192,192,0.5)',
                      },
                    ],
                  }}
                  options={barChartOptions}
                />
              </div>
              <div className={styles.commentsSection} style={{ marginTop: '20px', paddingTop: '10px', borderTop: '1px solid #ccc' }}>
                <h3>Commentaires</h3>
                {stats.comments && stats.comments.length > 0 ? (
                  <ul>
                    {stats.comments.map((item: any, index: number) => (
                      <li key={index}>
                        <strong>{new Date(item.date).toLocaleDateString('fr-FR')}</strong> : {item.comment}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>Aucun commentaire disponible pour la période sélectionnée.</p>
                )}
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