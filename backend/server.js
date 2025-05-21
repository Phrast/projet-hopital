const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'hopital_db'
});

db.connect(err => {
  if (err) {
    console.error('Erreur de connexion à la base de données:', err);
    return;
  }
  console.log('Connecté à la base de données MySQL');
});

app.get('/', (req, res) => {
  res.json({ message: 'API du système de réservation hospitalière' });
});

app.get('/api/test-db', (req, res) => {
  db.query('SELECT 1 + 1 AS solution', (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    return res.json({ 
      message: 'Connexion à la base de données réussie',
      result: results[0].solution 
    });
  });
});

app.get('/api/medecins', (req, res) => {
  db.query(
    'SELECT id, nom, prenom, specialite FROM medecins WHERE disponible = TRUE',
    (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: 'Erreur serveur' });
      }
      res.json(results);
    }
  );
});

app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});