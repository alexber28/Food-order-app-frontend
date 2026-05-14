import axios from 'axios';

// Создаем нашего собственного "курьера" с базовым адресом твоего бэкенда
export const api = axios.create({
  baseURL: 'http://localhost:8080/api',
});

// Добавляем "перехватчик" (Interceptor)
// Он срабатывает АВТОМАТИЧЕСКИ перед каждым запросом на сервер
api.interceptors.request.use((config) => {
  // Ищем токен в памяти браузера (localStorage)
  const token = localStorage.getItem('token');
  
  // Если токен есть - приклеиваем его к заголовкам
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  return config;
}, (error) => {
  return Promise.reject(error);
});