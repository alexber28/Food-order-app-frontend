import { useState, useEffect } from 'react';
import { 
  Typography, Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, 
  Paper, Select, MenuItem, Chip, Button, Dialog, DialogTitle, DialogContent, DialogActions, 
  TextField, FormControl, InputLabel
} from '@mui/material';
import { api } from '../api/axiosConfig';

// 1. ОБНОВИЛИ ИНТЕРФЕЙС
interface Order {
  id: number;
  totalPrice: number;
  status: string;
  waitTime: number | null;
  createdAt: string;
  user: { firstName: string; lastName: string; email: string; phoneNumber: string } | null;
  items: { 
    id: number; 
    quantity: number; 
    dish: { name: string }; 
  }[]; // Добавили массив позиций
}

export const ManagerOrders = ({ restaurantId }: { restaurantId: number }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [newStatus, setNewStatus] = useState('');
  const [newWaitTime, setNewWaitTime] = useState<number | ''>('');

  const fetchOrders = async () => {
    try {
      const res = await api.get(`/orders/restaurant/${restaurantId}`);
      const sortedOrders = res.data.sort((a: Order, b: Order) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setOrders(sortedOrders);
    } catch (err) {
      console.error('Ошибка загрузки заказов', err);
    }
  };

  useEffect(() => { fetchOrders(); }, [restaurantId]);

  const handleOpenDialog = (order: Order) => {
    setSelectedOrder(order);
    setNewStatus(order.status);
    setNewWaitTime(order.waitTime || '');
    setOpenDialog(true);
  };

  const handleUpdateOrder = async () => {
    if (!selectedOrder) return;
    try {
      await api.put(`/orders/${selectedOrder.id}/status`, { 
        status: newStatus,
        waitTime: newWaitTime !== '' ? String(newWaitTime) : null
      });
      setOpenDialog(false);
      fetchOrders();
    } catch (error) {
      alert('Ошибка при обновлении заказа');
    }
  };

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
      <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3 }}>Текущие заказы</Typography>

      <TableContainer component={Paper} elevation={2}>
        <Table>
          <TableHead sx={{ bgcolor: '#f5f5f5' }}>
            <TableRow>
              <TableCell>№</TableCell>
              <TableCell>Дата</TableCell>
              <TableCell>Клиент</TableCell>
              <TableCell>Состав заказа</TableCell> {/* НОВАЯ КОЛОНКА */}
              <TableCell>Сумма</TableCell>
              <TableCell>Статус</TableCell>
              <TableCell>Ожидание</TableCell>
              <TableCell align="right">Действия</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id} hover>
                <TableCell>#{order.id}</TableCell>
                <TableCell>
                  {new Date(order.createdAt).toLocaleDateString()}
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                    {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Typography>
                </TableCell>
                
                {/* 2. ВЫВОДИМ ИМЯ И ТЕЛЕФОН */}
                <TableCell>
                  <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                    {order.user?.firstName} {order.user?.lastName}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {order.user?.phoneNumber || 'Телефон не указан'}
                  </Typography>
                </TableCell>

                {/* 3. ВЫВОДИМ СПИСОК БЛЮД */}
                <TableCell>
                  {order.items?.map(item => (
                    <Typography key={item.id} variant="body2" sx={{ whiteSpace: 'nowrap' }}>
                      • {item.dish?.name} <Box component="span" sx={{ color: 'primary.main', fontWeight: 'bold' }}>x{item.quantity}</Box>
                    </Typography>
                  ))}
                  {(!order.items || order.items.length === 0) && (
                    <Typography variant="caption" color="error">Пусто (ошибка)</Typography>
                  )}
                </TableCell>

                <TableCell sx={{ fontWeight: 'bold' }}>{order.totalPrice} $</TableCell>
                <TableCell>
                  <Chip label={order.status} color={getStatusColor(order.status) as any} size="small" />
                </TableCell>
                <TableCell>
                  {order.waitTime ? (
                    <Typography variant="body2" sx={{ color: 'primary.main', fontWeight: 'bold' }}>
                      ~ {order.waitTime} мин.
                    </Typography>
                  ) : (
                    '—'
                  )}
                </TableCell>
                <TableCell align="right">
                  <Button variant="outlined" size="small" onClick={() => handleOpenDialog(order)}>
                    Ред.
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {orders.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 3 }}>Заказов пока нет.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* ДИАЛОГ (без изменений, просто оставляем как был) */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold' }}>Заказ #{selectedOrder?.id}</DialogTitle>
        <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <FormControl fullWidth>
            <InputLabel>Статус заказа</InputLabel>
            <Select value={newStatus} label="Статус заказа" onChange={(e) => setNewStatus(e.target.value)}>
              <MenuItem value="CREATED">CREATED (Новый)</MenuItem>
              <MenuItem value="APPROVED">APPROVED (Готовится)</MenuItem>
              <MenuItem value="READY">READY (Готов к выдаче)</MenuItem>
              <MenuItem value="DELIVERING">DELIVERING (В пути)</MenuItem>
              <MenuItem value="COMPLETED">COMPLETED (Доставлен)</MenuItem>
              <MenuItem value="CANCELLED">CANCELLED (Отменен)</MenuItem>
            </Select>
          </FormControl>
          <TextField
            label="Время ожидания (минут)"
            type="number"
            fullWidth
            value={newWaitTime}
            onChange={(e) => setNewWaitTime(e.target.value ? Number(e.target.value) : '')}
            helperText="Например: 30"
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenDialog(false)}>Отмена</Button>
          <Button variant="contained" onClick={handleUpdateOrder}>Сохранить</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};