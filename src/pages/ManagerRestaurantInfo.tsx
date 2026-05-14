import { useState } from 'react';
import { Typography, Box, Button, TextField, Grid, Paper, Alert } from '@mui/material';
import { api } from '../api/axiosConfig';

export const ManagerRestaurantInfo = ({ restaurant, setRestaurant }: { restaurant: any, setRestaurant: any }) => {
  const [formData, setFormData] = useState({
    name: restaurant.name || '',
    description: restaurant.description || '',
    imageUrl: restaurant.imageUrl || ''
  });
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.put(`/restaurants/${restaurant.id}`, formData);
      setRestaurant(res.data); // Обновляем глобальный стейт панели
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000); // Прячем алерт через 3 сек
    } catch (error) {
      alert('Ошибка при обновлении данных ресторана');
    }
  };

  return (
    <Box>
      <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3 }}>Профиль ресторана</Typography>
      
      {success && <Alert severity="success" sx={{ mb: 3 }}>Данные успешно обновлены!</Alert>}

      <Paper elevation={0} sx={{ p: 3, border: '1px solid #e0e0e0', borderRadius: 2 }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12 }}>
              <TextField
                label="Название ресторана"
                fullWidth
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                label="Описание"
                fullWidth
                multiline
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                label="URL обложки"
                fullWidth
                value={formData.imageUrl}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                helperText="Ссылка на изображение, которое увидят клиенты"
              />
            </Grid>

            {/* Предпросмотр картинки */}
            {formData.imageUrl && (
              <Grid size={{ xs: 12 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>Предпросмотр:</Typography>
                <Box
                  component="img"
                  src={formData.imageUrl}
                  alt="Предпросмотр"
                  sx={{ width: '100%', maxHeight: 200, objectFit: 'cover', borderRadius: 2 }}
                  onError={(e: any) => e.target.style.display = 'none'}
                />
              </Grid>
            )}

            <Grid size={{ xs: 12 }}>
              <Button type="submit" variant="contained" size="large">
                Сохранить изменения
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
};