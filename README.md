# RU-Feedback

**rufeedback** est une application web de feedback pour les repas du Resto U. Ce projet, construit avec [Next.js](https://nextjs.org) et TypeScript, permet aux utilisateurs de donner leur avis sur les repas (entrée, plat, dessert) et aux administrateurs de gérer les menus ainsi que de visualiser des statistiques détaillées.

![Screenshot](./screenshot.png)  
*(Ajoutez ici une capture d’écran ou un GIF démontrant l’application)*

---

## Table des matières

- [Fonctionnalités](#fonctionnalités)
- [Architecture et structure du projet](#architecture-et-structure-du-projet)
- [Installation et configuration](#installation-et-configuration)
- [Utilisation en développement](#utilisation-en-développement)
- [Déploiement](#déploiement)
- [API et endpoints](#api-et-endpoints)
- [Technologies utilisées](#technologies-utilisées)
- [Contribution](#contribution)
- [Licence](#licence)

---

## Fonctionnalités

- **Feedback utilisateur**  
  - Évaluation du repas du jour (entrée, plat, dessert, goût général et portion)
  - Sélection et saisie d’options prédéfinies ou personnalisées
  - Saisie de commentaires et raisons en cas de plat non terminé

- **Gestion des menus**  
  - Visualisation et ajout/modification des menus selon la date et la période (midi/soir)
  - Possibilité d’ajouter plusieurs entrées, plats et desserts

- **Interface administrateur**  
  - Connexion sécurisée pour l’admin (avec gestion de cookie et JWT)
  - Tableau de bord pour la gestion des menus et consultation des statistiques
  - Module de gestion des utilisateurs accessible aux superadmins (création, modification, suppression)
  - Statistiques détaillées et graphiques (linéaire, camembert et barre) pour analyser les feedbacks

- **Expérience utilisateur optimisée**  
  - Utilisation de composants réactifs (Star Rating, Dropdown Select, Radio Buttons) et d’une interface moderne
  - Gestion des erreurs et page 404 personnalisée

---

## Architecture et structure du projet

Le projet suit une architecture modulaire avec séparation claire entre le front-end et les API :

```
rufeedback/
├── Procfile
├── README.md
├── app/                     # Répertoire Next.js App Router
│   ├── admin/               # Pages et composants d'administration
│   ├── feedback/            # Page de feedback utilisateur
│   ├── history/             # Historique des feedbacks
│   ├── layout.tsx           # Layout général avec intégration de la police et bouton d’accès admin
│   ├── not-found.tsx        # Page 404 personnalisée
│   └── page.tsx             # Page d'accueil
├── components/              # Composants UI réutilisables (StarRating, FormSection, DropdownSelect, etc.)
├── constants/               # Fichier des constantes (ex. couleurs)
├── eslint.config.mjs        # Configuration ESLint personnalisée
├── lib/                     # Configuration et accès à la base de données (PostgreSQL)
├── middleware.ts            # Middleware Next.js pour la gestion de l'authentification des pages admin
├── next.config.ts           # Configuration de l’application Next.js
├── pages/                   # API routes
│   └── api/                 # Endpoints pour feedback, menus, authentification, statistiques, et gestion des utilisateurs
├── public/                  # Ressources statiques (polices, favicon, etc.)
├── store/                   # Store Zustand pour la gestion d’état (feedback store)
└── styles/                  # Feuilles de style globales
```

Chaque section du projet est organisée pour faciliter la maintenance, le développement collaboratif et l’ajout de nouvelles fonctionnalités.

---

## Installation et configuration

### Prérequis

- [Node.js](https://nodejs.org) (version LTS recommandée)
- [PostgreSQL](https://www.postgresql.org)

### Clonage du dépôt

```bash
git clone https://github.com/votre-utilisateur/rufeedback.git
cd rufeedback
```

### Installation des dépendances

Utilisez npm, yarn, pnpm ou bun selon votre préférence :

```bash
npm install
# ou
yarn install
```

### Configuration de l’environnement

Créez un fichier `.env` à la racine du projet et ajoutez-y vos variables d’environnement :

```env
DATABASE_URL=postgres://user:password@localhost:5432/votre_base
JWT_SECRET=votre_secret_pour_JWT
NODE_ENV=development
```

Vérifiez que toutes vos variables nécessaires sont définies pour connecter l’application à PostgreSQL et sécuriser l’authentification.

---

## Utilisation en développement

Pour démarrer le serveur en mode développement :

```bash
npm run dev
# ou
yarn dev
```

Ouvrez ensuite [http://localhost:3000](http://localhost:3000) dans votre navigateur.  
Les modifications apportées aux fichiers dans le répertoire `app` ou `components` seront automatiquement reflétées grâce au hot-reload de Next.js.

---

## Déploiement

L’application peut être déployée facilement sur [Vercel](https://vercel.com) ou tout autre fournisseur compatible Node.js.  
Pour utiliser le fichier **Procfile** et déployer sur une plateforme compatible avec ce type de configuration (par exemple Heroku), assurez-vous que les scripts définis dans le `package.json` correspondent à ce qui est attendu.

Pour plus de détails, consultez la [documentation de déploiement de Next.js](https://nextjs.org/docs/app/building-your-application/deploying).

---

## API et endpoints

### Endpoints principaux

- **Feedback**
  - `POST /api/feedback` : Envoi du feedback utilisateur
  - `GET /api/feedback` : Récupération de l’historique des feedbacks

- **Menus**
  - `GET /api/menu?date=YYYY-MM-DD&mealPeriod=midi|soir` : Récupérer le menu d’une date et période donnée
  - `POST /api/admin/menu` : Ajouter un nouveau menu
  - `PUT /api/admin/menu/update` : Mettre à jour un menu existant
  - `GET /api/admin/menus` : Récupérer la liste des menus

- **Administration**
  - `POST /api/admin/login` : Authentifier un administrateur
  - `POST /api/admin/logout` : Déconnexion
  - `GET /api/admin/me` : Récupération des informations de l’admin connecté
  - `GET/POST/PUT/DELETE /api/admin/users` : Gestion des utilisateurs (accès réservé aux superadmins)

- **Statistiques**
  - `GET /api/admin/statistics?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD` : Visualiser les feedbacks et statistiques selon un intervalle de dates

Chaque endpoint est sécurisé et géré via des middlewares (ex. vérification du token JWT pour accès admin).

---

## Technologies utilisées

- **Framework Front-end** : [Next.js](https://nextjs.org) (App Router)
- **Langage** : TypeScript, JavaScript
- **Base de données** : PostgreSQL (configuration via [pg](https://node-postgres.com))
- **Authentification** : JWT, gestion des cookies avec [cookie](https://www.npmjs.com/package/cookie)
- **Gestion d’état** : [Zustand](https://github.com/pmndrs/zustand)
- **Graphiques** : [chart.js](https://www.chartjs.org) (intégré via React Chartjs 2)
- **Styles** : CSS Modules, styles globaux

---

## Contribution

Les contributions sont les bienvenues ! Voici quelques étapes pour contribuer :

1. **Fork** ce dépôt.
2. Créez une branche pour votre fonctionnalité ou correction de bug :
   ```bash
   git checkout -b feature/ma-nouvelle-fonctionnalite
   ```
3. Commitez vos modifications avec des messages clairs.
4. Poussez la branche et ouvrez une Pull Request.

Pour toute question ou demande d’amélioration, n’hésitez pas à ouvrir une issue sur le dépôt GitHub.

---

## Licence

Ce projet est sous licence [MIT](./LICENSE).
