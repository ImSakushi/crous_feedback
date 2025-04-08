import { NextApiRequest, NextApiResponse } from 'next';
import { serialize } from 'cookie';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    res.setHeader('Set-Cookie', serialize('token', '', {
      maxAge: -1,
      path: '/',
    }));
    return res.status(200).json({ message: 'Déconnexion réussie' });
  } else {
    res.status(405).json({ error: 'Méthode non autorisée' });
  }
}