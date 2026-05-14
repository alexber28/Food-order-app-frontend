import { useState, useEffect } from 'react';
import { 
  Typography, Box, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, 
  Paper, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Switch, 
  FormControlLabel, Avatar, Grid
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { api } from '../api/axiosConfig';

interface Dish {
  id: number;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  sectionName: string;
  visible: boolean;
}

export const ManagerDishes = ({ restaurantId }: { restaurantId: number }) => {
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingDish, setEditingDish] = useState<Dish | null>(null);
  const [formData, setFormData] = useState({
    name: '', description: '', price: 0, imageUrl: '', sectionName: 'Основное меню', visible: true
  });

  const fetchDishes = async () => {
    const res = await api.get(`/dishes/restaurant/${restaurantId}`);
    setDishes(res.data);
  };

  useEffect(() => { fetchDishes(); }, []);

  const handleOpen = (dish?: Dish) => {
    if (dish) {
      setEditingDish(dish);
      setFormData({ ...dish });
    } else {
      setEditingDish(null);
      setFormData({ name: '', description: '', price: 0, imageUrl: '', sectionName: 'Основное меню', visible: true });
    }
    setOpenDialog(true);
  };

  const handleSubmit = async () => {
    try {
      if (editingDish) {
        await api.put(`/dishes/${editingDish.id}`, formData);
      } else {
        await api.post(`/dishes/add/${restaurantId}`, formData);
      }
      setOpenDialog(false);
      fetchDishes();
    } catch (err) { alert('Ошибка при сохранении блюда'); }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Удалить блюдо?')) return;
    await api.delete(`/dishes/${id}`);
    fetchDishes();
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Управление меню</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpen()}>Добавить блюдо</Button>
      </Box>

      <TableContainer component={Paper} elevation={2}>
        <Table>
          <TableHead sx={{ bgcolor: '#f5f5f5' }}>
            <TableRow>
              <TableCell>Фото</TableCell>
              <TableCell>Название</TableCell>
              <TableCell>Категория</TableCell>
              <TableCell>Цена</TableCell>
              <TableCell>Статус</TableCell>
              <TableCell align="right">Действия</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {dishes.map((dish) => (
              <TableRow key={dish.id} hover sx={{ opacity: dish.visible ? 1 : 0.5 }}>
                <TableCell>
                  <Avatar variant="rounded" src={dish.imageUrl} sx={{ width: 50, height: 50 }} />
                </TableCell>
                <TableCell sx={{ fontWeight: 'medium' }}>{dish.name}</TableCell>
                <TableCell>{dish.sectionName}</TableCell>
                <TableCell>{dish.price} $</TableCell>
                <TableCell>{dish.visible ? 'Активно' : 'Скрыто'}</TableCell>
                <TableCell align="right">
                  <IconButton color="primary" onClick={() => handleOpen(dish)}><EditIcon /></IconButton>
                  <IconButton color="error" onClick={() => handleDelete(dish.id)}><DeleteIcon /></IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold' }}>{editingDish ? 'Редактировать блюдо' : 'Новое блюдо'}</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid size={{ xs: 12 }}>
              <TextField label="Название блюда" fullWidth value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField label="Описание" fullWidth multiline rows={2} value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} />
            </Grid>
            <Grid size={{ xs: 6 }}>
              <TextField label="Цена ($)" type="number" fullWidth value={formData.price} onChange={(e) => setFormData({...formData, price: Number(e.target.value)})} />
            </Grid>
            <Grid size={{ xs: 6 }}>
              <TextField label="Категория" fullWidth value={formData.sectionName} onChange={(e) => setFormData({...formData, sectionName: e.target.value})} />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField label="URL изображения" fullWidth value={formData.imageUrl} onChange={(e) => setFormData({...formData, imageUrl: e.target.value})} />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <FormControlLabel 
                control={<Switch checked={formData.visible} onChange={(e) => setFormData({...formData, visible: e.target.checked})} color="success" />} 
                label={formData.visible ? "Показывать в меню" : "Скрыть блюдо (нет в наличии)"} 
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setOpenDialog(false)}>Отмена</Button>
          <Button variant="contained" onClick={handleSubmit}>Сохранить</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};