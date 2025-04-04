import { NextApiRequest, NextApiResponse } from 'next';
import { Client } from 'pg';

const client = new Client({
  connectionString: process.env.DATABASE_URL,
});
client.connect();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  const { id, mainCourses, starters } = req.body;
  if (!id || !mainCourses || !starters) {
    return res.status(400).json({ error: 'Id, mainCourses et starters sont requis' });
  }

  try {
    const result = await client.query(
      'UPDATE menus SET main_courses = $1, starters = $2 WHERE id = $3 RETURNING *',
      [mainCourses, starters, id]
    );
    res.status(200).json({ message: 'Menu mis à jour', menu: result.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour du menu' });
  }
}