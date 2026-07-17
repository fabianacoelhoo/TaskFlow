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
import { EmpresaPage } from './pages/EmpresaPage';
import { BacklogPage } from './pages/BacklogPage';
import { SprintPage } from './pages/SprintPage';

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
        <Route path="/projetos/:id/backlog" element={<BacklogPage />} />
        <Route path="/projetos/:id/sprints/:sprintId" element={<SprintPage />} />
        <Route path="/calendario" element={<CalendarioPage />} />
        <Route path="/perfil" element={<PerfilPage />} />
        <Route path="/empresa" element={<EmpresaPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
