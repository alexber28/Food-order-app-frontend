import { useState } from 'react';
import {  Box, Tabs, Tab, Typography, Paper } from '@mui/material';
import StorefrontIcon from '@mui/icons-material/Storefront';
import PeopleIcon from '@mui/icons-material/People';
import ReceiptIcon from '@mui/icons-material/Receipt';

// Заглушки для наших будущих компонентов
import { AdminRestaurants } from './AdminRestaurants'; 
import { AdminUsers } from './AdminUsers'; 
import { AdminOrders } from './AdminOrders'; 

export const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  return (
    <Box sx={{ px: { xs: 2, md: 4 }, mt: 4, mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 3 }}>
            Панель Администратора
        </Typography>

        <Paper elevation={3} sx={{ display: 'flex', minHeight: '70vh', borderRadius: 3, overflow: 'hidden' }}>
        
        {/* ЛЕВОЕ МЕНЮ (Sidebar) */}
        <Box sx={{ borderRight: 1, borderColor: 'divider', bgcolor: '#f8f9fa', minWidth: 250 }}>
          <Tabs
            orientation="vertical"
            variant="scrollable"
            value={activeTab}
            onChange={handleTabChange}
            sx={{ 
              '& .MuiTab-root': { alignItems: 'flex-start', textAlign: 'left', p: 3, fontSize: '1rem' },
              '& .Mui-selected': { bgcolor: 'rgba(25, 118, 210, 0.08)', fontWeight: 'bold' }
            }}
          >
            <Tab icon={<StorefrontIcon sx={{ mr: 2 }} />} iconPosition="start" label="Рестораны" />
            <Tab icon={<PeopleIcon sx={{ mr: 2 }} />} iconPosition="start" label="Учетные записи" />
            <Tab icon={<ReceiptIcon sx={{ mr: 2 }} />} iconPosition="start" label="Заказы сервиса" />
          </Tabs>
        </Box>

        {/* ПРАВАЯ ЧАСТЬ (Контент) */}
        <Box sx={{ flexGrow: 1, p: 4, bgcolor: 'white' }}>
          {activeTab === 0 && <AdminRestaurants />}
          {activeTab === 1 && <AdminUsers />}
          {activeTab === 2 && <AdminOrders />}
        </Box>

      </Paper>
    </Box>
  );
};