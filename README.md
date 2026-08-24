# Auth

Starter backend d'API construit avec Node.js et PostgreSQL, centré sur l'authentification, l'autorisation et les composants techniques communs.

L'objectif du dépôt est de servir de base de démarrage pour de futures API. Il rassemble les fondations réutilisables afin d'éviter de reconstruire, pour chaque projet, la gestion des utilisateurs, les jetons JWT, les rôles, la configuration, les réponses HTTP et la journalisation.

## Objectif du starter

`Auth` n'est pas une API métier finale. Le dépôt est destiné à être cloné ou repris au début d'un nouveau projet, puis adapté à son domaine fonctionnel.

Il doit permettre de :

- démarrer les nouvelles API sur une architecture commune ;
- réutiliser une base d'authentification et d'autorisation ;
- appliquer les mêmes conventions de configuration et de réponse ;
- réduire le temps consacré au code technique répétitif ;
- disposer d'une base de sécurité cohérente entre les projets.

> [!IMPORTANT]
> Le starter est encore en construction. Le dépôt contient déjà ses principaux composants, mais il n'est pas exécutable immédiatement : le serveur HTTP, le routeur complet, les scripts de démarrage et les tests doivent encore être ajoutés. L'objectif est d'en faire une base prête à cloner, pas une API autonome avec un métier prédéfini.

## Fondations disponibles

| Composant | État | Rôle dans les futures API |
| --- | :---: | --- |
| Schéma PostgreSQL | Présent | Fournir les tables utilisateurs et jetons de rafraîchissement |
| Validation Zod | Présente | Valider les données d'inscription et de connexion |
| Hachage bcrypt | Présent | Protéger les mots de passe avant leur stockage |
| Jetons JWT | Présents | Générer les jetons d'accès et de rafraîchissement |
| Middleware d'authentification | Présent | Vérifier le Bearer token d'une requête |
| Middleware RBAC | Présent | Restreindre une action selon le rôle de l'utilisateur |
| Gestion des refresh tokens | À stabiliser | Créer, révoquer et renouveler les sessions |
| Réponses HTTP communes | À stabiliser | Uniformiser les réponses de toutes les routes |
| Journalisation | À stabiliser | Adapter les logs aux environnements de développement et de production |
| Serveur et routes HTTP | À ajouter | Exposer les composants sous forme d'API |
| Tests automatisés | À ajouter | Sécuriser les évolutions du starter et des projets dérivés |

## Stack technique

- Node.js et npm
- JavaScript
- PostgreSQL avec `pg`
- JSON Web Tokens avec `jsonwebtoken`
- Hachage des mots de passe avec `bcrypt`
- Validation des données avec `zod`
- Chargement de la configuration avec `dotenv`

## Architecture actuelle

```text
Auth/
├── backend/
│   ├── db/
│   │   └── schema.bd.sql
│   ├── middleware/
│   │   ├── auth.middleware.js
│   │   └── rbac.middleware.js
│   ├── model/
│   │   ├── refreshToken.model.js
│   │   └── user.model.js
│   ├── routes/
│   │   └── auth.routes.js
│   └── service/
│       └── auth.service.js
├── config/
│   ├── env.js
│   └── env.schema.js
├── utils/
│   ├── apiResponse.js
│   └── logger.js
├── .env.example
├── package.json
└── package-lock.json
```

## Composants réutilisables

### Service d'authentification

Le fichier `backend/service/auth.service.js` expose les opérations destinées à être appelées par les contrôleurs de chaque future API :

| Fonction | Responsabilité prévue |
| --- | --- |
| `register(user)` | Valider les données, hacher le mot de passe et créer l'utilisateur |
| `login(user)` | Vérifier les identifiants et générer les jetons de session |
| `logout(refreshToken)` | Révoquer un jeton de rafraîchissement |
| `refresh(refreshToken)` | Vérifier, révoquer puis remplacer un jeton de rafraîchissement |

### Middlewares

