// pages/api/admin/menu/update.ts
import { NextApiRequest, NextApiResponse } from 'next';
import pool from '@/lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  // On attend les champs : id et mainCourses uniquement.
  const { id, mainCourses } = req.body;
  if (!id || !mainCourses) {
    return res.status(400).json({ error: 'Id et mainCourses sont requis' });
  }

  try {
    const result = await pool.query(
      'UPDATE menus SET main_courses = $1 WHERE id = $2 RETURNING *',
      [mainCourses, id]
    );
    res.status(200).json({ message: 'Menu mis à jour', menu: result.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour du menu' });
  }
}