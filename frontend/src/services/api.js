/**
 * TriageAI API Service
 * Handles all communication with the backend
 */

import axios from 'axios';
import { API_BASE_URL } from '../utils/constants';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ─── Patient Endpoints ──────────────────────────────

export const getAllPatients = async (status = null, esiLevel = null) => {
  const params = {};
  if (status) params.status = status;
  if (esiLevel) params.esi_level = esiLevel;
  const response = await api.get('/patients', { params });
  return response.data;
};

export const getPatient = async (id) => {
  const response = await api.get(`/patients/${id}`);
  return response.data;
};

export const createPatient = async (patientData) => {
  const response = await api.post('/patients', patientData);
  return response.data;
};

export const updatePatientStatus = async (id, status) => {
  const response = await api.patch(`/patients/${id}/status`, { status });
  return response.data;
};

export const overridePatientTriage = async (id, esiLevel, reason) => {
  const response = await api.patch(`/patients/${id}/override`, {
    esi_level: esiLevel,
    reason,
  });
  return response.data;
};

export const deletePatient = async (id) => {
  const response = await api.delete(`/patients/${id}`);
  return response.data;
};

// ─── Triage Endpoints ───────────────────────────────

export const runTriage = async (patientId) => {
  const response = await api.post(`/triage/${patientId}`);
  return response.data;
};

// ─── Analytics Endpoints ────────────────────────────

export const getAnalytics = async () => {
  const response = await api.get('/analytics');
  return response.data;
};

export default api;