- `auth.middleware.js` extrait le jeton de l'en-tête `Authorization`, le vérifie puis ajoute sa charge utile à `req.user`.
- `rbac.middleware.js` autorise la requête lorsque le rôle présent dans `req.user` fait partie des rôles acceptés.

Exemple d'intégration visée dans une future API :

```js
router.get(
  '/admin',
  auth,
  rbac('super_admin', 'admin'),
  controller
);
```

### Réponses HTTP

L'utilitaire `utils/apiResponse.js` prévoit un format identique pour toutes les réponses :

```json
{
  "success": true,
  "status": 200,
  "desc": "Operation successful",
  "body": {},
  "errors": null
}
```

## Modèle de données fourni

Le fichier `backend/db/schema.bd.sql` fournit un schéma initial que chaque projet peut conserver ou adapter.

### `users`

- identifiant UUID ;
- nom et adresse e-mail unique ;
- mot de passe haché ;
- rôle parmi `super_admin`, `admin`, `editor` et `viewer` ;
- statut parmi `active`, `inactive`, `banned` et `pending` ;
- dates de création et de modification.

Un trigger met automatiquement à jour `updated_at` lors de la modification d'un utilisateur.

### `refresh_token`

- identifiant UUID ;
- référence vers l'utilisateur ;
- jeton unique ;
- statut `active` ou `revoked` ;
- dates de création et d'expiration.

La suppression d'un utilisateur entraîne celle de ses jetons de rafraîchissement.

Les rôles, les statuts et les informations utilisateur doivent être adaptés aux besoins de chaque nouvelle API.

## Utiliser le starter

### Prérequis

- Node.js et npm ;
- PostgreSQL ;
- une base de données dédiée au nouveau projet.

### Récupérer la base

```bash
git clone https://github.com/TyrYoxan/Auth.git mon-api
cd mon-api
npm install
```

Après le clonage :

1. modifier le nom, la description et les métadonnées de `package.json` ;
2. adapter les rôles et le schéma SQL au nouveau domaine ;
3. définir les variables d'environnement ;
4. ajouter les routes, contrôleurs, modèles et services métier ;
5. ajouter les tests propres à l'API ;
6. configurer son déploiement et son intégration continue.

> [!NOTE]
> Aucun script de démarrage n'est encore disponible. La commande `npm start` ne fonctionnera qu'après l'ajout du serveur et du script correspondant.

### Initialiser PostgreSQL

Après avoir créé la base de données :

```bash
psql --dbname="postgresql://USER:PASSWORD@HOST:5432/DATABASE" \
  --file=backend/db/schema.bd.sql
```

## Configuration actuelle

Le schéma présent dans `config/env.schema.js` attend actuellement les variables suivantes :

| Variable | Obligatoire | Valeur par défaut | Rôle |
| --- | :---: | --- | --- |
| `PORT` | Non | `3001` | Port prévu du serveur HTTP |
| `NODE_ENV` | Non | `development` | Environnement : `development`, `production` ou `test` |
| `JWT_SECRET` | Oui | — | Secret utilisé pour signer les JWT |
| `JWT_EXPIRES` | Non | `7d` | Durée de validité du jeton de rafraîchissement |
| `DATABASE_TYPE` | Oui | — | Élément actuellement utilisé pour construire la connexion PostgreSQL |
| `DATABASE_USER` | Oui | — | Élément actuellement utilisé pour construire la connexion PostgreSQL |
| `DATABASE_PASS` | Oui | — | Élément actuellement utilisé pour construire la connexion PostgreSQL |
| `DATABASE_NAME` | Oui | — | Nom de la base de données |
| `DATA_PORT` | Oui | `5432` | Port PostgreSQL |
| `SSL` | Non | — | Configuration SSL prévue |
| `MAIL_HOST` | Non | — | Hôte d'un éventuel service d'e-mail |
| `MAIL_PORT` | Non | — | Port d'un éventuel service d'e-mail |

