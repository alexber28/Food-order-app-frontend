import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { 
  Container, Typography, Box, Grid, Card, CardContent, CardMedia, 
  Button, CircularProgress, Alert, Divider 
} from '@mui/material';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import { api } from '../api/axiosConfig';

// Описываем типы
interface Dish {
  id: number;
  name: string;
  description: string;
  price: number;
  imageUrl?: string;
}

interface Restaurant {
  id: number;
  name: string;
  description: string;
  imageUrl?: string;
}

export const RestaurantPage = () => {
  const { id } = useParams<{ id: string }>(); // Берем ID из URL
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchRestaurantData = async () => {
      try {
        setLoading(true);
        // 1. Получаем данные ресторана
        const resRest = await api.get(`/restaurants/${id}`);
        setRestaurant(resRest.data);

        // 2. Получаем блюда этого ресторана (убедись, что эндпоинт такой)
        const resDishes = await api.get(`/dishes/restaurant/${id}`);
        setDishes(resDishes.data);
      } catch (err) {
        console.error(err);
        setError('Не удалось загрузить данные ресторана.');
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurantData();
  }, [id]);

  // Функция для добавления в корзину (пока заглушка)
  //const addToCart = (dish: Dish) => {
    //console.log('Добавлено в корзину:', dish.name);
    //alert(`${dish.name} добавлен в корзину!`);
  //};

  // Функция добавления блюда в корзину (на бэкенд)
  const addToCart = async (dishId: number) => {
    // Проверка авторизации (если у тебя есть стейт или контекст auth)
    const token = localStorage.getItem('token'); // Или как ты проверяешь авторизацию
    if (!token) {
      // Если используешь useNavigate от react-router-dom:
      // navigate('/login');
      alert('Пожалуйста, войдите в аккаунт, чтобы добавлять блюда');
      return;
    }

    try {
      // Отправляем запрос на бэкенд. Передаем dishId и количество (по умолчанию 1)
      await api.post('/cart/add', { 
        dishId: dishId, 
        quantity: 1 
      });
      
      alert('Блюдо добавлено в корзину! ✨');
      // В идеале тут можно добавить красивое уведомление (Snackbar)
    } catch (err) {
      console.error('Ошибка при добавлении в корзину:', err);
      alert('Не удалось добавить товар. Попробуйте позже.');
    }
  };

  if (loading) return <CircularProgress sx={{ display: 'block', mx: 'auto', mt: 5 }} />;
  if (error) return <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>;

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
      {/* HERO SECTION с фоновым фото */}
      <Box
        sx={{
          width: '100%',
          height: 350,
          borderRadius: 4,
          mb: 5,
          backgroundImage: `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.6)), url('${restaurant?.imageUrl || 'https://via.placeholder.com/1200x400?text=No+Photo'}')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          p: 4,
          color: 'white',
        }}
      >
        <Typography variant="h2" sx={{ fontWeight: 'bold', mb: 1 }}>
          {restaurant?.name}
        </Typography>
        <Typography variant="h6" sx={{ opacity: 0.9 }}>
          {restaurant?.description}
        </Typography>
      </Box>

      <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 3 }}>
        Меню
      </Typography>
      <Divider sx={{ mb: 4 }} />

      {/* Список блюд */}
      <Grid container spacing={3}>
        {dishes.map((dish) => (
          <Grid key={dish.id} size={{ xs: 12, sm: 6, md: 4 }}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', borderRadius: 3 }}>
              <CardMedia
                component="img"
                height="180"
                image={dish.imageUrl || 'https://via.placeholder.com/300x180?text=Dish'}
                alt={dish.name}
              />
              <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    {dish.name}
                  </Typography>
                  <Typography variant="h6" color="primary" sx={{ fontWeight: 'bold' }}>
                    {dish.price} $
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {dish.description}
                </Typography>
                <Button 
                  fullWidth 
                  variant="contained" 
                  startIcon={<AddShoppingCartIcon />}
                  onClick={() => addToCart(dish.id)}
                  sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 'bold' }}
                >
                  В корзину
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {dishes.length === 0 && (
        <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', mt: 4 }}>
          В этом ресторане пока нет блюд.
        </Typography>
      )}
    </Container>
  );
};