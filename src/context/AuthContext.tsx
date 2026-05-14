import { createContext, useState, useEffect, useContext, type ReactNode } from 'react';
import { jwtDecode } from 'jwt-decode';
import { api } from '../api/axiosConfig'; // Наш настроенный axios

// Описываем, что именно будет храниться в нашем глобальном "мозге"
interface AuthContextType {
  isAuthenticated: boolean;
  role: string | null;
  user: any | null; // <-- Хранилище для профиля
  login: (token: string) => void;
  logout: () => void;
  updateUser: (userData: any) => void; // <-- Функция для мгновенного обновления
}

// Создаем сам контекст
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Провайдер — это обертка, которая будет делиться данными со всем приложением
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [role, setRole] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null); // <-- Стейт юзера

  // 1. При первом запуске приложения проверяем, есть ли уже токен в памяти
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      login(token); // Если токен есть, авторизуем его
    }
  }, []);

  // 2. Слушаем авторизацию: как только юзер залогинился, подтягиваем его профиль
  useEffect(() => {
    if (isAuthenticated) {
      api.get('/users/me')
        .then(res => setUser(res.data))
        .catch(err => {
          console.error("Ошибка загрузки профиля в контексте", err);
          // Если сервер вернул 401/403 (токен протух), можно принудительно разлогинить:
          // logout(); 
        });
    }
  }, [isAuthenticated]);

  const login = (token: string) => {
    localStorage.setItem('token', token); // Сохраняем паспорт в сейф браузера
    try {
      // Расшифровываем токен (jwtDecode умеет читать среднюю часть JWT без секретного ключа)
      const decoded: any = jwtDecode(token);
      
      // Достаем роль (Spring Security обычно кладет её в поле role, roles или authorities)
      const userRole = decoded.role || decoded.roles?.[0] || 'ROLE_USER';
      
      setRole(userRole);
      setIsAuthenticated(true);
    } catch (error) {
      console.error("Ошибка расшифровки токена", error);
      logout(); // Если токен кривой (хакер подменил), выкидываем юзера
    }
  };

  const logout = () => {
    localStorage.removeItem('token'); // Сжигаем паспорт
    setRole(null);
    setUser(null); // <-- Обязательно очищаем юзера при выходе
    setIsAuthenticated(false);
  };

  const updateUser = (userData: any) => {
    setUser(userData); // <-- Эта функция будет вызываться из Profile.tsx
  };

  return (
    // Не забываем прокинуть новые поля в value!
    <AuthContext.Provider value={{ isAuthenticated, role, user, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

// Маленький кастомный хук, чтобы нам было удобно доставать данные в других файлах
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth должен использоваться внутри AuthProvider');
  }
  return context;
};