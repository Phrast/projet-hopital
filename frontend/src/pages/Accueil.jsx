import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Accueil.css';

const Accueil = () => {
  return (
    <div className="accueil">
      <div className="hero-section">
        <h1>Bienvenue à l'Hôpital Santé</h1>
        <p>Votre santé, notre priorité</p>
        <div className="hero-buttons">
          <Link to="/register-patient" className="btn btn-primary">Créer un compte</Link>
          <Link to="/login-patient" className="btn btn-secondary">Prendre rendez-vous</Link>
        </div>
      </div>

      <div className="features-section">
        <div className="feature">
          <div className="feature-icon">
            <i className="fas fa-calendar-check"></i>
          </div>
          <h3>Rendez-vous en ligne</h3>
          <p>Prenez rendez-vous avec nos médecins spécialistes en quelques clics.</p>
        </div>

        <div className="feature">
          <div className="feature-icon">
            <i className="fas fa-user-md"></i>
          </div>
          <h3>Équipe médicale qualifiée</h3>
          <p>Une équipe de médecins spécialistes à votre service.</p>
        </div>

        <div className="feature">
          <div className="feature-icon">
            <i className="fas fa-clock"></i>
          </div>
          <h3>Suivi des rendez-vous</h3>
          <p>Consultez et gérez vos rendez-vous depuis votre espace personnel.</p>
        </div>
      </div>

      <div className="services-section">
        <h2>Nos spécialités</h2>
        <div className="services-grid">
          <div className="service-card">
            <i className="fas fa-heartbeat"></i>
            <h4>Cardiologie</h4>
          </div>
          <div className="service-card">
            <i className="fas fa-baby"></i>
            <h4>Pédiatrie</h4>
          </div>
          <div className="service-card">
            <i className="fas fa-allergies"></i>
            <h4>Dermatologie</h4>
          </div>
          <div className="service-card">
            <i className="fas fa-bone"></i>
            <h4>Orthopédie</h4>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Accueil;