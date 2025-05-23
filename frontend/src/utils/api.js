const API_URL = 'http://localhost:5000/api';


export const apiRequest = async (endpoint, method = 'GET', data = null, token = null) => {
  try {
    const headers = {
      'Content-Type': 'application/json'
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const config = {
      method,
      headers
    };

    if (data && (method === 'POST' || method === 'PUT')) {
      config.body = JSON.stringify(data);
    }

    const response = await fetch(`${API_URL}${endpoint}`, config);
    const responseData = await response.json();

    if (!response.ok) {
      throw new Error(responseData.message || 'Une erreur est survenue');
    }

    return responseData;
  } catch (error) {
    throw error;
  }
};

export const getMedecins = async () => {
  return apiRequest('/medecins');
};


export const getPatientRendezVous = async (patientId, token) => {
  return apiRequest(`/rendez-vous/patient/${patientId}`, 'GET', null, token);
};


export const getMedecinRendezVous = async (medecinId, token) => {
  return apiRequest(`/rendez-vous/medecin/${medecinId}`, 'GET', null, token);
};


export const createRendezVous = async (rendezVousData, token) => {
  return apiRequest('/rendez-vous', 'POST', rendezVousData, token);
};


export const updateRendezVousStatus = async (rendezVousId, statut, notes, token) => {
  return apiRequest(`/rendez-vous/${rendezVousId}`, 'PUT', { statut, notes }, token);
};


export const registerPatient = async (patientData) => {
  return apiRequest('/auth/patient/register', 'POST', patientData);
};


export const login = async (email, mot_de_passe, role) => {
  return apiRequest('/auth/login', 'POST', { email, mot_de_passe, role });
};