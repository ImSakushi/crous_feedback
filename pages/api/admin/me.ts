import { NextApiRequest, NextApiResponse } from 'next';
import { jwtVerify } from 'jose';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({ error: 'Non authentifié' });
  }
  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET!);
    const { payload } = await jwtVerify(token, secret);
    res.status(200).json({ admin: payload });
  } catch (e) {
    res.status(401).json({ error: 'Token invalide' });
  }
}