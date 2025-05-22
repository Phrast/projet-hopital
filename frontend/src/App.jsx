import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import './styles/App.css';

import Navbar from './components/Navbar';
import Accueil from './pages/Accueil';
import LoginPatient from './pages/LoginPatient';
import LoginMedecin from './pages/LoginMedecin';
import RegisterPatient from './pages/RegisterPatient';
import DashboardPatient from './pages/DashboardPatient';
import DashboardMedecin from './pages/DashboardMedecin';
import PriseRendezVous from './pages/PriseRendezVous';

function App() {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')) || null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);

  const login = (userData, userToken) => {
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', userToken);
    setUser(userData);
    setToken(userToken);
  };

  const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
    setToken(null);
  };

  // Route protégée
  const ProtectedRoute = ({ element, role, ...rest }) => {
    if (!user || !token) {
      return <Navigate to={role === 'medecin' ? '/login-medecin' : '/login-patient'} />;
    }
    
    if (role && user.role !== role) {
      return <Navigate to="/" />;
    }
    
    return element;
  };

  return (
    <Router>
      <div className="app">
        <Navbar user={user} onLogout={logout} />
        <div className="container">
          <Routes>
            <Route path="/" element={<Accueil />} />
            <Route path="/login-patient" element={<LoginPatient onLogin={login} />} />
            <Route path="/login-medecin" element={<LoginMedecin onLogin={login} />} />
            <Route path="/register-patient" element={<RegisterPatient />} />
            <Route 
              path="/dashboard-patient" 
              element={<ProtectedRoute element={<DashboardPatient user={user} token={token} />} role="patient" />} 
            />
            <Route 
              path="/dashboard-medecin" 
              element={<ProtectedRoute element={<DashboardMedecin user={user} token={token} />} role="medecin" />} 
            />
            <Route 
              path="/prendre-rendez-vous" 
              element={<ProtectedRoute element={<PriseRendezVous user={user} token={token} />} role="patient" />} 
            />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;