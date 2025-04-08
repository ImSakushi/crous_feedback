// pages/api/admin/menu.ts
import { NextApiRequest, NextApiResponse } from 'next';
import pool from '@/lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { date, mealPeriod, starters, mainCourses, desserts } = req.body;
    try {
      const result = await pool.query(
        'INSERT INTO menus (date, meal_period, starters, main_courses, desserts) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [date, mealPeriod, starters, mainCourses, desserts]
      );
      return res.status(200).json(result.rows[0]);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Erreur lors de l'ajout du menu" });
    }
  } else if (req.method === 'GET') {
    // Récupération d'un menu
    const { date, mealPeriod } = req.query;
    if (!date || !mealPeriod) {
      return res.status(400).json({ error: 'Date et mealPeriod sont requis' });
    }
    try {
      const result = await pool.query(
        'SELECT * FROM menus WHERE date = $1 AND meal_period = $2',
        [date, mealPeriod]
      );
      if (result.rows.length > 0) {
        return res.status(200).json(result.rows[0]);
      } else {
        return res.status(404).json({ error: 'Aucun menu trouvé pour ces paramètres' });
      }
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Erreur lors de la récupération du menu" });
    }
  } else {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }
}