-- ============================================================
-- ÉcoDélices — Schéma de base de données MySQL / MariaDB
-- À importer une seule fois (via phpMyAdmin, MySQL Workbench
-- ou la commande : mysql -u root -p < database/schema.sql)
-- ============================================================

DROP DATABASE IF EXISTS ecodelices_db;
CREATE DATABASE ecodelices_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE ecodelices_db;

-- ----------- Utilisateurs (clients + admins) -----------------
CREATE TABLE utilisateurs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    mot_de_passe VARCHAR(255) NOT NULL,
    prenom VARCHAR(100) NOT NULL,
    nom VARCHAR(100) NOT NULL,
    telephone VARCHAR(20),
    adresse TEXT,
    ville VARCHAR(100),
    code_postal VARCHAR(10),
    province VARCHAR(50) DEFAULT 'QC',
    role ENUM('client','admin') DEFAULT 'client',
    date_creation DATETIME DEFAULT CURRENT_TIMESTAMP,
    actif TINYINT(1) DEFAULT 1
);

-- ----------- Catégories (saisons) ----------------------------
CREATE TABLE categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    saison VARCHAR(20)
);

-- ----------- Produits ----------------------------------------
CREATE TABLE produits (
    id INT AUTO_INCREMENT PRIMARY KEY,
    categorie_id INT,
    nom VARCHAR(200) NOT NULL,
    description TEXT,
    ingredients TEXT,
    prix DECIMAL(10,2) NOT NULL,
    format VARCHAR(50) DEFAULT 'Pot de 250ml',
    stock INT DEFAULT 0,
    badge VARCHAR(50),
    actif TINYINT(1) DEFAULT 1,
    date_creation DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (categorie_id) REFERENCES categories(id)
);

-- ----------- Commandes ---------------------------------------
CREATE TABLE commandes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    utilisateur_id INT NOT NULL,
    numero_commande VARCHAR(50) UNIQUE NOT NULL,
    statut ENUM('en_attente','confirmee','en_preparation','expedie','livree','annulee') DEFAULT 'en_attente',
    prenom_livraison VARCHAR(100) NOT NULL,
    nom_livraison VARCHAR(100) NOT NULL,
    email_livraison VARCHAR(255) NOT NULL,
    telephone_livraison VARCHAR(20) NOT NULL,
    adresse_livraison TEXT NOT NULL,
    ville_livraison VARCHAR(100) NOT NULL,
    code_postal_livraison VARCHAR(10) NOT NULL,
    province_livraison VARCHAR(50) NOT NULL,
    nom_carte VARCHAR(200) NOT NULL,
    quatre_derniers_chiffres VARCHAR(4) NOT NULL,
    sous_total DECIMAL(10,2) NOT NULL,
    taxes DECIMAL(10,2) NOT NULL,
    total DECIMAL(10,2) NOT NULL,
    date_commande DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (utilisateur_id) REFERENCES utilisateurs(id)
);

-- ----------- Lignes de commande ------------------------------
CREATE TABLE lignes_commande (
    id INT AUTO_INCREMENT PRIMARY KEY,
    commande_id INT NOT NULL,
    produit_id INT NOT NULL,
    nom_produit VARCHAR(200) NOT NULL,
    prix_unitaire DECIMAL(10,2) NOT NULL,
    quantite INT NOT NULL,
    sous_total DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (commande_id) REFERENCES commandes(id),
    FOREIGN KEY (produit_id) REFERENCES produits(id)
);

-- ----------- Panier (session utilisateur) --------------------
CREATE TABLE panier (
    id INT AUTO_INCREMENT PRIMARY KEY,
    utilisateur_id INT NOT NULL,
    produit_id INT NOT NULL,
    quantite INT NOT NULL DEFAULT 1,
    date_ajout DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_user_prod (utilisateur_id, produit_id),
    FOREIGN KEY (utilisateur_id) REFERENCES utilisateurs(id) ON DELETE CASCADE,
    FOREIGN KEY (produit_id) REFERENCES produits(id) ON DELETE CASCADE
);

-- ----------- Articles de blog --------------------------------
CREATE TABLE articles_blog (
    id INT AUTO_INCREMENT PRIMARY KEY,
    auteur_id INT,
    titre VARCHAR(255) NOT NULL,
    extrait TEXT,
    contenu LONGTEXT NOT NULL,
    categorie ENUM('recettes','actualites','conseils') NOT NULL,
    actif TINYINT(1) DEFAULT 1,
    date_publication DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (auteur_id) REFERENCES utilisateurs(id)
);

