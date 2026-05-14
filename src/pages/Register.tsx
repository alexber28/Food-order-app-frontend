import { useState } from 'react';
import { Container, Typography, TextField, Button, Box, Paper, Alert } from '@mui/material';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../api/axiosConfig';

export const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phoneNumber: ''
  });
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      // Обрати внимание на эндпоинт. Убедись, что он совпадает с твоим (например, /auth/signup или /auth/register)
      await api.post('/auth/register', formData);
      
      alert('Регистрация прошла успешно! 🎉 Теперь вы можете войти.');
      navigate('/login'); // Перекидываем на страницу логина
    } catch (err: any) {
      console.error('Ошибка регистрации:', err);
      setError(err.response?.data?.message || 'Не удалось зарегистрироваться. Возможно, такой email уже существует.');
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
        <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold', textAlign: 'center' }}>
          Регистрация
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              label="Имя"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              fullWidth
              required
            />
            <TextField
              label="Фамилия"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              fullWidth
              required
            />
          </Box>
          
          <TextField
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            fullWidth
            required
          />
          
          <TextField
            label="Номер телефона"
            name="phoneNumber"
            type="tel"
            value={formData.phoneNumber}
            onChange={handleChange}
            fullWidth
            required
            helperText="Например: +375-29-123-45-67"
          />
          
          <TextField
            label="Пароль"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            fullWidth
            required
          />

          <Button 
            type="submit" 
            variant="contained" 
            color="primary" 
            size="large" 
            sx={{ mt: 2, py: 1.5, fontWeight: 'bold', borderRadius: 2 }}
          >
            Зарегистрироваться
          </Button>

          <Typography variant="body2" sx={{ textAlign: 'center', mt: 2 }}>
            Уже есть аккаунт?{' '}
            <Link to="/login" style={{ textDecoration: 'none', color: '#1976d2', fontWeight: 'bold' }}>
              Войти
            </Link>
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};