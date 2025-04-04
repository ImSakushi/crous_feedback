import { NextApiRequest, NextApiResponse } from 'next';
import { Client } from 'pg';

const client = new Client({
  connectionString: process.env.DATABASE_URL,
});
client.connect();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  const { startDate, endDate } = req.query;
  let filterClause = '';
  let params: any[] = [];

  if (startDate && endDate) {
    filterClause = 'WHERE date BETWEEN $1 AND $2';
    params = [startDate, endDate];
  }

  try {
    // Total des feedbacks
    const totalResult = await client.query(`SELECT COUNT(*) AS total FROM feedback ${filterClause}`, params);
    const total = totalResult.rows[0].total;

    // Moyennes des notes
    const averagesResult = await client.query(
      `SELECT 
         AVG(appetizer_rating) AS avg_appetizer, 
         AVG(main_course_rating) AS avg_main_course, 
         AVG(taste_rating) AS avg_taste, 
         AVG(portion_rating) AS avg_portion 
       FROM feedback ${filterClause}`,
      params
    );

    // Répartition des feedbacks selon "finished_plate"
    const finishedResult = await client.query(
      `SELECT finished_plate, COUNT(*) AS count 
       FROM feedback ${filterClause} 
       GROUP BY finished_plate`,
      params
    );

    // Groupement par date (pour le graphique)
    const groupByDateResult = await client.query(
      `SELECT DATE(date) as feedback_date, COUNT(*) as count 
       FROM feedback ${filterClause} 
       GROUP BY feedback_date 
       ORDER BY feedback_date ASC`,
      params
    );

    res.status(200).json({
      total,
      averages: averagesResult.rows[0],
      finished: finishedResult.rows,
      groupByDate: groupByDateResult.rows,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur lors de la récupération des statistiques' });
  }
}