> [!WARNING]
> Le fichier `.env.example`, le schéma de validation et la construction de la chaîne de connexion ne sont pas encore alignés. Cette partie doit être corrigée avant que le dépôt puisse servir de starter exécutable.

## Éléments à personnaliser pour chaque API

Le starter fournit uniquement la couche technique commune. Chaque projet dérivé reste responsable de :

- ses entités et règles métier ;
- ses routes et contrôleurs ;
- ses rôles et permissions ;
- sa stratégie de validation ;
- ses migrations et données initiales ;
- sa documentation OpenAPI ;
- ses tests métier et d'intégration ;
- sa stratégie de déploiement et de supervision.

## Sécurité

Les fondations déjà présentes comprennent :

- un coût bcrypt de `12` pour le hachage des mots de passe ;
- des requêtes SQL paramétrées ;
- des jetons JWT signés avec l'algorithme `HS256` ;
- des jetons d'accès valables 15 minutes ;
- un mécanisme de révocation des jetons de rafraîchissement ;
- des contraintes SQL sur les rôles et les statuts.

Avant toute utilisation en production, chaque API devra également :

- utiliser un secret JWT long, aléatoire et stocké hors du dépôt ;
- enregistrer uniquement l'empreinte des jetons de rafraîchissement ;
- vérifier leur statut et leur date d'expiration en base ;
- limiter le nombre de requêtes sur les routes sensibles ;
- utiliser HTTPS et des cookies `HttpOnly`, `Secure` et `SameSite` si nécessaire ;
- journaliser les événements de sécurité sans exposer de données sensibles.

## Limites actuelles du starter

Les points suivants empêchent encore une utilisation immédiate :

1. aucun fichier d'entrée ni serveur HTTP n'est présent ;
2. aucun script `start` ou `dev` n'est défini dans `package.json` ;
3. aucun framework HTTP, tel qu'Express, n'est installé ;
4. `utils/apiResponse.js` utilise une syntaxe ES module alors que le projet est configuré en CommonJS ;
5. la configuration de la base est incohérente avec `.env.example` ;
6. le modèle utilisateur ne renvoie pas les données attendues par le service de connexion ;
7. la route de connexion n'est ni finalisée ni exportée ;
8. le script `npm test` est encore celui généré par défaut par npm.

## Feuille de route

### Priorité 1 — Rendre le starter exécutable

- [ ] Uniformiser le projet en CommonJS ou en ES modules.
- [ ] Remplacer la configuration actuelle par une variable `DATABASE_URL` cohérente.
- [ ] Ajouter un serveur HTTP et les scripts `start` et `dev`.
- [ ] Finaliser les modèles et les routes d'authentification.
- [ ] Ajouter une route de contrôle telle que `GET /health`.

### Priorité 2 — Fiabiliser la base commune

- [ ] Ajouter une gestion centralisée des erreurs.
- [ ] Hacher les jetons de rafraîchissement avant leur stockage.
- [ ] Ajouter les tests unitaires et les tests d'intégration.
- [ ] Ajouter des migrations reproductibles pour PostgreSQL.

### Priorité 3 — Faciliter la réutilisation

- [ ] Ajouter une documentation OpenAPI minimale.
- [ ] Fournir Docker et Docker Compose pour l'environnement local.
- [ ] Ajouter une intégration continue avec lint, tests et vérification du build.
- [ ] Documenter une procédure de création d'une nouvelle API à partir du starter.

## Contribution

Les propositions d'amélioration sont les bienvenues.

Pour contribuer :

1. ouvrez une issue pour présenter la modification envisagée ;
2. créez une branche dédiée ;
3. ajoutez ou mettez à jour les tests concernés ;
4. soumettez une pull request avec une description claire.

Les contributions doivent rester génériques afin que le projet puisse servir de base à différentes API.

## Auteur

Développé et maintenu par [TyrYoxan](https://github.com/TyrYoxan).

## Licence

Ce projet est distribué sous licence ISC. Consultez le fichier [LICENSE](LICENSE) pour connaître les conditions d'utilisation, de modification et de distribution.
