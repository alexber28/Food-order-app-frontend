import { useState, useEffect } from 'react';
import { 
  Typography, Box, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Paper, Select, MenuItem, FormControl, Chip 
} from '@mui/material';
import { api } from '../api/axiosConfig';

interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  role: string;
}

export const AdminUsers = () => {
  const [users, setUsers] = useState<User[]>([]);

  const fetchUsers = async () => {
    try {
      const response = await api.get('/users/all');
      setUsers(response.data);
    } catch (error) {
      console.error('Ошибка загрузки пользователей', error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Функция для смены роли
  const handleRoleChange = async (userId: number, newRole: string) => {
    try {
      await api.put(`/users/${userId}/role`, { role: newRole });
      // Обновляем локальный стейт, чтобы не дергать бэкенд лишний раз
      setUsers(users.map(user => user.id === userId ? { ...user, role: newRole } : user));
    } catch (error) {
      console.error('Ошибка при смене роли', error);
      alert('Не удалось изменить роль');
    }
  };

  // Красивые цвета для ролей
  const getRoleColor = (role: string) => {
    switch (role) {
      case 'ROLE_ADMIN': return 'error'; // Красный
      case 'ROLE_MANAGER': return 'warning'; // Желтый
      case 'ROLE_USER': return 'success'; // Зеленый
      default: return 'default';
    }
  };

  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 3 }}>
        Учетные записи пользователей
      </Typography>

      <TableContainer component={Paper} elevation={2}>
        <Table>
          <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>ID</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Email</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Имя</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Телефон</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Текущая роль</TableCell>
              <TableCell align="right" sx={{ fontWeight: 'bold' }}>Изменить роль</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id} hover>
                <TableCell>{user.id}</TableCell>
                <TableCell sx={{ fontWeight: 'medium' }}>{user.email}</TableCell>
                <TableCell>{`${user.firstName || ''} ${user.lastName || ''}`}</TableCell>
                <TableCell>{user.phoneNumber || '—'}</TableCell>
                <TableCell>
                  <Chip 
                    label={user.role.replace('ROLE_', '')} 
                    color={getRoleColor(user.role) as any} 
                    size="small" 
                    sx={{ fontWeight: 'bold' }}
                  />
                </TableCell>
                <TableCell align="right">
                  <FormControl size="small" sx={{ minWidth: 150 }}>
                    <Select
                      value={user.role}
                      onChange={(e) => handleRoleChange(user.id, e.target.value)}
                      sx={{ bgcolor: 'white' }}
                    >
                      <MenuItem value="ROLE_USER">USER</MenuItem>
                      <MenuItem value="ROLE_MANAGER">MANAGER</MenuItem>
                      <MenuItem value="ROLE_ADMIN">ADMIN</MenuItem>
                    </Select>
                  </FormControl>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};