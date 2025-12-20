# Projet E-Commerce TWINCOM

**Étudiant :** Benaddou Ahmed
**Projet :** Plateforme E-Commerce Node JS

---

## 1. Vue d'ensemble du projet
TWINCOM est une application e-commerce complète construite avec la stack MERN (MySQL, Express, React, Node.js). Elle intègre l'authentification des utilisateurs, la navigation par produits, un panier d'achat, le traitement des commandes et un tableau de bord administrateur détaillé.

- **Frontend :** React.js, Tailwind CSS, Vite
- **Backend :** Node.js, Express.js, Sequelize (MySQL)
- **Base de données :** MySQL

---

## 2. Installation et Configuration

### Prérequis
- Node.js (v16+)
- Serveur MySQL local

### Guide étape par étape
1. **Base de Données** :
   - Assurez-vous que votre serveur MySQL est en cours d'exécution.
   - **Important :** Importez le fichier SQL fourni (que j'ai joint au projet) dans cette base de données. Cela restaurera tous les produits, utilisateurs et commandes exemples.

2. **Backend (Serveur)** :
   ```bash
   cd backend
   npm install
   npm start
   ```
   *Le serveur démarrera sur http://localhost:5000*

3. **Frontend (Client)** :
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   *L'application client sera accessible sur http://localhost:3000*

---

## 3. Identifiants de Connexion

Voici les comptes préconfigurés pour tester l'application :

### Administrateur "Root" (Super-Admin)
Accès complet au système.
- **Email :** `root@twincom.com`
- **Mot de passe :** `twincom`

### Autres Administrateurs
Pour la gestion des produits et des commandes.
- **Email :** `yasser@twincom.com`
- **Mot de passe :** `123456789`
- **Email :** `fatima@twincom.com`
- **Mot de passe :** `123456789`

### Utilisateurs Standards
Vous pouvez utiliser ces comptes pour tester l'expérience client.
- **Mot de passe pour TOUS les utilisateurs :** `123456789`
- **Exemples :** `ahmed0@example.com`, `ahmed1@example.com`, etc.
