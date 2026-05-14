import { AppBar, Toolbar, Typography, Button, Box, Badge, IconButton } from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const Navbar = () => {
  // Достаем юзера прямо из контекста
  const { isAuthenticated, role, logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <AppBar position="static" sx={{ backgroundColor: '#1976d2' }}>
      <Toolbar>
        {/* ЛОГОТИП */}
        <Typography
          variant="h6"
          component={Link}
          to="/"
          sx={{ 
            textDecoration: 'none', 
            color: 'inherit', 
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            mr: 2 
          }}
        >
          Food Delivery 🍔
        </Typography>

        {/* ИМЯ ПОЛЬЗОВАТЕЛЯ (Кликабельное, ведет в профиль) */}
        {isAuthenticated && user && (
          <Button
            component={Link}
            to="/profile"
            color="inherit"
            startIcon={<AccountCircleIcon />}
            sx={{ 
              textTransform: 'none', 
              fontSize: '1rem', 
              fontWeight: 500,
              mr: 'auto', // Толкает остальные элементы вправо
              '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.1)' }
            }}
          >
            {user.firstName} {user.lastName}
          </Button>
        )}

        {/* Если не авторизован, просто занимаем пространство */}
        {!isAuthenticated && <Box sx={{ flexGrow: 1 }} />}

        {/* БЛОК КНОПОК СПРАВА */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          
          {/* ROLE_USER */}
          {isAuthenticated && role === 'ROLE_USER' && (
            <>
              <Button color="inherit" component={Link} to="/orders">Мои заказы</Button>
              <IconButton color="inherit" component={Link} to="/cart">
                <Badge badgeContent={0} color="error">
                  <ShoppingCartIcon />
                </Badge>
              </IconButton>
            </>
          )}

          {/* ROLE_MANAGER */}
          {isAuthenticated && role === 'ROLE_MANAGER' && (
            <Button color="inherit" component={Link} to="/manager">Панель менеджера</Button>
          )}

          {/* ROLE_ADMIN */}
          {isAuthenticated && role === 'ROLE_ADMIN' && (
            <Button color="inherit" component={Link} to="/admin">Админ панель</Button>
          )}

          {/* ВХОД / ВЫХОД */}
          {!isAuthenticated ? (
            <>
              <Button color="inherit" component={Link} to="/login">Вход</Button>
              <Button 
                variant="contained" 
                component={Link} 
                to="/register" 
                sx={{ 
                  bgcolor: 'white', 
                  color: 'primary.main',
                  fontWeight: 'bold',
                  '&:hover': { bgcolor: '#e3f2fd' }
                }}
              >
                Регистрация
              </Button>
            </>
          ) : (
            <Button 
              color="inherit" 
              onClick={handleLogout}
              sx={{ ml: 1, border: '1px solid rgba(255,255,255,0.5)' }}
            >
              Выйти
            </Button>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};