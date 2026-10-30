import axios from 'axios';

// Default to relative '/api' so all requests pass transparently through the Vite proxy
// on the same origin (preventing "Connection Refused: localhost:8000" on public tunnels)
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 25000,
});

// ==========================================
// 1. Site Assessment APIs
// ==========================================
export const fetchBenchmarkSites = async () => {
  const response = await apiClient.get('/sites');
  return response.data;
};

export const fetchSiteById = async (siteId) => {
  const response = await apiClient.get(`/sites/${siteId}`);
  return response.data;
};

export const assessCustomSite = async (sitePayload) => {
  const response = await apiClient.post('/assess', sitePayload);
  return response.data;
};

export const compareSites = async (payload = {}) => {
  const response = await apiClient.post('/compare', payload);
  return response.data;
};

// ==========================================
// 2. Authentic Live Telemetry & NASA/Gov APIs
// ==========================================
export const fetchLiveTelemetry = async (payload) => {
  const response = await apiClient.post('/telemetry/fetch-real-data', payload);
  return response.data;
};

export const assessLiveSite = async (payload) => {
  const response = await apiClient.post('/assess/live', payload);
  return response.data;
};

// ==========================================
// 3. Data Center Engineering Planner APIs
// ==========================================
export const fetchDCHardwareOptions = async () => {
  const response = await apiClient.get('/dc/hardware');
  return response.data;
};

export const calculateDCPlan = async (payload) => {
  const response = await apiClient.post('/dc/plan', payload);
  return response.data;
};

// ==========================================
// 4. GPU Marketplace & Allocation APIs
// ==========================================
export const fetchMarketplaceNodes = async () => {
  const response = await apiClient.get('/marketplace/nodes');
  return response.data;
};

export const allocateWorkload = async (payload) => {
  const response = await apiClient.post('/marketplace/allocate', payload);
  return response.data;
};

// ==========================================
// 5. National AI Demand Forecasting APIs
// ==========================================
export const fetchDemandForecast = async () => {
  const response = await apiClient.get('/demand/forecast');
  return response.data;
};

export const simulateDemand = async (payload) => {
  const response = await apiClient.post('/demand/simulate', payload);
  return response.data;
};

// ==========================================
// 6. Citizen Financing Simulation APIs
// ==========================================
export const fetchCitizenProjects = async () => {
  const response = await apiClient.get('/citizen/projects');
  return response.data;
};

export const simulateCitizenParticipation = async (payload) => {
  const response = await apiClient.post('/citizen/simulate', payload);
  return response.data;
};

// ==========================================
// 7. Government Policy Intelligence APIs
// ==========================================
export const fetchStatePolicies = async () => {
  const response = await apiClient.get('/policy/states');
  return response.data;
};

export const fetchIndiaAIMission = async () => {
  const response = await apiClient.get('/policy/india-ai');
  return response.data;
};

// ==========================================
// 8. System Health API
// ==========================================
export const checkApiHealth = async () => {
  try {
    const res = await apiClient.get('/health', { baseURL: '' });
    return res.data;
  } catch (err) {
    try {
      const res = await apiClient.get('/health');
      return res.data;
    } catch (innerErr) {
      return { status: 'offline', error: innerErr.message };
    }
  }
};
