# OpenGeo

Faire apparaitre sur une carte géographique des données logistiques sélectionnées. Les croiser et/ou les extraire pour aider à la décision, communiquer des données ou informations fiables et actualisées au plus près de l'événement.

| Informations                                                                                                                                               |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Environnement:** ACE                                                                                                                                     |
| **Niveau de sensibilité:** Important                                                                                                                       |
| **Equipe développeur:** @lucile-trp, "@floriaaan"                                                                                                                    |
| **Equipe projet:** D55540                                                                                                                                  |
| **Language, technologies:** NodeJS, NextJS, Typescript, MongoDB                                                                                            |

## Installation

### Prérequis

- NodeJS (v18.12.0 or higher) (dev. avec v18.12.0)
- MongoDB (v4.4.9 or higher) (dev. avec v4.4.9) / ou via Docker

Vous pouvez utiliser ces outils pour installer les prérequis :

- Vous pouvez utiliser nvm pour gérer votre version de NodeJS en utilisant :
  - `nvm use`.
- Vous pouvez utiliser Docker pour lancer votre base de données en utilisant :
  - `docker compose up`

### 1. Cloner le dépôt et installer les dépendances

#### 1.1 Utiliser docker & mongoDB

1. Cloner le dépôt `opengeo` sur votre machine locale.
2. Exécuter `npm install` pour installer les dépendances nécessaires.
3. Exécuter `docker compose up` pour démarrer la base de données.
4. Créer un fichier `.env` à la racine du répertoire du projet et ajouter les valeurs des variables d'environnement (voir `.env.example`).
5. Exécuter `npm run build` pour build l'application.
6. Exécuter `npm run start` pour démarrer l'application.

Vous pouvez maintenant accéder à l'application à l'adresse `http://localhost:3000`.

NB: Si vous souhaitez exécuter l'application en mode développement, vous pouvez exécuter `npm run dev` à la place.

#### 1.2 Utiliser MongoAtlas (Cloud)

Cette possibilité ne necessite pas l'installation globale de Docker et MongoDB. 

1. Cloner le dépôt `opengeo` sur votre machine locale.
2. Exécuter `npm install` pour installer les dépendances nécessaires.
3. Créer un fichier `.env` à la racine du répertoire du projet et ajouter les valeurs des variables d'environnement (voir `.env.example`).
4. Changer la valeur `MONGODB_URI` du fichier `.env` par la chaîne de connexion mongoAtlas.
5. Exécuter `npm run build` pour build l'application.
6. Exécuter `npm run start` pour démarrer l'application

## Configuration des serveurs

### VM de base de données

En partant d'une VM vierge, veuillez suivre les indications suivantes :

1. `sudo su -`
2. `dnf update & dnf upgrade`
3. `dnf install mongodb-org`

Par defaut, mongoDB est configuré pour être accessible uniquement sur localhost.

4. `nano /etc/mongod.conf` et changer la ligne `BindIp : 127.0.0.0` par `BindIp: 0.0.0.0` pour accepter toutes les entrées.
5. `systemctl start mongod`
6. `systemctl status mongod`

### VM applicative

En partant d'une VM vierge, veuillez suive les indications suivantes :

#### RECETTE

1. `sudo su -`
2. `dnf update & dnf upgrade`

Installer les dépendances générales suivantes : 
- Git
- Node.js v18
- pm2

3. `cd /data`
4. Créer un dossier `www` dans lequel cloner le projet et un dossier `ssl` pour les clés.
5. Cloner le dépôt `opengeo` dans le dossier `/www`.
6. Dans le dossier ssl, veuillez créer une clé ainsi que son certificat : `openssl req -x509 -newkey rsa:4096 -keyout dev-opengeo-key.pem -out dev-opengeo-cert.pem -sha256 -days 3650`.
7. Exécuter `npm install` pour installer les dépendances nécessaires.
8. Créer un fichier `.env` à la racine du répertoire du projet et ajouter les valeurs des variables d'environnement (voir `.env.example`).
9. Exécuter `npm run build` pour build l'application.
10. Exécuter `pm2 start server.js --name "opengeo"` pour démarrer l'application.

