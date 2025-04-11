
# Discu-Table

Discu-Table est une application web complète conçue pour collecter des feedbacks sur les repas du RU (Restaurant Universitaire) et permettre aux administrateurs de gérer les menus, les utilisateurs et d’analyser les données de satisfaction. Ce projet, développé avec Next.js et TypeScript, intègre une interface utilisateur moderne, des API robustes et des outils de statistiques et de suivi, le tout en s’appuyant sur une base de données PostgreSQL.

---

## Table des matières

- [Fonctionnalités](#fonctionnalités)
- [Architecture du projet](#architecture-du-projet)
  - [Structure des dossiers](#structure-des-dossiers)
  - [Rôles des principales sections](#rôles-des-principales-sections)
- [Installation et configuration](#installation-et-configuration)
  - [Prérequis](#prérequis)
  - [Variables d’environnement](#variables-denvironnement)
- [Utilisation en développement](#utilisation-en-développement)
- [API et Endpoints](#api-et-endpoints)
- [Technologies utilisées](#technologies-utilisées)
- [Processus de déploiement](#processus-de-déploiement)
- [Contribution](#contribution)
- [Licence](#licence)
- [Remerciements](#remerciements)

---

## Fonctionnalités

- **Feedback Utilisateur**  
  - Permet aux utilisateurs de noter différents aspects du repas (plat principal, goût, accompagnement, portion, etc.).
  - Proposition d’une sélection combinée pour choisir le plat et l’accompagnement.
  - Possibilité de laisser un commentaire et de choisir une option “Autre” pour des réponses personnalisées.

- **Gestion des Menus**  
  - Consultation et mise à jour des menus (entrée, plat, dessert ou configuration simplifiée avec plat et accompagnement).
  - Ajout, modification et suppression des menus via des formulaires dédiés.
  - Récupération du menu du jour selon la date et le créneau horaire (midi ou soir).

- **Interface Administrateur**  
  - Authentification sécurisée (JWT et cookies HTTP-only).
  - Tableau de bord avec onglets pour la gestion des menus, des statistiques et des utilisateurs.
  - Gestion du cycle de vie des utilisateurs (création, modification, suppression) réservée aux superadmins.
  - Affichage de graphiques détaillés (linéaire, camembert et barres) basés sur les feedbacks collectés.

- **Suivi et Statistiques**  
  - Agrégation et visualisation des feedbacks : moyennes, répartition par note, évolution dans le temps.
  - Consultation des commentaires avec dates de soumission.
  - Mise à disposition d’un endpoint pour le suivi des visites et autres événements (tracking).

---

## Architecture du projet

L’architecture de Discu-Table est organisée de manière modulaire pour faciliter la maintenabilité et l’extension du système. Les responsabilités sont clairement séparées entre le front-end, les API backend et la configuration de la base de données.

### Structure des dossiers

```plaintext
Discu-Table/
├── Procfile
├── README.md
├── app/                     # Utilise le nouveau système App Router de Next.js
│   ├── admin/               # Pages et composants pour l'administration
│   │   ├── login/           # Page de connexion administrateur
│   │   ├── users/           # Gestion des utilisateurs (création, édition, liste)
│   │   └── admin.module.css # Styles spécifiques à l’administration
│   ├── feedback/            # Interface de collecte de feedback pour les repas
│   ├── history/             # Historique des feedbacks et menus
│   ├── thankyou/            # Page de remerciements après soumission
│   ├── layout.tsx           # Layout global (intègre notamment la police et le bouton admin)
│   ├── not-found.tsx        # Page 404 personnalisée
│   └── page.tsx             # Page d’accueil (présentation du repas du jour et informations)
├── components/              # Composants UI réutilisables (ex. StarRating, DropdownSelect)
├── constants/               # Constantes et paramètres (ex. couleurs)
├── eslint.config.mjs        # Configuration ESLint personnalisée
├── lib/                     # Connexion et accès à la base de données (PostgreSQL)
├── middleware.ts            # Middleware Next.js pour sécuriser les routes /admin
├── next-env.d.ts            # Configuration TypeScript de Next.js
├── next.config.ts           # Configuration globale de l’application Next.js
├── pages/                   # Routes API classiques
│   └── api/                 # Endpoints pour le feedback, menus, authentification, statistiques, etc.
├── public/                  # Fichiers statiques (polices, favicon, icônes)
├── store/                   # Gestion d’état avec Zustand (Feedback Store)
└── styles/                  # Feuilles de styles globales et spécifiques
```

### Rôles des principales sections

- **`app/`**  
  Regroupe toutes les pages côté client gérées par le nouveau système d’itinéraires (App Router). On y trouve :
  - La page d’accueil qui affiche le menu du jour et des informations sur le projet.
  - La page de feedback pour noter et commenter les repas.
  - L’interface d’administration regroupant la gestion des menus, des statistiques et des utilisateurs.
  - La gestion des erreurs et des pages non trouvées.

- **`components/`**  
  Contient des composants UI modulaires et réutilisables tels que :
  - **StarRating** pour les évaluations par étoiles.
  - **DropdownSelect, RadioOption, CheckboxGroup** pour les choix et formulaires.
  - **FormSection** pour structurer les formulaires de saisie.

- **`pages/api/`**  
  Définit les endpoints REST pour :
  - L’envoi et la récupération des feedbacks.
  - La gestion des menus (récupération, ajout, mise à jour).
  - L’authentification et la gestion de session (login, logout, vérification du token).
  - La gestion des utilisateurs (accessible uniquement aux superadmins).
  - La collecte de statistiques et le tracking d’événements.

- **`lib/`**  
  Fournit la configuration de la connexion à PostgreSQL via un pool de connexions, utilisé par l’ensemble des endpoints pour interagir avec la base de données.

- **`middleware.ts`**  
  Intercepte les requêtes vers les routes d’administration pour vérifier la présence et la validité d’un JWT, redirigeant vers la page de connexion en cas d’échec.

- **`store/`**  
  Implémente le store Zustand pour gérer et persister l’état du formulaire de feedback côté client.

- **`styles/`**  
  Centralise les styles globaux et spécifiques, notamment pour le responsive design et la gestion de thèmes clairs/sombres.

---

## Installation et configuration

### Prérequis

- [Node.js](https://nodejs.org) (version LTS recommandée)
- [npm](https://www.npmjs.com)
- [PostgreSQL](https://www.postgresql.org)

### Variables d’environnement

Créez un fichier `.env` à la racine du projet avec le contenu suivant (adapté à votre environnement) :

```env
DATABASE_URL=postgres://user:password@localhost:5432/nom_de_votre_base
JWT_SECRET=votre_clé_secrète_pour_JWT
NODE_ENV=development
```

### Clonage et installation

1. **Cloner le dépôt :**

   ```bash
   git clone https://github.com/ImSakushi/discu-table.git
   cd discu-table
   ```

2. **Installer les dépendances :**

   ```bash
   npm install
   ```

---

## Utilisation en développement

Pour lancer le serveur en mode développement, exécutez :

```bash
npm run dev
```

Ouvrez ensuite [http://localhost:3000](http://localhost:3000) dans votre navigateur pour voir l’application.  
Les modifications dans le dossier `app` ou dans les composants seront automatiquement rechargées grâce au hot-reload de Next.js.

---

## API et Endpoints

Les endpoints de l’API se trouvent sous le dossier `pages/api/` et couvrent plusieurs domaines fonctionnels :

- **Feedback**
  - `POST /api/feedback` : Insère un nouveau feedback dans la base de données.
  - `GET /api/feedback` : Récupère l’historique des feedbacks.

- **Menus**
  - `GET /api/menu?date=YYYY-MM-DD&mealPeriod=midi|soir` : Récupère le menu du jour correspondant aux paramètres.
  - `POST /api/admin/menu` : Ajoute un nouveau menu dans la base.
  - `PUT /api/admin/menu/update` : Met à jour un menu existant.
  - `GET /api/admin/menus` : Liste tous les menus classés par date.

- **Administration et Authentification**
  - `POST /api/admin/login` : Authentifie l’administrateur et émet un token JWT.
  - `POST /api/admin/logout` : Déconnecte l’administrateur en supprimant le token.
  - `GET /api/admin/me` : Retourne les informations de l’admin connecté.
  - `GET/POST/PUT/DELETE /api/admin/users` : Gestion complète des utilisateurs (accessible uniquement aux superadmins).

- **Statistiques et Tracking**
  - `GET /api/admin/statistics?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD` : Retourne des statistiques détaillées sur les feedbacks (totaux, moyennes, distributions, commentaires).
  - `POST /api/track` : Enregistre des événements de tracking pour analyser le trafic et les interactions utilisateur.

Chaque endpoint effectue des vérifications (notamment via le middleware ou directement dans le code) pour sécuriser l’accès et garantir l’intégrité des données.

---

## Technologies utilisées

- **Next.js** avec App Router pour une gestion dynamique des pages et des API.
- **TypeScript** pour une sécurité de typage renforcée.
- **React** pour la création de composants d’interface réactifs.
- **PostgreSQL** pour le stockage relationnel des menus, feedbacks, utilisateurs et tracking.
- **JWT & bcrypt** pour l’authentification sécurisée des administrateurs.
- **Zustand** pour la gestion d’état côté client (feedback store).
- **CSS Modules** pour un style scoped et modulaire.
- **Chart.js** (via react-chartjs-2) pour afficher des graphiques et statistiques sur les feedbacks.
- **ESLint** pour assurer un code de qualité et standardisé.

---

## Processus de déploiement

Le fichier **Procfile** (situé à la racine) contient la commande de démarrage :

```plaintext
web: npm run start
```

Ceci est particulièrement utile pour déployer l’application sur des plateformes PaaS telles que Heroku. Assurez-vous que toutes les variables d’environnement sont correctement définies en production, notamment le `DATABASE_URL` et le `JWT_SECRET`.

---

## Contribution

Les contributions sont les bienvenues ! Pour contribuer, suivez ces étapes :

1. **Forkez** ce dépôt sur GitHub.
2. Créez une branche pour votre fonctionnalité ou correction :

   ```bash
   git checkout -b feature/nom-de-la-fonctionnalité
   ```

3. Apportez vos modifications et assurez-vous que les tests passent.
4. Commitez vos changements avec des messages clairs et concis.
5. Poussez votre branche et ouvrez une Pull Request pour examen.

N’hésitez pas à soumettre des issues pour signaler des bugs ou proposer des améliorations.

---

## Licence

Ce projet est distribué sous la licence MIT. Consultez le fichier [LICENSE](./LICENSE) pour plus de détails.

---

## Remerciements

Un grand merci à toutes les personnes ayant contribué aux idées et au développement de Discu-Table. Que ce soit via le feedback, la correction de bugs ou les suggestions d’améliorations, vos contributions font de ce projet un outil toujours plus pertinent pour améliorer l’expérience du RU.

---

Discu-Table est conçu pour être évolutif et modulaire. Que vous souhaitiez ajouter de nouvelles fonctionnalités, modifier l’interface utilisateur ou améliorer les performances, l’architecture du projet a été pensée pour faciliter la prise en main et le développement collaboratif.

Bonne continuation et bon codage !
