import axios from 'axios';

export const API_HOST = import.meta.env.AUDITA_URL ?? window.location.origin;

const api = axios.create({
  baseURL: `${API_HOST}/api`
});

export default api;