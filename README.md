# Système de Réservation Hospitalière

Un système de gestion de rendez-vous médical permettant aux patients de prendre rendez-vous en ligne et aux médecins de gérer leur planning.


## Fonctionnalités planifiées :

### Côté patient
- Inscription et connexion sécurisées
- Prise de rendez-vous avec choix du médecin, date et heure
- Consultation et gestion des rendez-vous existants
- Annulation de rendez-vous

### Côté médecin
- Connexion sécurisée
- Planning des rendez-vous
- Gestion des statuts des rendez-vous (confirmation, annulation, etc.)


## Technologies utilisées :

### Backend
- Node.js / Express
- MySQL (via XAMPP)
- JWT pour l'authentification
- Bcrypt pour le hashage des mots de passe

### Frontend
- React
- React Router
- CSS personnalisé


##  Structure de la base de données :

- `patients` : Stocke les informations des utilisateurs patients
- `medecins` : Stocke les informations des médecins
- `rendez_vous` : Gère les rendez-vous entre patients et médecins


## Routes disponibles :
- `GET /` : Page d'accueil de l'API
- `GET /api/test-db` : Teste la connexion à la base de données
- `GET /api/medecins` : Récupère la liste des médecins disponibles
- `POST /api/auth/patient/register` : Inscription d'un patient
- `POST /api/auth/login` : Connexion (patients et médecins)
- `GET /api/profile` : Récupère les informations du profil utilisateur connecté
- `GET /api/rendez-vous/patient/:id` : Récupère les rendez-vous d'un patient
- `GET /api/rendez-vous/medecin/:id` : Récupère les rendez-vous d'un médecin
- `POST /api/rendez-vous` : Crée un nouveau rendez-vous
- `PUT /api/rendez-vous/:id` : Met à jour le statut d'un rendez-vous
- `DELETE /api/rendez-vous/:id` : Annule un rendez-vous (soft delete)