import { useState } from 'react';
import { TextField, Button, Box, Typography, Paper, Alert } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/axiosConfig';
import { Link } from 'react-router-dom';

export const Login = () => {
  // Состояния для хранения того, что юзер вводит в поля
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  const { login } = useAuth(); // Достаем функцию сохранения токена из Контекста
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Останавливаем стандартную перезагрузку страницы
    setError('');

    try {
      // Дергаем наш Spring Boot бэкенд
      const response = await api.post('/auth/login', { email, password });
      
      // Если всё ок, передаем токен в наш глобальный Контекст
      login(response.data.token);
      
      // И перекидываем пользователя на главную страницу
      navigate('/');
    } catch (err) {
      console.error(err);
      setError('Неверный email или пароль! Проверьте данные.');
    }
  };

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
      {/* Paper - это красивая карточка с тенью */}
      <Paper elevation={3} sx={{ p: 4, width: '100%', maxWidth: 400 }}>
        <Typography variant="h5" align="center" gutterBottom>
          Вход в систему
        </Typography>
        
        {/* Если есть ошибка - показываем красный алерт */}
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <form onSubmit={handleSubmit}>
          <TextField
            label="Email"
            type="email"
            fullWidth
            margin="normal"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <TextField
            label="Пароль"
            type="password"
            fullWidth
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            sx={{ mt: 3, py: 1.5 }}
          >
            Войти
          </Button>
          <Typography variant="body2" sx={{ textAlign: 'center', mt: 2 }}>
            Нет аккаунта?{' '}
            <Link to="/register" style={{ textDecoration: 'none', color: '#1976d2', fontWeight: 'bold' }}>
              Зарегистрироваться
            </Link>
          </Typography>
        </form>
      </Paper>
    </Box>
  );
};