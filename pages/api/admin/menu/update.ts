// pages/api/admin/menu/update.ts
import { NextApiRequest, NextApiResponse } from 'next';
import pool from '@/lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  const { id, starters, mainCourses, desserts } = req.body;
  if (!id || !starters || !mainCourses || desserts === undefined) {
    return res.status(400).json({ error: 'Id, starters, mainCourses et desserts sont requis' });
  }

  try {
    const result = await pool.query(
      'UPDATE menus SET starters = $1, main_courses = $2, desserts = $3 WHERE id = $4 RETURNING *',
      [starters, mainCourses, desserts, id]
    );
    res.status(200).json({ message: 'Menu mis à jour', menu: result.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour du menu' });
  }
}