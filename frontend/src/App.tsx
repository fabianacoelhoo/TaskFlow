import { Navigate, Route, Routes } from 'react-router-dom';
import { AppLayout } from './layouts/AppLayout';
import { ProtectedRoute } from './auth/ProtectedRoute';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { ProjetosPage } from './pages/ProjetosPage';
import { KanbanPage } from './pages/KanbanPage';
import { CalendarioPage } from './pages/CalendarioPage';
import { PerfilPage } from './pages/PerfilPage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />

      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/projetos" element={<ProjetosPage />} />
        <Route path="/projetos/:id" element={<KanbanPage />} />
        <Route path="/calendario" element={<CalendarioPage />} />
        <Route path="/perfil" element={<PerfilPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
