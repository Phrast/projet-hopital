CREATE DATABASE IF NOT EXISTS hopital_db;
USE hopital_db;

CREATE TABLE IF NOT EXISTS patients (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nom VARCHAR(100) NOT NULL,
  prenom VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  telephone VARCHAR(20) NOT NULL,
  date_naissance DATE NOT NULL,
  mot_de_passe VARCHAR(255) NOT NULL,
  date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS medecins (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nom VARCHAR(100) NOT NULL,
  prenom VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  specialite VARCHAR(100) NOT NULL,
  mot_de_passe VARCHAR(255) NOT NULL,
  disponible BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS rendez_vous (
  id INT AUTO_INCREMENT PRIMARY KEY,
  patient_id INT NOT NULL,
  medecin_id INT NOT NULL,
  date_heure DATETIME NOT NULL,
  motif TEXT,
  statut ENUM('en attente', 'confirmé', 'annulé', 'terminé') DEFAULT 'en attente',
  notes TEXT,
  date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
  FOREIGN KEY (medecin_id) REFERENCES medecins(id) ON DELETE CASCADE
);

INSERT INTO medecins (nom, prenom, email, specialite, mot_de_passe) VALUES
('Dupont', 'Jean', 'jean.dupont@hopital.fr', 'Cardiologie', '$2a$10$uCBJXvZN8F15A.TN6LuaIe5ywUzGOGi5RVEDcLt9B4OBzH2gYBVbG'),
('Martin', 'Sophie', 'sophie.martin@hopital.fr', 'Pédiatrie', '$2a$10$uCBJXvZN8F15A.TN6LuaIe5ywUzGOGi5RVEDcLt9B4OBzH2gYBVbG'),
('Leroy', 'Philippe', 'philippe.leroy@hopital.fr', 'Dermatologie', '$2a$10$uCBJXvZN8F15A.TN6LuaIe5ywUzGOGi5RVEDcLt9B4OBzH2gYBVbG');