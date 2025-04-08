// pages/api/admin/statistics.ts
import { NextApiRequest, NextApiResponse } from 'next';
import pool from '@/lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  // Récupération des filtres de date (optionnels)
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

    // Moyennes des notes (y compris dessert_rating)
    const averagesResult = await pool.query(
      `SELECT 
         AVG(appetizer_rating) AS avg_appetizer, 
         AVG(main_course_rating) AS avg_main_course, 
         AVG(taste_rating) AS avg_taste, 
         AVG(portion_rating) AS avg_portion,
         AVG(dessert_rating) AS avg_dessert
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

    // Groupement par date (pour le graphique linéaire)
    const groupByDateResult = await pool.query(
      `SELECT DATE(date) as feedback_date, COUNT(*) as count 
       FROM feedback ${filterClause} 
       GROUP BY feedback_date 
       ORDER BY feedback_date ASC`,
      params
    );

    // Distribution des notes pour chaque critère
    const distAppetizerResult = await pool.query(
      `SELECT appetizer_rating as rating, COUNT(*) as count
       FROM feedback ${filterClause}
       GROUP BY appetizer_rating
       ORDER BY appetizer_rating`,
      params
    );
    const distMainCourseResult = await pool.query(
      `SELECT main_course_rating as rating, COUNT(*) as count
       FROM feedback ${filterClause}
       GROUP BY main_course_rating
       ORDER BY main_course_rating`,
      params
    );
    const distTasteResult = await pool.query(
      `SELECT taste_rating as rating, COUNT(*) as count
       FROM feedback ${filterClause}
       GROUP BY taste_rating
       ORDER BY taste_rating`,
      params
    );
    const distPortionResult = await pool.query(
      `SELECT portion_rating as rating, COUNT(*) as count
       FROM feedback ${filterClause}
       GROUP BY portion_rating
       ORDER BY portion_rating`,
      params
    );
    const distDessertResult = await pool.query(
      `SELECT dessert_rating as rating, COUNT(*) as count
       FROM feedback ${filterClause}
       GROUP BY dessert_rating
       ORDER BY dessert_rating`,
      params
    );

    // Fréquence des sélections de plats (les champs chosen_starter, chosen_main_course et chosen_dessert)
    const freqStarterResult = await pool.query(
      `SELECT chosen_starter as dish, COUNT(*) as count
       FROM feedback ${filterClause}
       GROUP BY chosen_starter
       ORDER BY count DESC`,
      params
    );
    const freqMainCourseResult = await pool.query(
      `SELECT chosen_main_course as dish, COUNT(*) as count
       FROM feedback ${filterClause}
       GROUP BY chosen_main_course
       ORDER BY count DESC`,
      params
    );
    const freqDessertResult = await pool.query(
      `SELECT chosen_dessert as dish, COUNT(*) as count
       FROM feedback ${filterClause}
       GROUP BY chosen_dessert
       ORDER BY count DESC`,
      params
    );

    res.status(200).json({
      total,
      averages: averagesResult.rows[0],
      finished: finishedResult.rows,
      groupByDate: groupByDateResult.rows,
      distribution: {
        appetizer: distAppetizerResult.rows,
        mainCourse: distMainCourseResult.rows,
        taste: distTasteResult.rows,
        portion: distPortionResult.rows,
        dessert: distDessertResult.rows,
      },
      dishFrequencies: {
        starter: freqStarterResult.rows,
        mainCourse: freqMainCourseResult.rows,
        dessert: freqDessertResult.rows,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur lors de la récupération des statistiques' });
  }
}