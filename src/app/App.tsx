import { useState } from 'react';
import { useAppDispatch } from '../store/store';
import { chatsReset } from '../store/chatsSlice';
import { Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from '../pages/LoginPage';
import { ChatsPage } from '../pages/ChatsPage/';
import { clearData, loadData, saveData } from '../utils/storage';
import { ProtectedRoute } from '../components/ProtectedRoute/ProtectedRoute';
import type { UserData } from '../api/types';
import './App.css';


function App() {
  const dispatch = useAppDispatch();
  const [userData, setUserData] = useState<UserData | null>(() =>
    loadData<UserData>()
  );

  const handleLogin = (data: UserData) => {
    saveData(data);
    setUserData(data);
  };

  const handleLogout = () => {
    clearData();
    dispatch(chatsReset());
    setUserData(null);
  };

  return (
    <Routes>
      <Route
        path="/login"
        element={
          userData ? (
            <Navigate to="/chat" replace />
          ) : (
            <LoginPage onLogin={handleLogin} />
          )
        }
      />
      <Route
        path="/chat"
        element={
          <ProtectedRoute isAuthenticated={userData !== null}>
            {userData && <ChatsPage userData={userData} onLogout={handleLogout} />}
          </ProtectedRoute>
        }
      />
      <Route
        path="*"
        element={<Navigate to={userData ? '/chat' : '/login'} replace />}
      />
    </Routes>
  );
}

export default App;
