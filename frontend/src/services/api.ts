import axios from 'axios';
import { Incident, IncidentSummary, MLMetrics, User } from '../types';

const API_BASE = 'http://127.0.0.1:8000/api/v1';

const apiClient = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor for JWT
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('cybershield_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const api = {
  // Auth
  login: async (username: string, password: string): Promise<{ access_token: string; user: User }> => {
    const res = await apiClient.post('/auth/login', { username, password });
    return res.data;
  },
  register: async (username: string, email: string, password: string): Promise<{ access_token: string; user: User }> => {
    const res = await apiClient.post('/auth/register', { username, email, password });
    return res.data;
  },
  getMe: async (): Promise<User> => {
    const res = await apiClient.get('/auth/me');
    return res.data;
  },

  // Incidents
  getIncidents: async (status?: string, severity?: string, limit = 50): Promise<Incident[]> => {
    const params: any = { limit };
    if (status) params.status = status;
    if (severity) params.severity = severity;
    const res = await apiClient.get('/incidents/', { params });
    return res.data;
  },
  getIncidentSummary: async (): Promise<IncidentSummary> => {
    const res = await apiClient.get('/incidents/summary');
    return res.data;
  },
  updateIncidentStatus: async (id: number, status: string, reviewer = 'Analyst'): Promise<Incident> => {
    const res = await apiClient.patch(`/incidents/${id}/status`, { status, reviewer });
    return res.data;
  },

  // ML Models
  getMetrics: async (datasetType = 'CIC-IDS2017'): Promise<MLMetrics> => {
    const res = await apiClient.get('/models/metrics', { params: { dataset_type: datasetType } });
    return res.data;
  },
  trainModel: async (datasetType = 'CIC-IDS2017', nEstimators = 40): Promise<any> => {
    const res = await apiClient.post('/models/train', null, {
      params: { dataset_type: datasetType, n_estimators: nEstimators },
    });
    return res.data;
  },

  // Stream Control
  controlStream: async (action: 'start' | 'pause', speed = 1.0, datasetType = 'CIC-IDS2017'): Promise<any> => {
    const res = await apiClient.post('/stream/control', null, {
      params: { action, speed, dataset_type: datasetType },
    });
    return res.data;
  },

  // Telegram Bot
  linkTelegram: async (chatId: number, linkCode: string): Promise<any> => {
    const res = await apiClient.post('/bot/link', { chat_id: chatId, link_code: linkCode });
    return res.data;
  },
};
