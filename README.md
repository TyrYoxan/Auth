# Auth

Socle backend d'authentification et d'autorisation construit avec Node.js et PostgreSQL.

Le projet regroupe les composants nécessaires à la création de comptes, au hachage des mots de passe, à la génération de jetons JWT, à la rotation des jetons de rafraîchissement et au contrôle des accès par rôles.

> [!IMPORTANT]
> Le dépôt est en cours de développement. Il contient les services, les modèles, les middlewares et le schéma SQL, mais pas encore de serveur HTTP fonctionnel, de routeur complet, de script de démarrage ou de tests automatisés. Il ne peut donc pas être utilisé tel quel comme API autonome.

## Fonctionnalités

| Fonctionnalité | État | Détails |
| --- | :---: | --- |
| Création d'un utilisateur | En cours | Validation Zod, hachage bcrypt et insertion PostgreSQL |
| Connexion | En cours | Vérification prévue des identifiants et génération d'une paire de jetons |
| Jeton d'accès | Implémenté | JWT signé en HS256 et valable 15 minutes |
| Jeton de rafraîchissement | En cours | Persistance, révocation et rotation prévues en base de données |
| Déconnexion | En cours | Révocation du jeton de rafraîchissement |
| Authentification des requêtes | Implémenté | Vérification d'un Bearer token via un middleware |
| Autorisation RBAC | Implémenté | Restriction des actions selon le rôle de l'utilisateur |
| Routes HTTP | À faire | La route de connexion actuelle est seulement une ébauche |
| Tests automatisés | À faire | Aucun test n'est encore configuré |

## Stack technique

- Node.js et npm
- JavaScript
- PostgreSQL avec `pg`
- JSON Web Tokens avec `jsonwebtoken`
- Hachage des mots de passe avec `bcrypt`
- Validation des données avec `zod`
- Chargement de la configuration avec `dotenv`

## Architecture

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

## Rôle des composants

### Service d'authentification

Le fichier `backend/service/auth.service.js` expose quatre opérations :

| Fonction | Rôle prévu |
| --- | --- |
| `register(user)` | Valider les données, hacher le mot de passe et créer l'utilisateur |
| `login(user)` | Vérifier les identifiants et générer les jetons d'accès et de rafraîchissement |
| `logout(refreshToken)` | Révoquer un jeton de rafraîchissement |
| `refresh(refreshToken)` | Vérifier, révoquer puis remplacer un jeton de rafraîchissement |

### Middlewares

- `auth.middleware.js` extrait le jeton de l'en-tête `Authorization`, le vérifie puis ajoute sa charge utile à `req.user`.
- `rbac.middleware.js` autorise la requête lorsque le rôle présent dans `req.user` fait partie des rôles acceptés.

Exemple d'utilisation visée après l'ajout d'un routeur HTTP :

```js
router.get(
  '/admin',
  auth,
  rbac('super_admin', 'admin'),
  controller
);
```

## Modèle de données

Le script `backend/db/schema.bd.sql` crée les tables suivantes.

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

## Installation

### Prérequis

- Node.js et npm ;
- PostgreSQL ;
- une base de données dédiée au projet.

### Récupérer le projet

```bash
git clone https://github.com/TyrYoxan/Auth.git
cd Auth
npm install
```

### Initialiser la base de données

Après avoir créé la base, exécuter le schéma SQL :

```bash
psql --dbname="postgresql://USER:PASSWORD@HOST:5432/DATABASE" \
  --file=backend/db/schema.bd.sql
```

## Configuration

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
| `MAIL_HOST` | Non | — | Hôte du futur service d'e-mail |
| `MAIL_PORT` | Non | — | Port du futur service d'e-mail |

> [!WARNING]
> Le fichier `.env.example`, le schéma de validation et la construction de la chaîne de connexion ne sont pas encore alignés. Cette partie doit être corrigée avant de pouvoir démarrer l'application.

## Format des réponses HTTP

L'utilitaire `utils/apiResponse.js` prévoit un format commun pour les réponses :

```json
{
  "success": true,
  "status": 200,
  "desc": "Operation successful",
  "body": {},
  "errors": null
}
```

## Sécurité

Les choix déjà présents dans le projet comprennent :

- un coût bcrypt de `12` pour le hachage des mots de passe ;
- des requêtes SQL paramétrées ;
- des jetons JWT signés avec l'algorithme `HS256` ;
- des jetons d'accès de courte durée ;
- une révocation des jetons de rafraîchissement ;
- des contraintes SQL sur les rôles et les statuts.

Avant une utilisation en production, il faudra également :

- utiliser un secret JWT long, aléatoire et stocké hors du dépôt ;
- ne jamais enregistrer les jetons de rafraîchissement en clair, mais seulement leur empreinte ;
- vérifier le statut et la date d'expiration des jetons en base ;
- mettre en place une limitation du nombre de requêtes ;
- utiliser HTTPS et des cookies `HttpOnly`, `Secure` et `SameSite` si les jetons sont transmis par cookie ;
- journaliser les événements de sécurité sans exposer de données sensibles.

## Limites actuelles

Les principaux points bloquant l'exécution du projet sont les suivants :

1. aucun fichier d'entrée ni serveur HTTP n'est présent ;
2. aucun script `start` ou `dev` n'est défini dans `package.json` ;
3. aucun framework HTTP, tel qu'Express, n'est installé ;
4. `utils/apiResponse.js` utilise une syntaxe d'export ES module alors que le projet est configuré en CommonJS ;
5. la configuration de la base de données est incohérente avec `.env.example` ;
6. le modèle utilisateur ne renvoie pas actuellement les données attendues par le service de connexion ;
7. la route de connexion n'est ni finalisée ni exportée ;
8. le script `npm test` est encore le script d'exemple généré par npm.

## Feuille de route recommandée

- [ ] Uniformiser tous les modules en CommonJS ou en ES modules.
- [ ] Corriger et simplifier la configuration avec une variable `DATABASE_URL` unique.
- [ ] Corriger les valeurs renvoyées par les modèles utilisateur et refresh token.
- [ ] Ajouter le serveur HTTP et le routeur d'authentification.
- [ ] Exposer les routes d'inscription, de connexion, de rafraîchissement et de déconnexion.
- [ ] Ajouter une gestion centralisée des erreurs.
- [ ] Hacher les jetons de rafraîchissement avant leur stockage.
- [ ] Ajouter des tests unitaires et des tests d'intégration.
- [ ] Documenter l'API avec OpenAPI.
- [ ] Ajouter Docker et une intégration continue.

## Tests

Aucune suite de tests n'est encore disponible. La première couverture devrait cibler en priorité :

- la validation des données d'inscription et de connexion ;
- le hachage et la comparaison des mots de passe ;
- la génération, la vérification, l'expiration et la rotation des JWT ;
- l'authentification par Bearer token ;
- les autorisations RBAC ;
- les accès PostgreSQL et les contraintes du schéma.

## Licence

Le fichier `package.json` déclare actuellement la licence ISC. Un fichier `LICENSE` doit encore être ajouté au dépôt pour formaliser sa distribution.
