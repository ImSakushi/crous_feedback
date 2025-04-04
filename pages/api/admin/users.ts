import { NextApiRequest, NextApiResponse } from 'next';
import { Client } from 'pg';
import { jwtVerify } from 'jose';

async function verifySuperadmin(req: NextApiRequest) {
  const token = req.cookies.token;
  if (!token) throw new Error("Non authentifié");
  const secret = new TextEncoder().encode(process.env.JWT_SECRET!);
  const { payload } = await jwtVerify(token, secret);
  if (payload.role !== 'superadmin') throw new Error("Accès refusé");
}

const client = new Client({
  connectionString: process.env.DATABASE_URL,
});
client.connect();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Vérification que seul un superadmin peut accéder
  try {
    await verifySuperadmin(req);
  } catch (e) {
    return res.status(403).json({ error: 'Accès refusé' });
  }
  
  if (req.method === 'GET') {
    try {
      const result = await client.query('SELECT id, username, role FROM admins ORDER BY username');
      res.status(200).json(result.rows);
    } catch (error) {
      res.status(500).json({ error: "Erreur lors de la récupération des utilisateurs" });
    }
  } else if (req.method === 'PUT') {
    const { id, username, password, role } = req.body;
    if (!id || !username || !role) {
      return res.status(400).json({ error: "Les champs id, username et role sont requis" });
    }
    try {
      if (password) {
        // Mettre à jour le mot de passe si fourni
        const result = await client.query(
          'UPDATE admins SET username = $1, password = $2, role = $3 WHERE id = $4 RETURNING id, username, role',
          [username, password, role, id]
        );
        res.status(200).json({ message: 'Utilisateur mis à jour', user: result.rows[0] });
      } else {
        const result = await client.query(
          'UPDATE admins SET username = $1, role = $2 WHERE id = $3 RETURNING id, username, role',
          [username, role, id]
        );
        res.status(200).json({ message: 'Utilisateur mis à jour', user: result.rows[0] });
      }
    } catch (error) {
      res.status(500).json({ error: "Erreur lors de la mise à jour de l'utilisateur" });
    }
  } else {
    res.status(405).json({ error: 'Méthode non autorisée' });
  }
}