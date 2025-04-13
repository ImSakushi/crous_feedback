// pages/api/admin/menu/scrape.ts

import { NextApiRequest, NextApiResponse } from 'next';
import pool from '@/lib/db';
// Utiliser l'import avec "* as" pour importer cheerio en TS car il n'a pas d'export par défaut
import * as cheerio from 'cheerio';
import { jwtVerify } from 'jose';

// Vérification que l'utilisateur est authentifié et possède le rôle "admin" ou "superadmin"
async function verifyAdmin(req: NextApiRequest): Promise<void> {
  const token = req.cookies.token;
  if (!token) throw new Error("Non authentifié");
  const secret = new TextEncoder().encode(process.env.JWT_SECRET!);
  const { payload } = await jwtVerify(token, secret);
  if (!payload.role || (payload.role !== 'admin' && payload.role !== 'superadmin')) {
    throw new Error("Accès refusé");
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  try {
    // Vérification de l'authentification
    await verifyAdmin(req);

    // Récupérer le contenu HTML depuis le site externe
    const response = await fetch('https://www.crous-bordeaux.fr/restaurant/resto-u-le-capu-3/');
    if (!response.ok) {
      return res.status(500).json({ error: "Impossible d'accéder au site externe" });
    }
    const html = await response.text();

    // Charger le HTML avec cheerio
    const $ = cheerio.load(html);

    // Tableau pour stocker les menus extraits
    const menusScraped: Array<{ date: string; meals: any[] }> = [];

    // Parcours de chaque bloc de menu
    $('.menu').each((i: number, elem: any) => {
      // Extraction du texte de date depuis l'élément ".menu_date_title"
      const dateText: string = $(elem).find('.menu_date .menu_date_title').text().trim(); // par ex. "Menu du lundi 14 avril 2025"
      const dateMatch = dateText.match(/(\d{1,2}\s\w+\s\d{4})/);
      if (!dateMatch) return; // Ignorer si la date n'est pas trouvée

      const dateStr = dateMatch[1]; // par ex. "14 avril 2025"

      // Conversion de la date en format ISO (YYYY-MM-DD)
      const frMonths: Record<string, string> = {
        'janvier': '01',
        'février': '02',
        'mars': '03',
        'avril': '04',
        'mai': '05',
        'juin': '06',
        'juillet': '07',
        'août': '08',
        'septembre': '09',
        'octobre': '10',
        'novembre': '11',
        'décembre': '12'
      };
      const parts = dateStr.split(' ');
      if (parts.length !== 3) return;
      const day = parts[0].padStart(2, '0');
      const month = frMonths[parts[1].toLowerCase()];
      const year = parts[2];
      const dateISO = `${year}-${month}-${day}`;

      // Extraction des repas (déjeuner, dîner, etc.)
      const meals: any[] = [];
      $(elem).find('.meal').each((j: number, mealElem: any) => {
        const mealTitle: string = $(mealElem).find('.meal_title').text().trim(); // par ex. "Déjeuner" ou "Dîner"
        const foodSections: Array<{ section: string; dishes: string[] }> = [];

        // Pour chaque sous-section présente dans la liste (ex: Menu, Desserts)
        $(mealElem).find('.meal_foodies > li').each((k: number, liElem: any) => {
          // Utiliser une fonction avec annotation du contexte this afin de récupérer le texte direct
          const sectionLabel: string = $(liElem)
            .contents()
            .filter(function (this: any) {
              return this.type === 'text';
            })
            .text()
            .trim();
          const dishes: string[] = [];
          $(liElem).find('ul li').each((l: number, dishElem: any) => {
            const dish: string = $(dishElem).text().trim();
            // Filtrer le mot "OU" (en ignorant la casse)
            if(dish.toUpperCase() === 'OU') return;
            if (dish) dishes.push(dish);
          });
          foodSections.push({ section: sectionLabel, dishes });
        });

        meals.push({ mealTitle, foodSections });
      });

      menusScraped.push({ date: dateISO, meals });
    });

    // Insérer ou mettre à jour les menus extraits dans la base de données
    for (const menu of menusScraped) {
      for (const meal of menu.meals) {
        // Détermination du type de repas à partir du titre
        const mealPeriod: string = meal.mealTitle.toLowerCase().includes('déjeuner') ? 'midi' : 'soir';
        let mainCourses: string[] = [];
        let desserts: string[] = [];

        meal.foodSections.forEach((section: { section: string; dishes: string[] }) => {
          if (section.section.toLowerCase().includes('menu')) {
            mainCourses = section.dishes;
          }
          if (section.section.toLowerCase().includes('dessert')) {
            desserts = section.dishes;
          }
        });

        // Vérifier si un menu existe déjà pour cette date et pour ce repas
        const existingMenu = await pool.query(
          'SELECT id FROM menus WHERE date = $1 AND meal_period = $2',
          [menu.date, mealPeriod]
        );

        if (existingMenu.rows.length > 0) {
          // Mise à jour du menu existant
          await pool.query(
            'UPDATE menus SET main_courses = $1, desserts = $2 WHERE id = $3',
            [mainCourses, desserts, existingMenu.rows[0].id]
          );
        } else {
            // Insertion d'un nouveau menu en fournissant une valeur par défaut pour starters
            await pool.query(
                'INSERT INTO menus (date, meal_period, starters, main_courses, desserts) VALUES ($1, $2, $3, $4, $5)',
                [menu.date, mealPeriod, [], mainCourses, desserts]
            );
        }
      }
    }

    return res.status(200).json({ message: 'Menus scrappés et mis à jour avec succès', menus: menusScraped });
  } catch (error: any) {
    console.error('Erreur lors du scraping des menus :', error);
    return res.status(500).json({ error: "Erreur lors du scraping des menus" });
  }
}