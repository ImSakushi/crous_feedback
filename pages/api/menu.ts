// pages/api/menu.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { Client } from 'pg';

const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

client.connect();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Méthode non autorisée' });
    return;
  }

  const { date, mealPeriod } = req.query;
  if (!date || !mealPeriod) {
    return res.status(400).json({ error: 'Date et mealPeriod sont requis' });
  }

  try {
    const result = await client.query(
      `SELECT * FROM menus WHERE date = $1 AND meal_period = $2`,
      [date, mealPeriod]
    );
    if (result.rows.length > 0) {
      res.status(200).json(result.rows[0]);
    } else {
      res.status(404).json({ error: 'Aucun menu trouvé pour ces paramètres' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur lors de la récupération du menu' });
  }
}