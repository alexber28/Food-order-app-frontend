import { useEffect, useState } from 'react';
import { Container, Typography, Grid, Card, CardActionArea, CardMedia, CardContent, CircularProgress, Alert } from '@mui/material';
import { Link } from 'react-router-dom';
import { api } from '../api/axiosConfig';

// Описываем, как выглядит ресторан, который прилетает с бэкенда
interface Restaurant {
  id: number;
  name: string;
  description: string;
  imageUrl?: string; // Сделали опциональным, чтобы TypeScript не ругался на null
}

export const Home = () => {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  // Этот эффект срабатывает один раз при загрузке страницы
  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const response = await api.get('/restaurants');
        setRestaurants(response.data);
      } catch (err) {
        console.error('Ошибка при загрузке ресторанов:', err);
        setError('Не удалось загрузить список заведений. Проверьте подключение.');
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurants();
  }, []);

  return (
    <Container maxWidth="lg" sx={{ mt: 2 }}>
      {/* Заголовок слева */}
      <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', mb: 4, textAlign: 'left' }}>
        Рестораны и заведения
      </Typography>

      {/* Показываем крутилку, пока идет запрос к БД */}
      {loading && <CircularProgress sx={{ display: 'block', mx: 'auto' }} />}
      
      {/* Если сервер упал или ответил ошибкой */}
      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {/* Сетка для карточек (Grid) */}
      <Grid container spacing={4}>
        {restaurants.map((restaurant) => (
          // Добавили проп "item" и исправили синтаксис размеров колонок
          <Grid key={restaurant.id} size={{ xs: 12, sm: 6, md: 4 }}>
            {/* Карточка ресторана с анимацией увеличения при наведении */}
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', transition: '0.2s', '&:hover': { transform: 'scale(1.03)' } }}>
              {/* CardActionArea делает всю карточку одной большой кликабельной кнопкой */}
              <CardActionArea component={Link} to={`/restaurant/${restaurant.id}`} sx={{ flexGrow: 1 }}>
                
                {/* Фотография ресторана */}
                <CardMedia
                  component="img"
                  height="200"
                  // Подставляем ссылку из базы или заглушку, если картинки нет
                  image={restaurant.imageUrl || 'https://via.placeholder.com/300x200?text=No+Photo'}
                  alt={restaurant.name}
                  sx={{ objectFit: 'cover' }}
                />
                
                {/* Текстовый блок под фотографией */}
                <CardContent>
                  <Typography gutterBottom variant="h6" component="h2" sx={{ fontWeight: 'bold' }}>
                    {restaurant.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {restaurant.description}
                  </Typography>
                </CardContent>
                
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};