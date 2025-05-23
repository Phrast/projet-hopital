import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Navbar.css';

const Navbar = ({ user, onLogout }) => {
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-menu">
          {user ? (
            <>
              <div to="/" className="navbar-logo"> <i className="fas fa-hospital"></i> Hôpital Santé </div>
              <span className="welcome-text">Bienvenue, {user.prenom} {user.nom}</span>
              {user.role === 'patient' ? (
                <>
                  <Link to="/dashboard-patient" className="navbar-item">Mon espace</Link>
                  <Link to="/prendre-rendez-vous" className="navbar-item">Prendre RDV</Link>
                </>
              ) : (
                <Link to="/dashboard-medecin" className="navbar-item">Mon planning</Link>
              )}
              <button onClick={onLogout} className="logout-btn">Déconnexion</button>
            </>
          ) : (
            <>
              <Link to="/" className="navbar-logo"> <i className="fas fa-hospital"></i> Hôpital Santé </Link>
              <Link to="/login-patient" className="navbar-item">Espace patient</Link>
              <Link to="/login-medecin" className="navbar-item">Espace médecin</Link>
              <Link to="/register-patient" className="navbar-item register-btn">Inscription</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;