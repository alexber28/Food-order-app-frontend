import { useState, useEffect, useMemo } from 'react';
import { 
  Typography, Box, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Paper, Select, MenuItem, Chip, Grid, TextField, FormControl, InputLabel
} from '@mui/material';
import { api } from '../api/axiosConfig';

// Подгоняем под твои модели из Java (добавил null на случай, если связи в БД пустые)
interface Order {
  id: number;
  totalPrice: number;
  status: string;
  createdAt: string;
  user: { id: number; firstName: string; lastName: string; email: string } | null;
  restaurant: { id: number; name: string } | null;
}

interface Restaurant {
  id: number;
  name: string;
}

export const AdminOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);

  // Стейты для фильтров
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [filterRestaurantId, setFilterRestaurantId] = useState<number | ''>('');
  const [filterDateFrom, setFilterDateFrom] = useState<string>('');
  const [filterDateTo, setFilterDateTo] = useState<string>('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ordersRes, restRes] = await Promise.all([
          api.get('/orders/all'),
          api.get('/restaurants/all') 
        ]);
        setOrders(ordersRes.data);
        setRestaurants(restRes.data);
      } catch (error) {
        console.error('Ошибка загрузки данных', error);
      }
    };
    fetchData();
  }, []);

  // Меняем статус (улетает на бэкенд)
  const handleStatusChange = async (orderId: number, newStatus: string) => {
    try {
      await api.put(`/orders/${orderId}/status`, { status: newStatus });
      // Обновляем локально
      setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    } catch (error) {
      alert('Ошибка при смене статуса');
    }
  };

  // МАГИЯ ФИЛЬТРАЦИИ
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      // 1. Фильтр по статусу
      const matchStatus = filterStatus ? order.status === filterStatus : true;
      
      // 2. Фильтр по ресторану (безопасная проверка через ?.)
      const matchRest = filterRestaurantId ? order.restaurant?.id === filterRestaurantId : true;
      
      // 3. Фильтр по дате
      let matchDateFrom = true;
      let matchDateTo = true;

      if (order.createdAt) {
        const orderDate = order.createdAt.split('T')[0]; // берем только YYYY-MM-DD
        if (filterDateFrom) matchDateFrom = orderDate >= filterDateFrom;
        if (filterDateTo) matchDateTo = orderDate <= filterDateTo;
      }

      return matchStatus && matchRest && matchDateFrom && matchDateTo;
    });
  }, [orders, filterStatus, filterRestaurantId, filterDateFrom, filterDateTo]);

  // Цвета для твоих Enum статусов
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CREATED': return 'default';
      case 'APPROVED': return 'info';
      case 'READY': return 'warning';
      case 'DELIVERING': return 'secondary';
      case 'COMPLETED': return 'success';
      case 'CANCELLED': return 'error';
      default: return 'default';
    }
  };

  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 3 }}>
        Управление заказами
      </Typography>

      {/* ПАНЕЛЬ ФИЛЬТРОВ */}
      <Paper sx={{ p: 2, mb: 3 }} elevation={1}>
        <Grid container spacing={2} sx={{ alignItems: 'center' }}>
          
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <FormControl fullWidth size="small">
              <InputLabel id="filter-restaurant-label">Ресторан</InputLabel>
              <Select
                labelId="filter-restaurant-label"
                value={filterRestaurantId}
                label="Ресторан"
                onChange={(e) => setFilterRestaurantId(e.target.value as number | '')}
              >
                <MenuItem value=""><em>Все рестораны</em></MenuItem>
                {restaurants.map(r => (
                  <MenuItem key={r.id} value={r.id}>{r.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <FormControl fullWidth size="small">
              <InputLabel id="filter-status-label">Статус</InputLabel>
              <Select
                labelId="filter-status-label"
                value={filterStatus}
                label="Статус"
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <MenuItem value=""><em>Все статусы</em></MenuItem>
                <MenuItem value="CREATED">CREATED</MenuItem>
                <MenuItem value="APPROVED">APPROVED</MenuItem>
                <MenuItem value="READY">READY</MenuItem>
                <MenuItem value="DELIVERING">DELIVERING</MenuItem>
                <MenuItem value="COMPLETED">COMPLETED</MenuItem>
                <MenuItem value="CANCELLED">CANCELLED</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <TextField
              label="С даты"
              type="date"
              fullWidth
              size="small"
              slotProps={{ inputLabel: { shrink: true } }}
              value={filterDateFrom}
              onChange={(e) => setFilterDateFrom(e.target.value)}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <TextField
              label="По дату"
              type="date"
              fullWidth
              size="small"
              slotProps={{ inputLabel: { shrink: true } }}
              value={filterDateTo}
              onChange={(e) => setFilterDateTo(e.target.value)}
            />
          </Grid>
          
        </Grid>
      </Paper>

      {/* ТАБЛИЦА ЗАКАЗОВ */}
      <TableContainer component={Paper} elevation={2}>
        <Table>
          <TableHead sx={{ bgcolor: '#f5f5f5' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>ID</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Дата и время</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Клиент</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Ресторан</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Сумма</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Статус</TableCell>
              <TableCell align="right" sx={{ fontWeight: 'bold' }}>Изменить статус</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredOrders.map((order) => (
              <TableRow key={order.id} hover>
                <TableCell>#{order.id}</TableCell>
                <TableCell>{order.createdAt ? new Date(order.createdAt).toLocaleString() : '—'}</TableCell>
                <TableCell>{order.user?.firstName || '—'} {order.user?.lastName || ''}</TableCell>
                <TableCell>{order.restaurant?.name || '—'}</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>{order.totalPrice} ₽</TableCell>
                <TableCell>
                  <Chip 
                    label={order.status} 
                    color={getStatusColor(order.status) as any} 
                    size="small" 
                    sx={{ fontWeight: 'bold' }}
                  />
                </TableCell>
                <TableCell align="right">
                  <FormControl size="small" sx={{ minWidth: 140 }}>
                    <Select
                      value={order.status}
                      onChange={(e) => handleStatusChange(order.id, e.target.value)}
                      sx={{ bgcolor: 'white' }}
                    >
                      <MenuItem value="CREATED">CREATED</MenuItem>
                      <MenuItem value="APPROVED">APPROVED</MenuItem>
                      <MenuItem value="READY">READY</MenuItem>
                      <MenuItem value="DELIVERING">DELIVERING</MenuItem>
                      <MenuItem value="COMPLETED">COMPLETED</MenuItem>
                      <MenuItem value="CANCELLED">CANCELLED</MenuItem>
                    </Select>
                  </FormControl>
                </TableCell>
              </TableRow>
            ))}
            {filteredOrders.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                  <Typography color="text.secondary">По заданным фильтрам заказов нет.</Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};