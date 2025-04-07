import { NextApiRequest, NextApiResponse } from 'next';
import { Client } from 'pg';
import jwt from 'jsonwebtoken';
import { serialize } from 'cookie';
import bcrypt from 'bcrypt';

const client = new Client({
  connectionString: process.env.DATABASE_URL,
});
client.connect();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username et password requis' });
  }

  try {
    // Récupérer l'utilisateur par son username
    const result = await client.query(
      'SELECT * FROM admins WHERE username = $1',
      [username]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Identifiants invalides' });
    }

    const admin = result.rows[0];
    // Vérifier le mot de passe hashé
    const valid = await bcrypt.compare(password, admin.password);
    if (!valid) {
      return res.status(401).json({ error: 'Identifiants invalides' });
    }

    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is not defined");
      return res.status(500).json({ error: 'Erreur serveur' });
    }

    // Le token inclut désormais le rôle (exemple : "admin" ou "superadmin")
    const token = jwt.sign(
      { id: admin.id, username: admin.username, role: admin.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.setHeader('Set-Cookie', serialize('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 604800, // 7 jours
      path: '/',
      sameSite: 'lax',
    }));
    return res.status(200).json({ message: 'Connexion réussie', admin });
  } catch (error) {
    console.error("Erreur dans le login:", error);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
}