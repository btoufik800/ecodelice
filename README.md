# ÉcoDélices — Frontend React (Vite)

Version React du site **ÉcoDélices** (confitures artisanales bio).
Ce projet est un **frontend** qui consomme l'API du backend Node/Express déjà existant
(`ecodelices_node1/`). Aucune réécriture de la base de données ni du serveur n'est requise.

---

## 🏗️ Architecture

```
ecodelices_react/        <- ce projet (React + Vite, port 5173)
   └── consomme /api/*
       ↓ via proxy Vite
ecodelices_node1/        <- backend existant (Express + MySQL, port 3000)
       └── /api/auth/*, /api/produits, /api/panier, /api/admin/*, …
```

- **Stack** : Vite 5 · React 18 · React Router 6 · axios.
- **Authentification** : session Express (`ecodelices.sid`) via cookies — `withCredentials: true`.
- **Styles** : le `style.css` original (1503 lignes) est conservé tel quel, plus `admin.css` pour les composants admin propres à React.

---

## 🚀 Démarrage rapide

### 1. Lancer le backend Node (terminal #1)
```bash
cd ecodelices_node1
npm install
# importer database/schema.sql dans MySQL
# copier .env.example en .env et adapter
npm start
# → http://localhost:3000
```

### 2. Lancer le frontend React (terminal #2)
```bash
cd ecodelices_react
npm install
npm run dev
# → http://localhost:5173
```

Le proxy Vite (`vite.config.js`) redirige automatiquement toutes les requêtes
`/api/*` vers `http://localhost:3000`, cookies inclus.

### 3. Compte de test
```
admin@ecodelices.ca   /   admin123
```

---

## 📁 Structure

```
ecodelices_react/
├── index.html
├── package.json
├── vite.config.js
├── public/
│   ├── style.css         (CSS original ÉcoDélices)
│   └── admin.css         (compléments pour l'admin)
└── src/
    ├── main.jsx          (entrée + providers)
    ├── App.jsx           (routeur + guards)
    ├── api/
    │   └── client.js     (axios pré-configuré, credentials)
    ├── context/
    │   ├── AuthContext.jsx   (login, register, logout, /api/me)
    │   ├── CartContext.jsx   (panier global)
    │   └── ToastContext.jsx  (notifications)
    ├── layouts/
    │   ├── ClientLayout.jsx  (navbar + footer + cart sidebar)
    │   └── AdminLayout.jsx   (sidebar admin)
    ├── components/
    │   └── CartSidebar.jsx   (panneau panier + modal checkout)
    └── pages/
        ├── LoginPage.jsx        (/)
        ├── client/
        │   ├── Accueil.jsx      (/accueil)
        │   ├── Produits.jsx     (/produits)
        │   ├── Profil.jsx       (/profil)
        │   ├── Contact.jsx      (/contact)
        │   ├── APropos.jsx      (/apropos)
        │   └── Blog.jsx         (/blog)
        └── admin/
            ├── Dashboard.jsx       (/admin/dashboard)
            ├── Utilisateurs.jsx    (/admin/utilisateurs)
            ├── Commandes.jsx       (/admin/commandes)
            ├── Produits.jsx        (/admin/produits)
            └── Messages.jsx        (/admin/messages)
```

---

## 🔌 Endpoints API utilisés

| Méthode | Endpoint                          | Page React                |
| ------- | --------------------------------- | ------------------------- |
| GET     | `/api/me`                         | AuthContext (init)        |
| POST    | `/api/auth/login`                 | LoginPage                 |
| POST    | `/api/auth/register`              | LoginPage                 |
| GET     | `/api/auth/logout`                | Tous les layouts          |
| GET     | `/api/accueil`                    | client/Accueil            |
| GET     | `/api/produits`                   | client/Produits           |
| GET     | `/api/articles`                   | client/Blog               |
| GET     | `/api/panier`                     | CartContext               |
| POST    | `/api/panier`                     | CartContext               |
| POST    | `/api/commande`                   | CartSidebar (checkout)    |
| GET/POST| `/api/client/profil`              | client/Profil             |
| POST    | `/api/client/contact`             | client/Contact            |
| GET     | `/api/admin/dashboard`            | admin/Dashboard           |
| GET     | `/api/admin/utilisateurs`         | admin/Utilisateurs        |
| POST    | `/api/admin/utilisateur`          | admin/Utilisateurs        |
| GET     | `/api/admin/commandes`            | admin/Commandes           |
| POST    | `/api/admin/commande/statut`      | admin/Commandes           |
| GET     | `/api/admin/commande/:id`         | admin/Commandes (détail)  |
| GET/POST| `/api/admin/produits`             | admin/Produits            |
| GET/POST| `/api/admin/messages`             | admin/Messages            |
| POST    | `/api/admin/message`              | admin/Messages            |

---

## 🛡️ Sécurité & sessions

L'authentification du backend est basée sur **express-session** (cookies HttpOnly).
Le frontend React :

1. envoie chaque requête avec `withCredentials: true` (cookies transmis),
2. interroge `/api/me` au démarrage pour restaurer la session,
3. expose un `AuthContext` qui rend `user`, `login()`, `logout()`, `register()`.

Les routes protégées utilisent deux composants gardiens :
- `<RequireAuth>` → utilisateur connecté requis.
- `<RequireAdmin>` → role `admin` requis.

---

## 🛠️ Build production

```bash
npm run build       # génère dist/
npm run preview     # serveur de prévisualisation
```

En production, il faut soit :
- servir `dist/` derrière un reverse-proxy qui route `/api/*` vers Express,
- soit faire servir `dist/` directement par Express
  (`app.use(express.static('../ecodelices_react/dist'))`).

---

## ✍️ Améliorations possibles

- Passer à JWT (`Authorization: Bearer …`) si l'on veut un découplage total
  (mobile / multi-domaines).
- Code-splitting par route (`React.lazy`).
- Tests Vitest + React Testing Library.
- Migration vers TypeScript.
- Storybook pour le design system.

---

© ÉcoDélices — frontend React, mai 2026.
