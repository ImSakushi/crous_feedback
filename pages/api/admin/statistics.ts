// pages/api/admin/statistics.ts

import { NextApiRequest, NextApiResponse } from 'next';
import pool from '@/lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  // Récupération des filtres de date éventuels
  const { startDate, endDate } = req.query;
  let filterClause = '';
  let params: any[] = [];

  if (startDate && endDate) {
    filterClause = 'WHERE date BETWEEN $1 AND $2';
    params = [startDate, endDate];
  }

  try {
    // Total des feedbacks
    const totalResult = await pool.query(
      `SELECT COUNT(*) AS total FROM feedback ${filterClause}`,
      params
    );
    const total = totalResult.rows[0].total;

    // Moyennes des notes pour le plat principal, son goût, l'accompagnement, son goût et la portion
    const averagesResult = await pool.query(
      `SELECT 
         AVG(main_dish_rating) AS avg_main_dish, 
         AVG(main_dish_taste_rating) AS avg_main_taste, 
         AVG(accompaniment_rating) AS avg_accompaniment, 
         AVG(accompaniment_taste_rating) AS avg_accompaniment_taste, 
         AVG(portion_rating) AS avg_portion
       FROM feedback ${filterClause}`,
      params
    );

    // Répartition selon finished_plate
    const finishedResult = await pool.query(
      `SELECT finished_plate, COUNT(*) AS count 
       FROM feedback ${filterClause} 
       GROUP BY finished_plate`,
      params
    );

    // Groupement par date pour afficher l'évolution des feedbacks
    const groupByDateResult = await pool.query(
      `SELECT DATE(date) AS feedback_date, COUNT(*) AS count 
       FROM feedback ${filterClause} 
       GROUP BY feedback_date 
       ORDER BY feedback_date ASC`,
      params
    );

    // Distribution des notes pour chaque critère
    const distMainCourseResult = await pool.query(
      `SELECT main_dish_rating AS rating, COUNT(*) AS count
       FROM feedback ${filterClause}
       GROUP BY main_dish_rating
       ORDER BY main_dish_rating`,
      params
    );
    const distTasteResult = await pool.query(
      `SELECT main_dish_taste_rating AS rating, COUNT(*) AS count
       FROM feedback ${filterClause}
       GROUP BY main_dish_taste_rating
       ORDER BY main_dish_taste_rating`,
      params
    );
    const distAccompanimentResult = await pool.query(
      `SELECT accompaniment_rating AS rating, COUNT(*) AS count
       FROM feedback ${filterClause}
       GROUP BY accompaniment_rating
       ORDER BY accompaniment_rating`,
      params
    );
    const distAccompanimentTasteResult = await pool.query(
      `SELECT accompaniment_taste_rating AS rating, COUNT(*) AS count
       FROM feedback ${filterClause}
       GROUP BY accompaniment_taste_rating
       ORDER BY accompaniment_taste_rating`,
      params
    );
    const distPortionResult = await pool.query(
      `SELECT portion_rating AS rating, COUNT(*) AS count
       FROM feedback ${filterClause}
       GROUP BY portion_rating
       ORDER BY portion_rating`,
      params
    );

    // Fréquence des sélections pour le plat principal et pour l’accompagnement
    const freqMainCourseResult = await pool.query(
      `SELECT chosen_main_course AS dish, COUNT(*) AS count
       FROM feedback ${filterClause}
       GROUP BY chosen_main_course
       ORDER BY count DESC`,
      params
    );
    const freqAccompanimentResult = await pool.query(
      `SELECT chosen_accompaniment AS dish, COUNT(*) AS count
       FROM feedback ${filterClause}
       GROUP BY chosen_accompaniment
       ORDER BY count DESC`,
      params
    );

    // Récupération des commentaires non vides
    let commentsQuery = `SELECT comment, date FROM feedback `;
    if (filterClause) {
      commentsQuery += ` ${filterClause} AND comment IS NOT NULL AND comment <> '' ORDER BY date DESC`;
    } else {
      commentsQuery += `WHERE comment IS NOT NULL AND comment <> '' ORDER BY date DESC`;
    }
    const commentsResult = await pool.query(commentsQuery, params);

    res.status(200).json({
      total,
      averages: averagesResult.rows[0],
      finished: finishedResult.rows,
      groupByDate: groupByDateResult.rows,
      distribution: {
        mainCourse: distMainCourseResult.rows,
        taste: distTasteResult.rows,
        accompaniment: distAccompanimentResult.rows,
        accompaniment_taste: distAccompanimentTasteResult.rows,
        portion: distPortionResult.rows,
      },
      dishFrequencies: {
        mainCourse: freqMainCourseResult.rows,
        accompaniment: freqAccompanimentResult.rows,
      },
      comments: commentsResult.rows
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur lors de la récupération des statistiques' });
  }
}