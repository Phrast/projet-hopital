const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = 'votre_clé_secrète_jwt';

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

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) return res.status(401).json({ message: 'Accès refusé' });
  
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Token invalide' });
    req.user = user;
    next();
  });
};

app.get('/', (req, res) => {
  res.json({ message: 'API du système de réservation hospitalière' });
});

app.post('/api/auth/patient/register', async (req, res) => {
  try {
    const { nom, prenom, email, telephone, date_naissance, mot_de_passe } = req.body;
    
    db.query('SELECT * FROM patients WHERE email = ?', [email], async (err, results) => {
      if (err) throw err;
      if (results.length > 0) return res.status(400).json({ message: 'Cet email est déjà utilisé' });
      
      const hashedPassword = await bcrypt.hash(mot_de_passe, 10);
      
      db.query(
        'INSERT INTO patients (nom, prenom, email, telephone, date_naissance, mot_de_passe) VALUES (?, ?, ?, ?, ?, ?)',
        [nom, prenom, email, telephone, date_naissance, hashedPassword],
        (err, results) => {
          if (err) throw err;
          res.status(201).json({ message: 'Patient enregistré avec succès' });
        }
      );
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, mot_de_passe, role } = req.body;
    const table = role === 'medecin' ? 'medecins' : 'patients';
    
    db.query(`SELECT * FROM ${table} WHERE email = ?`, [email], async (err, results) => {
      if (err) throw err;
      if (results.length === 0) return res.status(400).json({ message: 'Email ou mot de passe incorrect' });
      
      const user = results[0];
      const validPassword = await bcrypt.compare(mot_de_passe, user.mot_de_passe);
      if (!validPassword) return res.status(400).json({ message: 'Email ou mot de passe incorrect' });
      
      const token = jwt.sign({ id: user.id, role }, JWT_SECRET, { expiresIn: '1h' });
      res.json({ token, user: { id: user.id, nom: user.nom, prenom: user.prenom, email: user.email, role } });
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/profile', authenticateToken, (req, res) => {
  const { id, role } = req.user;
  const table = role === 'medecin' ? 'medecins' : 'patients';
  
  db.query(`SELECT id, nom, prenom, email FROM ${table} WHERE id = ?`, [id], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Erreur serveur' });
    }
    
    if (results.length === 0) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }
    
    res.json({ ...results[0], role });
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


app.get('/api/rendez-vous/patient/:id', authenticateToken, (req, res) => {
  const patientId = req.params.id;
  
  if (req.user.role === 'patient' && req.user.id != patientId) {
    return res.status(403).json({ message: 'Accès non autorisé' });
  }
  
  db.query(
    `SELECT r.*, m.nom as medecin_nom, m.prenom as medecin_prenom, m.specialite 
     FROM rendez_vous r 
     JOIN medecins m ON r.medecin_id = m.id 
     WHERE r.patient_id = ? 
     ORDER BY r.date_heure`,
    [patientId],
    (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: 'Erreur serveur' });
      }
      res.json(results);
    }
  );
});

app.get('/api/rendez-vous/medecin/:id', authenticateToken, (req, res) => {
  const medecinId = req.params.id;
  
  if (req.user.role === 'medecin' && req.user.id != medecinId) {
    return res.status(403).json({ message: 'Accès non autorisé' });
  }
  
  db.query(
    `SELECT r.*, p.nom as patient_nom, p.prenom as patient_prenom, p.telephone as patient_telephone 
     FROM rendez_vous r 
     JOIN patients p ON r.patient_id = p.id 
     WHERE r.medecin_id = ? 
     ORDER BY r.date_heure`,
    [medecinId],
    (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: 'Erreur serveur' });
      }
      res.json(results);
    }
  );
});

app.post('/api/rendez-vous', authenticateToken, (req, res) => {
  const { patient_id, medecin_id, date_heure, motif } = req.body;
  
  if (req.user.role === 'patient' && req.user.id != patient_id) {
    return res.status(403).json({ message: 'Accès non autorisé' });
  }
  
  if (!patient_id || !medecin_id || !date_heure || !motif) {
    return res.status(400).json({ message: 'Tous les champs sont requis' });
  }
  
  db.query(
    'SELECT * FROM rendez_vous WHERE medecin_id = ? AND date_heure = ? AND statut != "annulé"',
    [medecin_id, date_heure],
    (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: 'Erreur serveur' });
      }
      
      if (results.length > 0) {
        return res.status(400).json({ message: 'Ce créneau horaire est déjà réservé' });
      }
      
      db.query(
        'INSERT INTO rendez_vous (patient_id, medecin_id, date_heure, motif) VALUES (?, ?, ?, ?)',
        [patient_id, medecin_id, date_heure, motif],
        (err, results) => {
          if (err) {
            console.error(err);
            return res.status(500).json({ message: 'Erreur serveur' });
          }
          res.status(201).json({ id: results.insertId, message: 'Rendez-vous créé avec succès' });
        }
      );
    }
  );
});

app.put('/api/rendez-vous/:id', authenticateToken, (req, res) => {
  const id = req.params.id;
  const { statut, notes } = req.body;
  
  const statutsValides = ['en attente', 'confirmé', 'annulé', 'terminé'];
  if (!statutsValides.includes(statut)) {
    return res.status(400).json({ message: 'Statut invalide' });
  }
  
  db.query(
    'SELECT * FROM rendez_vous WHERE id = ?',
    [id],
    (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: 'Erreur serveur' });
      }
      
      if (results.length === 0) {
        return res.status(404).json({ message: 'Rendez-vous non trouvé' });
      }
      
      const rdv = results[0];
      
      if (req.user.role === 'patient' && req.user.id != rdv.patient_id) {
        return res.status(403).json({ message: 'Accès non autorisé' });
      }
      
      if (req.user.role === 'patient' && statut !== 'annulé') {
        return res.status(403).json({ message: 'Les patients ne peuvent que annuler les rendez-vous' });
      }
      
      db.query(
        'UPDATE rendez_vous SET statut = ?, notes = ? WHERE id = ?',
        [statut, notes || null, id],
        (err, results) => {
          if (err) {
            console.error(err);
            return res.status(500).json({ message: 'Erreur serveur' });
          }
          res.json({ message: 'Rendez-vous mis à jour avec succès' });
        }
      );
    }
  );
});

app.delete('/api/rendez-vous/:id', authenticateToken, (req, res) => {
  const id = req.params.id;
  
  db.query(
    'SELECT * FROM rendez_vous WHERE id = ?',
    [id],
    (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: 'Erreur serveur' });
      }
      
      if (results.length === 0) {
        return res.status(404).json({ message: 'Rendez-vous non trouvé' });
      }
      
      const rdv = results[0];
      
      if (req.user.role === 'patient' && req.user.id != rdv.patient_id) {
        return res.status(403).json({ message: 'Accès non autorisé' });
      }
      
      db.query(
        'UPDATE rendez_vous SET statut = ? WHERE id = ?',
        ['annulé', id],
        (err, results) => {
          if (err) {
            console.error(err);
            return res.status(500).json({ message: 'Erreur serveur' });
          }
          res.json({ message: 'Rendez-vous annulé avec succès' });
        }
      );
    }
  );
});

app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});