import { useState, useEffect } from 'react';
import { 
  Typography, Box, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, 
  IconButton, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Switch, FormControlLabel, Chip, Avatar, FormControl,
  Select, MenuItem
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { api } from '../api/axiosConfig';

// 1. Интерфейс ресторана соответствует ответу Бэкенда (менеджер — это объект)
interface Restaurant {
  id: number;
  name: string;
  description: string;
  visible: boolean;
  imageUrl: string;
  manager: { id: number; firstName?: string; lastName?: string; email?: string } | null;
}

// 2. Интерфейс формы для удобства работы со стейтом (менеджер — это просто ID)
interface RestaurantFormData {
  name: string;
  description: string;
  visible: boolean;
  imageUrl: string;
  managerId: number | null;
}

export const AdminRestaurants = () => {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [managers, setManagers] = useState<any[]>([]); 
  
  const [formData, setFormData] = useState<RestaurantFormData>({ 
    name: '', 
    description: '', 
    visible: true, 
    imageUrl: '',
    managerId: null 
  });

  const fetchRestaurants = async () => {
    try {
      const response = await api.get('/restaurants/all'); 
      setRestaurants(response.data);
    } catch (error) {
      console.error('Ошибка загрузки ресторанов', error);
    }
  };

  const fetchManagers = async () => {
    try {
      const res = await api.get('/users/managers');
      setManagers(res.data);
    } catch (err) {
      console.error("Ошибка загрузки менеджеров", err);
    }
  };

  useEffect(() => {
    fetchRestaurants();
    fetchManagers();
  }, []);

  const handleOpen = (restaurant?: Restaurant) => {
    if (restaurant) {
      setEditingId(restaurant.id);
      setFormData({ 
        name: restaurant.name, 
        description: restaurant.description, 
        visible: restaurant.visible,
        imageUrl: restaurant.imageUrl || '',
        // ИЗВЛЕКАЕМ id из объекта manager для селекта
        managerId: restaurant.manager ? restaurant.manager.id : null 
      });
    } else {
      setEditingId(null);
      setFormData({ 
        name: '', 
        description: '', 
        visible: true, 
        imageUrl: '', 
        managerId: null 
      });
    }
    setOpenDialog(true);
  };

  const handleClose = () => setOpenDialog(false);

  const handleSubmit = async () => {
    try {
      // ПРЕОБРАЗУЕМ плоский managerId в объект manager: { id: ... } для Hibernate
      const dataToSend = {
        name: formData.name,
        description: formData.description,
        visible: formData.visible,
        imageUrl: formData.imageUrl,
        manager: formData.managerId ? { id: formData.managerId } : null
      };

      if (editingId) {
        await api.put(`/restaurants/${editingId}`, dataToSend);
      } else {
        await api.post('/restaurants/create', dataToSend);
      }
      handleClose();
      fetchRestaurants();
    } catch (error) {
      console.error('Ошибка сохранения', error);
      alert('Ошибка при сохранении');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Вы уверены, что хотите удалить этот ресторан?')) return;
    try {
      await api.delete(`/restaurants/${id}`);
      fetchRestaurants();
    } catch (error) {
      alert('Не удалось удалить ресторан.');
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
          Управление ресторанами
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpen()}>
          Добавить ресторан
        </Button>
      </Box>

      <TableContainer component={Paper} elevation={2}>
        <Table>
          <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold', width: '80px' }}>Фото</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Название</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Менеджер</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Статус</TableCell>
              <TableCell align="right" sx={{ fontWeight: 'bold' }}>Действия</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {restaurants.map((rest) => (
              <TableRow key={rest.id} hover sx={{ opacity: rest.visible ? 1 : 0.6 }}>
                <TableCell>
                  <Avatar variant="rounded" src={rest.imageUrl} sx={{ width: 50, height: 50, bgcolor: '#e0e0e0' }}>
                    {rest.name.charAt(0)}
                  </Avatar>
                </TableCell>
                <TableCell sx={{ fontWeight: 'medium' }}>{rest.name}</TableCell>
                <TableCell>
                  {rest.manager ? (
                    <Typography variant="body2">{rest.manager.firstName} {rest.manager.lastName}</Typography>
                  ) : (
                    <Typography variant="body2" color="text.disabled">Не назначен</Typography>
                  )}
                </TableCell>
                <TableCell>
                  <Chip label={rest.visible ? "Активен" : "Скрыт"} color={rest.visible ? "success" : "default"} size="small" />
                </TableCell>
                <TableCell align="right">
                  <IconButton color="primary" onClick={() => handleOpen(rest)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton color="error" onClick={() => handleDelete(rest.id)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold' }}>
          {editingId ? 'Редактировать ресторан' : 'Новый ресторан'}
        </DialogTitle>
        <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          <TextField
            label="Название ресторана"
            fullWidth
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          <TextField
            label="Описание"
            fullWidth
            multiline
            rows={3}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
          <TextField
            label="URL картинки"
            fullWidth
            value={formData.imageUrl}
            onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
          />

          <FormControl fullWidth>
            <Typography variant="body2" sx={{ mb: 1, color: 'text.secondary' }}>
                Назначить менеджера
            </Typography>
            <Select
                value={formData.managerId ?? ''}
                onChange={(e) => setFormData({ ...formData, managerId: e.target.value ? Number(e.target.value) : null })}
                displayEmpty
            >
                <MenuItem value=""><em>Не назначен</em></MenuItem>
                {managers.map((m) => (
                  <MenuItem key={m.id} value={m.id}>
                      {m.firstName} {m.lastName} ({m.email})
                  </MenuItem>
                ))}
            </Select>
          </FormControl>

          <FormControlLabel
            control={<Switch checked={formData.visible} onChange={(e) => setFormData({ ...formData, visible: e.target.checked })} color="success" />}
            label={formData.visible ? "Показывать в каталоге" : "Скрыт (Черновик)"}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleClose} color="inherit">Отмена</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">Сохранить</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};