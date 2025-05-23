import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../styles/Dashboard.css';

const DashboardPatient = ({ user, token }) => {
  const [rendezVous, setRendezVous] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchRendezVous = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/rendez-vous/patient/${user.id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Erreur lors de la récupération des rendez-vous');
        }
        
        const data = await response.json();
        setRendezVous(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchRendezVous();
  }, [user.id, token]);

  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('fr-FR', options);
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'confirmé':
        return 'status-confirmed';
      case 'en attente':
        return 'status-pending';
      case 'annulé':
        return 'status-cancelled';
      case 'terminé':
        return 'status-completed';
      default:
        return '';
    }
  };

  const handleCancelAppointment = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir annuler ce rendez-vous ?')) {
      return;
    }
    
    try {
      const response = await fetch(`http://localhost:5000/api/rendez-vous/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          statut: 'annulé',
          notes: 'Annulé par le patient'
        })
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors de l\'annulation');
      }
      
      setRendezVous(rendezVous.map(rdv => 
        rdv.id === id ? { ...rdv, statut: 'annulé' } : rdv
      ));
    } catch (err) {
      alert('Erreur: ' + err.message);
    }
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>Tableau de bord patient</h2>
        <Link to="/prendre-rendez-vous" className="btn btn-primary">
          Nouveau rendez-vous
        </Link>
      </div>
      
      {error && <div className="error-message">{error}</div>}
      
      <div className="dashboard-overview">
        <div className="dashboard-card">
          <h3>Prochains rendez-vous</h3>
          <div className="count">{rendezVous.filter(rdv => rdv.statut === 'confirmé').length}</div>
        </div>
        <div className="dashboard-card">
          <h3>En attente</h3>
          <div className="count">{rendezVous.filter(rdv => rdv.statut === 'en attente').length}</div>
        </div>
        <div className="dashboard-card">
          <h3>Terminés</h3>
          <div className="count">{rendezVous.filter(rdv => rdv.statut === 'terminé').length}</div>
        </div>
      </div>
      
      <div className="appointments-section">
        <h3>Mes rendez-vous</h3>
        
        {loading ? (
          <div className="loading">Chargement des rendez-vous...</div>
        ) : rendezVous.length === 0 ? (
          <div className="no-data">
            Vous n'avez pas encore de rendez-vous.
            <Link to="/prendre-rendez-vous" className="btn btn-secondary">
              Prendre un rendez-vous
            </Link>
          </div>
        ) : (
          <div className="appointments-table-container">
            <table className="appointments-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Médecin</th>
                  <th>Spécialité</th>
                  <th>Motif</th>
                  <th>Statut</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {rendezVous.map((rdv) => (
                  <tr key={rdv.id}>
                    <td>{formatDate(rdv.date_heure)}</td>
                    <td>Dr. {rdv.medecin_prenom} {rdv.medecin_nom}</td>
                    <td>{rdv.specialite}</td>
                    <td>{rdv.motif}</td>
                    <td>
                      <span className={`status-badge ${getStatusClass(rdv.statut)}`}>
                        {rdv.statut}
                      </span>
                    </td>
                    <td>
                      {(rdv.statut === 'confirmé' || rdv.statut === 'en attente') && (
                        <button 
                          className="btn btn-danger btn-sm"
                          onClick={() => handleCancelAppointment(rdv.id)}
                        >
                          Annuler
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPatient;