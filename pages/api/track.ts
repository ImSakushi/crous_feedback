// pages/api/track.ts
import { NextApiRequest, NextApiResponse } from 'next';
import pool from '@/lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // On autorise uniquement les POST ici
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  // On peut récupérer les informations depuis la query string
  // Exemple d'appel : /api/track?page=feedback&variant=v1&type=visit
  const page = req.query.page as string || 'unknown';
  const variant = req.query.variant as string || 'default';
  const eventType = req.query.type as string || 'unknown';

  try {
    // On insère l'événement dans la table tracking
    await pool.query(
      'INSERT INTO tracking (page, variant, event_type) VALUES ($1, $2, $3)',
      [page, variant, eventType]
    );
    return res.status(200).json({ message: 'Événement enregistré avec succès.' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Erreur lors de l’enregistrement de l’événement.' });
  }
}