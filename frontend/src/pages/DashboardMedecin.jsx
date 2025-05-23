import React, { useState, useEffect } from 'react';
import '../styles/Dashboard.css';

const DashboardMedecin = ({ user, token }) => {
  const [rendezVous, setRendezVous] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentWeekStart, setCurrentWeekStart] = useState(getStartOfWeek(new Date()));
  
  function getStartOfWeek(date) {
    const d = new Date(date);
    const day = d.getDay(); 
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); 
    return new Date(d.setDate(diff));
  }
  
  function getWeekDays(startDate) {
    const weekDays = [];
    const currentDate = new Date(startDate);
    
    for (let i = 0; i < 7; i++) {
      weekDays.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return weekDays;
  }
  
  const goToPreviousWeek = () => {
    const newStart = new Date(currentWeekStart);
    newStart.setDate(newStart.getDate() - 7);
    setCurrentWeekStart(newStart);
  };
  
  const goToNextWeek = () => {
    const newStart = new Date(currentWeekStart);
    newStart.setDate(newStart.getDate() + 7);
    setCurrentWeekStart(newStart);
  };
  
  const goToCurrentWeek = () => {
    setCurrentWeekStart(getStartOfWeek(new Date()));
  };

  useEffect(() => {
    const fetchRendezVous = async () => {
      try {
        setLoading(true);
        const response = await fetch(`http://localhost:5000/api/rendez-vous/medecin/${user.id}`, {
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
  
  const formatShortDate = (date) => {
    const options = { day: 'numeric', month: 'short' };
    return date.toLocaleDateString('fr-FR', options);
  };
  
  const formatDayName = (date) => {
    const options = { weekday: 'long' };
    return date.toLocaleDateString('fr-FR', options);
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

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      const response = await fetch(`http://localhost:5000/api/rendez-vous/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          statut: newStatus,
          notes: `Mis à jour par le médecin: ${newStatus}`
        })
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors de la mise à jour');
      }
      
      setRendezVous(rendezVous.map(rdv => 
        rdv.id === id ? { ...rdv, statut: newStatus } : rdv
      ));
    } catch (err) {
      alert('Erreur: ' + err.message);
    }
  };
  
  const getAppointmentsForDate = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    return rendezVous.filter(rdv => {
      const rdvDate = new Date(rdv.date_heure).toISOString().split('T')[0];
      return rdvDate === dateStr;
    }).sort((a, b) => new Date(a.date_heure) - new Date(b.date_heure));
  };
  
  const isToday = (date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();
  };
  
  const pendingAppointments = rendezVous.filter(rdv => rdv.statut === 'en attente')
    .sort((a, b) => new Date(a.date_heure) - new Date(b.date_heure));
  
  const weekDays = getWeekDays(currentWeekStart);

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>Tableau de bord médecin</h2>
      </div>
      
      {error && <div className="error-message">{error}</div>}
      
      <div className="dashboard-overview">
        <div className="dashboard-card">
          <h3>Total rendez-vous</h3>
          <div className="count">{rendezVous.length}</div>
        </div>
        <div className="dashboard-card">
          <h3>Cette semaine</h3>
          <div className="count">
            {rendezVous.filter(rdv => {
              const rdvDate = new Date(rdv.date_heure);
              const rdvWeekStart = getStartOfWeek(rdvDate);
              const currentWeekStartStr = currentWeekStart.toISOString().split('T')[0];
              const rdvWeekStartStr = rdvWeekStart.toISOString().split('T')[0];
              return currentWeekStartStr === rdvWeekStartStr;
            }).length}
          </div>
        </div>
        <div className="dashboard-card">
          <h3>En attente</h3>
          <div className="count">{pendingAppointments.length}</div>
        </div>
      </div>
      
      <div className="week-navigator">
        <button className="btn btn-secondary btn-sm" onClick={goToPreviousWeek}>
          <i className="fas fa-chevron-left"></i> Semaine précédente
        </button>
        <button className="btn btn-primary btn-sm" onClick={goToCurrentWeek}>
          Semaine courante
        </button>
        <button className="btn btn-secondary btn-sm" onClick={goToNextWeek}>
          Semaine suivante <i className="fas fa-chevron-right"></i>
        </button>
      </div>
      
      <div className="week-calendar">
        <h3>Planning du {formatShortDate(currentWeekStart)} au {formatShortDate(weekDays[6])}</h3>
        
        {loading ? (
          <div className="loading">Chargement des rendez-vous...</div>
        ) : (
          <div className="calendar-grid">
            {weekDays.map((day, index) => (
              <div 
                key={index} 
                className={`calendar-day ${isToday(day) ? 'today' : ''}`}
              >
                <div className="day-header">
                  <span className="day-name">{formatDayName(day)}</span>
                  <span className="day-date">{formatShortDate(day)}</span>
                </div>
                
                <div className="day-appointments">
                  {getAppointmentsForDate(day).length === 0 ? (
                    <div className="no-appointments">Aucun rendez-vous</div>
                  ) : (
                    getAppointmentsForDate(day).map(rdv => (
                      <div 
                        key={rdv.id} 
                        className={`appointment-card ${getStatusClass(rdv.statut)}`}
                      >
                        <div className="appointment-time">
                          {new Date(rdv.date_heure).toLocaleTimeString('fr-FR', {hour: '2-digit', minute:'2-digit'})}
                        </div>
                        <div className="appointment-patient">
                          {rdv.patient_prenom} {rdv.patient_nom}
                        </div>
                        <div className="appointment-motif" title={rdv.motif}>
                          {rdv.motif.length > 30 ? rdv.motif.substring(0, 30) + '...' : rdv.motif}
                        </div>
                        <div className="appointment-actions">
                          {rdv.statut === 'en attente' && (
                            <button 
                              className="btn btn-success btn-xs"
                              onClick={() => handleUpdateStatus(rdv.id, 'confirmé')}
                            >
                              <i className="fas fa-check"></i>
                            </button>
                          )}
                          
                          {(rdv.statut === 'confirmé' || rdv.statut === 'en attente') && (
                            <button 
                              className="btn btn-primary btn-xs"
                              onClick={() => handleUpdateStatus(rdv.id, 'terminé')}
                            >
                              <i className="fas fa-flag-checkered"></i>
                            </button>
                          )}
                          
                          {(rdv.statut === 'confirmé' || rdv.statut === 'en attente') && (
                            <button 
                              className="btn btn-danger btn-xs"
                              onClick={() => handleUpdateStatus(rdv.id, 'annulé')}
                            >
                              <i className="fas fa-times"></i>
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <div className="pending-appointments-section">
        <h3>Rendez-vous en attente de confirmation</h3>
        
        {loading ? (
          <div className="loading">Chargement des rendez-vous...</div>
        ) : pendingAppointments.length === 0 ? (
          <div className="no-data">Aucun rendez-vous en attente.</div>
        ) : (
          <div className="appointments-table-container">
            <table className="appointments-table">
              <thead>
                <tr>
                  <th>Date et heure</th>
                  <th>Patient</th>
                  <th>Téléphone</th>
                  <th>Motif</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pendingAppointments.map((rdv) => (
                  <tr key={rdv.id}>
                    <td>{formatDate(rdv.date_heure)}</td>
                    <td>{rdv.patient_prenom} {rdv.patient_nom}</td>
                    <td>{rdv.patient_telephone}</td>
                    <td>{rdv.motif}</td>
                    <td className="actions-cell">
                      <button 
                        className="btn btn-success btn-sm"
                        onClick={() => handleUpdateStatus(rdv.id, 'confirmé')}
                      >
                        Confirmer
                      </button>
                      <button 
                        className="btn btn-danger btn-sm"
                        onClick={() => handleUpdateStatus(rdv.id, 'annulé')}
                      >
                        Annuler
                      </button>
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

export default DashboardMedecin;