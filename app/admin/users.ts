// pages/api/admin/users.ts
import { NextApiRequest, NextApiResponse } from 'next';
import pool from '@/lib/db';
import { jwtVerify } from 'jose';
import bcrypt from 'bcrypt';

async function verifySuperadmin(req: NextApiRequest) {
  const token = req.cookies.token;
  if (!token) throw new Error("Non authentifié");
  const secret = new TextEncoder().encode(process.env.JWT_SECRET!);
  const { payload } = await jwtVerify(token, secret);
  if (payload.role !== 'superadmin') throw new Error("Accès refusé");
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Gestion de la requête OPTIONS (prévol)
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Vérification que seul un superadmin peut accéder
  try {
    await verifySuperadmin(req);
  } catch (e) {
    return res.status(403).json({ error: 'Accès refusé' });
  }
  
  if (req.method === 'GET') {
    try {
      const result = await pool.query('SELECT id, username, role FROM admins ORDER BY username');
      res.status(200).json(result.rows);
    } catch (error) {
      res.status(500).json({ error: "Erreur lors de la récupération des utilisateurs" });
    }
  } else if (req.method === 'POST') {
    const { username, password, role } = req.body;
    if (!username || !password || !role) {
      return res.status(400).json({ error: "Les champs username, password et role sont requis" });
    }
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const result = await pool.query(
        'INSERT INTO admins (username, password, role) VALUES ($1, $2, $3) RETURNING id, username, role',
        [username, hashedPassword, role]
      );
      res.status(201).json({ message: "Utilisateur créé", user: result.rows[0] });
    } catch (error) {
      res.status(500).json({ error: "Erreur lors de la création de l'utilisateur" });
    }
  } else if (req.method === 'PUT') {
    const { id, username, password, role } = req.body;
    if (!id || !username || !role) {
      return res.status(400).json({ error: "Les champs id, username et role sont requis" });
    }
    try {
      if (password) {
        const hashedPassword = await bcrypt.hash(password, 10);
        const result = await pool.query(
          'UPDATE admins SET username = $1, password = $2, role = $3 WHERE id = $4 RETURNING id, username, role',
          [username, hashedPassword, role, id]
        );
        res.status(200).json({ message: 'Utilisateur mis à jour', user: result.rows[0] });
      } else {
        const result = await pool.query(
          'UPDATE admins SET username = $1, role = $2 WHERE id = $3 RETURNING id, username, role',
          [username, role, id]
        );
        res.status(200).json({ message: 'Utilisateur mis à jour', user: result.rows[0] });
      }
    } catch (error) {
      res.status(500).json({ error: "Erreur lors de la mise à jour de l'utilisateur" });
    }
  } else if (req.method === 'DELETE') {
    const id = req.query.id;
    if (!id) {
      return res.status(400).json({ error: "L'id est requis pour la suppression" });
    }
    try {
      const result = await pool.query(
        'DELETE FROM admins WHERE id = $1 RETURNING id',
        [id]
      );
      if (result.rowCount === 0) {
        return res.status(404).json({ error: "Utilisateur non trouvé" });
      }
      res.status(200).json({ message: "Utilisateur supprimé" });
    } catch (error) {
      res.status(500).json({ error: "Erreur lors de la suppression de l'utilisateur" });
    }
  } else {
    res.status(405).json({ error: 'Méthode non autorisée' });
  }
}