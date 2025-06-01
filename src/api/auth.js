import axios from 'axios';
import API_BASE_URL  from './config';

const AUTH = axios.create({
  baseURL: `${API_BASE_URL}/auth`,
});

AUTH.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});


export const login = (email, password) =>
  AUTH.post('/login', { email, password });

export const register = (email, username, password) =>
  AUTH.post('/register', { email, username, password });

export const updateUser = (data) =>
  AUTH.put('/update', data);

export const deleteUser = () =>
  AUTH.delete('/delete');
