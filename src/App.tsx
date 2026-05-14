import { Routes, Route } from 'react-router-dom';
import { Container, Box } from '@mui/material';
import { Navbar } from './components/Navbar';
import { Login } from './pages/Login';
import { Home } from './pages/Home';
import { RestaurantPage } from './pages/RestaurantPage';
import { Cart } from './pages/Cart';
import { Orders } from './pages/Orders';
import { Register } from './pages/Register';
import { Profile } from './pages/Profile';
import { AdminPanel } from './pages/AdminPanel';
import { ManagerPanel } from './pages/ManagerPanel';

function App() {

  const StandardLayout = ({ children }: { children: React.ReactNode }) => (
  <Container maxWidth="lg" sx={{ mt: 4 }}>
    {children}
  </Container>
  );

  return (
    <>
      {/* Навигация теперь всегда висит сверху */}
      <Navbar /> 
      
      {/* Контейнер для содержимого страниц с отступом сверху (mt: 4) */}
      <Box sx={{ pb: 5 }}>
        <Routes>

          {/* --- СТАНДАРТНЫЕ СТРАНИЦЫ (Обернуты в StandardLayout) --- */}
          <Route path="/restaurant/:id" element={<StandardLayout><RestaurantPage /></StandardLayout>} />
          <Route path="/" element={<StandardLayout><Home /></StandardLayout>} />
          <Route path="/login" element={<StandardLayout><Login /></StandardLayout>} />
          <Route path="/register" element={<StandardLayout><Register /></StandardLayout>} />
          <Route path="/profile" element={<StandardLayout><Profile /></StandardLayout>} />
          <Route path="/cart" element={<StandardLayout><Cart /></StandardLayout>} />
          <Route path="/orders" element={<StandardLayout><Orders /></StandardLayout>} />
          
          {/* --- ШИРОКИЕ СТРАНИЦЫ (Без обертки, тянутся на весь экран!) --- */}
          <Route path="/admin" element={<AdminPanel />} />
          <Route path="/manager" element={<ManagerPanel />} /> 
        </Routes>
      </Box>
    </>
  );
}

export default App;