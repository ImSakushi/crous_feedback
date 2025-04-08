// pages/api/feedback.ts
import { NextApiRequest, NextApiResponse } from 'next';
import pool from '@/lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { 
      appetizerRating, 
      mainCourseRating, 
      tasteRating, 
      portionRating, 
      dessertRating,
      finishedPlate, 
      notEatenReason,
      comment, 
      date 
    } = req.body;
    try {
      const result = await pool.query(
        `INSERT INTO feedback (
          appetizer_rating, 
          main_course_rating, 
          taste_rating, 
          portion_rating, 
          dessert_rating,
          finished_plate, 
          not_eaten_reason,
          comment, 
          date
        )
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
         [
          appetizerRating, 
          mainCourseRating, 
          tasteRating, 
          portionRating, 
          dessertRating,
          finishedPlate, 
          notEatenReason,
          comment, 
          date
        ]
      );
      res.status(200).json(result.rows[0]);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Erreur lors de l'insertion du feedback" });
    }
  } else if (req.method === 'GET') {
    try {
      const result = await pool.query(`SELECT * FROM feedback ORDER BY date DESC`);
      res.status(200).json(result.rows);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Erreur lors de la récupération des feedbacks" });
    }
  } else {
    res.status(405).json({ error: 'Méthode non autorisée' });
  }
}