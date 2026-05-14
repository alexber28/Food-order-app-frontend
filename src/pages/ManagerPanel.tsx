import { useState, useEffect } from 'react';
import { Box, Tabs, Tab, Typography, Paper, CircularProgress, Alert } from '@mui/material';
import StorefrontIcon from '@mui/icons-material/Storefront';
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import { api } from '../api/axiosConfig';

// Импортируем компоненты, которые создадим ниже
import { ManagerRestaurantInfo } from './ManagerRestaurantInfo';
import { ManagerDishes } from './ManagerDishes';
import { ManagerOrders } from './ManagerOrders';

export const ManagerPanel = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [restaurant, setRestaurant] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMyRestaurant = async () => {
      try {
        const res = await api.get('/restaurants/my');
        setRestaurant(res.data);
      } catch (err: any) {
        // Защита: если с бэкенда прилетел JSON-объект, берем из него .message,
        // иначе берем текст, иначе дефолтную строку.
        const errorMessage = typeof err.response?.data === 'string' 
          ? err.response.data 
          : err.response?.data?.message || 'У вас еще нет привязанного ресторана!';
          
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };
    fetchMyRestaurant(); 
  }, []);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  if (loading) return <CircularProgress sx={{ display: 'block', mx: 'auto', mt: 5 }} />;
  if (error) return <Alert severity="error" sx={{ m: 4 }}>{error}</Alert>;

  return (
    <Box sx={{ px: { xs: 2, md: 4 }, mt: 4, mb: 4 }}>
      <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
        Личный кабинет: {restaurant?.name}
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Управление меню и заказами вашего заведения
      </Typography>

      <Paper elevation={3} sx={{ display: 'flex', minHeight: '70vh', borderRadius: 3, overflow: 'hidden' }}>
        <Box sx={{ borderRight: 1, borderColor: 'divider', bgcolor: '#f8f9fa', minWidth: 260 }}>
          <Tabs
            orientation="vertical"
            value={activeTab}
            onChange={handleTabChange}
            sx={{ 
              '& .MuiTab-root': { alignItems: 'flex-start', textAlign: 'left', p: 3, textTransform: 'none' },
              '& .Mui-selected': { bgcolor: 'rgba(25, 118, 210, 0.08)', fontWeight: 'bold' }
            }}
          >
            <Tab icon={<StorefrontIcon sx={{ mr: 2 }} />} iconPosition="start" label="Профиль ресторана" />
            <Tab icon={<RestaurantMenuIcon sx={{ mr: 2 }} />} iconPosition="start" label="Меню (блюда)" />
            <Tab icon={<ReceiptLongIcon sx={{ mr: 2 }} />} iconPosition="start" label="Заказы" />
          </Tabs>
        </Box>

        <Box sx={{ flexGrow: 1, p: 4, bgcolor: 'white' }}>
          {activeTab === 0 && <ManagerRestaurantInfo restaurant={restaurant} setRestaurant={setRestaurant} />}
          {activeTab === 1 && <ManagerDishes restaurantId={restaurant.id} />}
          {activeTab === 2 && <ManagerOrders restaurantId={restaurant.id} />}
        </Box>
      </Paper>
    </Box>
  );
};