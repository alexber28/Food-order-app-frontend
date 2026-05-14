import { useEffect, useState } from 'react';
import { Container, Typography, Paper, List, ListItem, ListItemText, ListItemSecondaryAction, IconButton, Button, Divider, Box, CircularProgress } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { api } from '../api/axiosConfig';

// 1. Обновили интерфейс под реальный ответ бэкенда
interface CartItem {
  id: number;
  quantity: number;
  dish: {
    name: string;
    price: number;
    description: string;
  };
}

export const Cart = () => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCart = async () => {
    try {
      const response = await api.get('/cart');
      setItems(response.data.items || response.data); // Зависит от того, как бэк возвращает список
    } catch (err) {
      console.error('Ошибка загрузки корзины', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const handleRemove = async (itemId: number) => {
    try {
      // Эндпоинт удаления товара из корзины
      await api.delete(`/cart/remove/${itemId}`);
      setItems(items.filter(item => item.id !== itemId));
    } catch (err) {
      alert('Не удалось удалить товар');
    }
  };

  const handleCheckout = async () => {
    try {
      // Отправляем запрос на создание заказа
      await api.post('/orders/create');
      
      // Если всё прошло успешно (статус 200)
      alert('Ура! Ваш заказ успешно оформлен! 🎉');
      
      // Очищаем корзину на фронтенде, так как бэкенд её уже опустошил
      setItems([]); 
    } catch (err) {
      console.error('Ошибка при оформлении заказа:', err);
      alert('Не удалось оформить заказ. Возможно, на балансе недостаточно средств или произошла ошибка.');
    }
  };

  // 2. Исправили подсчет суммы: теперь берем цену из вложенного объекта dish
  const totalPrice = items.reduce((sum, item) => sum + item.dish.price * item.quantity, 0);

  if (loading) return <CircularProgress sx={{ display: 'block', m: '50px auto' }} />;

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold' }}>Ваша корзина 🛒</Typography>
      
      {items.length === 0 ? (
        <Typography variant="h6" color="text.secondary">Корзина пуста. Время что-нибудь заказать!</Typography>
      ) : (
        <Paper elevation={3} sx={{ p: 3, borderRadius: 3 }}>
          <List>
            {items.map((item) => (
              <Box key={item.id}>
                <ListItem>
                  <ListItemText 
                    primary={
                        <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                        {/* 3. Берем имя блюда из объекта dish */}
                        {item.dish.name}
                        </Typography>
                    } 
                    // 4. Берем цену из объекта dish
                    secondary={`${item.quantity} шт. x ${item.dish.price} $`}
                    />
                  <ListItemSecondaryAction>
                    <IconButton edge="end" onClick={() => handleRemove(item.id)} color="error">
                      <DeleteIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
                <Divider />
              </Box>
            ))}
          </List>
          
          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
              Итого: {totalPrice} $
            </Typography>
            <Button variant="contained" color="success" size="large" sx={{ borderRadius: 2 }} onClick={handleCheckout}>
              Оформить заказ
            </Button>
          </Box>
        </Paper>
      )}
    </Container>
  );
};