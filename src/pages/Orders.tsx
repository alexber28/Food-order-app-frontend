import { useEffect, useState } from 'react';
import { 
  Container, Typography, Paper, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, Chip, Button, Box, CircularProgress 
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import { api } from '../api/axiosConfig';

interface Order {
  id: number;
  createdAt: string; // Было orderDate
  totalPrice: number;
  status: string;
  restaurant: {      // Было restaurantName: string
    name: string;
  };
  waitTime: number;// Пока делаем опциональным, так как бэкенд их не шлет
}

export const Orders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  // Функция загрузки заказов
  const fetchOrders = async () => {
    try {
      setLoading(true);
      // Предполагаем, что GET /api/orders возвращает заказы текущего юзера
      const response = await api.get('/orders');
      setOrders(response.data);
    } catch (err) {
      console.error('Ошибка при получении заказов:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Функция для красивого отображения статуса
  const getStatusChip = (status: string) => {
    const statusMap: Record<string, { label: string, color: any }> = {
      'CREATED': { label: 'Создан', color: 'default' },
      'APPROVED': { label: 'Готовится', color: 'primary' },
      'READY': { label: 'Готов к выдаче', color: 'primary' },
      'DELIVERING': { label: 'В пути', color: 'info' },
      'COMPLETED': { label: 'Доставлен', color: 'success' },
      'CANCELLED': { label: 'Отменен', color: 'error' },
    };
    const config = statusMap[status] || { label: status, color: 'default' };
    return <Chip label={config.label} color={config.color} variant="outlined" size="small" />;
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          Мои заказы
        </Typography>
        <Button 
          variant="outlined" 
          startIcon={<RefreshIcon />} 
          onClick={fetchOrders}
          disabled={loading}
        >
          Обновить
        </Button>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>
      ) : orders.length === 0 ? (
        <Typography variant="h6" color="text.secondary">У вас пока нет активных заказов.</Typography>
      ) : (
        <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
          <Table>
            <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>Дата</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Ресторан</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Время ожидания</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Сумма</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Статус</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
            {orders.map((order) => (
                <TableRow key={order.id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                
                {/* Исправили дату: теперь читаем из createdAt */}
                <TableCell>
                    {new Date(order.createdAt).toLocaleDateString()} 
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                    {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Typography>
                </TableCell>
                
                {/* Исправили ресторан: теперь читаем вложенный объект */}
                <TableCell sx={{ fontWeight: 'medium' }}>{order.restaurant.name}</TableCell>
                
                {/* Позиции: оставили безопасную проверку */}
                <TableCell>
                {order.waitTime > 0 
                    ? <Typography variant="body2" sx={{ fontWeight: 'bold' }}>{order.waitTime} мин.</Typography>
                    : <Typography variant="body2" color="text.secondary">Рассчитывается...</Typography>
                }
                </TableCell>
                
                <TableCell sx={{ fontWeight: 'bold' }}>{order.totalPrice} $</TableCell>
                
                <TableCell>
                    {getStatusChip(order.status)}
                </TableCell>
                </TableRow>
            ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Container>
  );
};