-- ----------- Messages de contact -----------------------------
CREATE TABLE messages_contact (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    telephone VARCHAR(20),
    message TEXT NOT NULL,
    lu TINYINT(1) DEFAULT 0,
    date_envoi DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- DONNÉES PAR DÉFAUT
-- ============================================================

-- Compte administrateur : admin@ecodelices.ca / admin123
-- Hash bcrypt généré avec bcryptjs (compatible Node.js).
INSERT INTO utilisateurs (email, mot_de_passe, prenom, nom, role) VALUES
('admin@ecodelices.ca', '$2b$10$PYFxWOkWV6EY3tPjtXGgAeoLUY5VHz5H5vsl.ysKIXilFcaHJ6Ltm', 'Admin', 'Principal', 'admin');

INSERT INTO categories (nom, slug, saison) VALUES
('Printemps', 'printemps', 'printemps'),
('Été', 'ete', 'ete'),
('Automne', 'automne', 'automne'),
('Hiver', 'hiver', 'hiver');

INSERT INTO produits (categorie_id, nom, description, ingredients, prix, stock, badge) VALUES
(1, 'Confiture de Fraises', 'Fraises biologiques de juin, cueillies à maturité. Saveur intense et naturellement sucrée.', 'Fraises bio (65%), sucre de canne bio, jus de citron bio', 15.99, 50, 'Populaire'),
(2, 'Confiture de Bleuets', 'Bleuets sauvages récoltés localement, riches en antioxydants.', 'Bleuets sauvages bio (70%), sucre de canne bio, jus de citron bio', 16.99, 40, NULL),
(2, 'Confiture d''Abricots', 'Abricots juteux du verger local, une douceur ensoleillée.', 'Abricots bio (68%), sucre de canne bio, jus de citron bio', 15.99, 30, 'Nouveau'),
(2, 'Confiture de Framboises', 'Framboises délicates au goût raffiné et légèrement acidulé.', 'Framboises bio (65%), sucre de canne bio, jus de citron bio', 17.99, 35, NULL),
(3, 'Confiture de Poires', 'Poires fondantes avec une touche de vanille bourbon.', 'Poires bio (70%), sucre de canne bio, vanille bourbon bio', 16.99, 25, NULL),
(3, 'Confiture de Citrouille', 'Citrouille épicée aux saveurs automnales réconfortantes.', 'Citrouille bio (65%), sucre de canne bio, épices bio', 15.99, 20, 'Saisonnier');

INSERT INTO articles_blog (auteur_id, titre, extrait, contenu, categorie) VALUES
(1, '5 façons créatives d''utiliser nos confitures', 'Découvrez comment sublimer vos desserts avec nos confitures artisanales...',
 '<p>Nos confitures ne sont pas seulement délicieuses sur une tartine !</p><h3>1. Dans vos pâtisseries</h3><p>Utilisez notre confiture de fraises comme garniture pour vos gâteaux roulés ou macarons.</p><h3>2. Pour napper vos crêpes</h3><p>Réchauffez légèrement la confiture de bleuets et nappez-en vos crêpes du dimanche.</p><h3>3. Dans vos yaourts</h3><p>Une cuillère de confiture dans un yaourt nature transforme un simple en-cas en quelque chose de spécial.</p>',
 'recettes'),
(1, 'Nos nouveaux partenaires producteurs', 'Rencontrez les agriculteurs passionnés qui cultivent les fruits de nos confitures...',
 '<h3>Ferme des Vergers Dorés</h3><p>Située à 30 km de notre atelier, cette ferme cultive depuis 3 générations les plus belles fraises de la région.</p><h3>Les Jardins de Sophie</h3><p>Sophie est une jeune agricultrice passionnée spécialisée dans les petits fruits rouges. Ses bleuets sauvages sont exceptionnels.</p>',
 'actualites'),
(1, 'Comment bien conserver vos confitures', 'Nos astuces pour préserver la fraîcheur et les saveurs de vos confitures...',
 '<h3>Avant ouverture</h3><p>Stockez vos pots dans un endroit frais et sec, à l''abri de la lumière directe. La température idéale se situe entre 10°C et 20°C.</p><h3>Après ouverture</h3><p>Conservez impérativement au réfrigérateur et utilisez toujours une cuillère propre. Consommez dans les 3 semaines.</p>',
 'conseils');
