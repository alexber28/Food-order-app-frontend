import { useEffect, useState } from 'react';
import { Container, Typography, Paper, TextField, Button, Box, Divider, Alert, CircularProgress } from '@mui/material';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import { api } from '../api/axiosConfig';
import { useAuth } from '../context/AuthContext'; // Импортируем наш контекст

export const Profile = () => {
    // Берем юзера и функцию обновления из контекста
    const { user, updateUser } = useAuth(); 
    
    const [formData, setFormData] = useState<any>(null);
    const [passwords, setPasswords] = useState({ oldPassword: '', newPassword: '' });
    const [message, setMessage] = useState({ text: '', type: 'success' as 'success' | 'error' });

    // Синхронизируем локальную форму с глобальным юзером, когда он подгружается
    useEffect(() => {
        if (user) {
            setFormData(user);
        }
    }, [user]);

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await api.put('/users/update', formData);
            updateUser(response.data); // МГНОВЕННО обновляем глобальный стейт (и Navbar)
            setMessage({ text: 'Профиль успешно обновлен!', type: 'success' });
        } catch (err) {
            setMessage({ text: 'Ошибка при обновлении', type: 'error' });
        }
    };

    const handleChangePassword = async () => {
        try {
            await api.put('/users/change-password', passwords);
            setMessage({ text: 'Пароль успешно изменен!', type: 'success' });
            setPasswords({ oldPassword: '', newPassword: '' }); // Очищаем поля
        } catch (err: any) {
            setMessage({ text: err.response?.data || 'Ошибка смены пароля', type: 'error' });
        }
    };

    const handleTopUp = async () => {
        try {
            const response = await api.post('/users/topup', { amount: 100 });
            updateUser({ ...formData, balance: response.data.balance }); // Обновляем баланс везде
            setMessage({ text: 'Баланс пополнен на 100$!', type: 'success' });
        } catch (err) {
            setMessage({ text: 'Ошибка пополнения', type: 'error' });
        }
    };

    // Пока контекст грузит данные, показываем крутилку
    if (!formData) return <CircularProgress sx={{ display: 'block', m: '50px auto' }} />;

    return (
        <Container maxWidth="sm" sx={{ mt: 4, mb: 8 }}>
            <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
                <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>Мой профиль</Typography>
                
                {message.text && <Alert severity={message.type} sx={{ mb: 2 }}>{message.text}</Alert>}

                <Box component="form" onSubmit={handleUpdate} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                    <TextField label="Email" value={formData.email} disabled fullWidth />
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <TextField 
                            label="Имя" 
                            value={formData.firstName} 
                            onChange={(e) => setFormData({...formData, firstName: e.target.value})} 
                            fullWidth 
                        />
                        <TextField 
                            label="Фамилия" 
                            value={formData.lastName} 
                            onChange={(e) => setFormData({...formData, lastName: e.target.value})} 
                            fullWidth 
                        />
                    </Box>
                    <TextField 
                        label="Телефон" 
                        value={formData.phoneNumber} 
                        onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})} 
                        fullWidth 
                    />
                    
                    <Button type="submit" variant="contained" size="large">Сохранить изменения</Button>
                </Box>

                <Divider sx={{ my: 4 }} />

                {/* БЛОК СМЕНЫ ПАРОЛЯ */}
                <Typography variant="h6" gutterBottom>Смена пароля</Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <TextField 
                        type="password" 
                        label="Старый пароль" 
                        value={passwords.oldPassword}
                        onChange={(e) => setPasswords({...passwords, oldPassword: e.target.value})}
                    />
                    <TextField 
                        type="password" 
                        label="Новый пароль" 
                        value={passwords.newPassword}
                        onChange={(e) => setPasswords({...passwords, newPassword: e.target.value})}
                    />
                    <Button variant="outlined" color="warning" onClick={handleChangePassword}>
                        Обновить пароль
                    </Button>
                </Box>

                <Divider sx={{ my: 4 }} />

                {/* БЛОК БАЛАНСА */}
                <Box sx={{ p: 3, bgcolor: '#f8f9fa', borderRadius: 2, textAlign: 'center' }}>
                    <Typography color="text.secondary" variant="subtitle2">Текущий баланс</Typography>
                    <Typography variant="h3" sx={{ my: 1, fontWeight: 'bold', color: 'success.main' }}>
                        {formData.balance} $
                    </Typography>
                    <Button 
                        variant="outlined" 
                        color="success" 
                        startIcon={<AccountBalanceWalletIcon />}
                        onClick={handleTopUp}
                    >
                        Пополнить на 100$
                    </Button>
                </Box>
            </Paper>
        </Container>
    );
};