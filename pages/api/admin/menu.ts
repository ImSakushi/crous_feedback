// Exemple dans pages/api/admin/menu.ts
import { NextApiRequest, NextApiResponse } from 'next';
import pool from '@/lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { date, mealPeriod, starters, mainCourses } = req.body;
    if (!date || !mealPeriod || !starters || !mainCourses) {
      return res.status(400).json({ error: 'Tous les champs sont requis.' });
    }
    try {
      const result = await pool.query(
        `INSERT INTO menus (date, meal_period, starters, main_courses)
         VALUES ($1, $2, $3, $4) RETURNING *`,
         [date, mealPeriod, starters, mainCourses]
      );
      res.status(200).json({ message: 'Menu ajouté', menu: result.rows[0] });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Erreur lors de l\'ajout du menu' });
    }
  } else {
    res.status(405).json({ error: 'Méthode non autorisée' });
  }
}