import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { usuarioAtual } from '../api/resources';
import type { Usuario } from '../api/types';

interface AuthContextValue {
  token: string | null;
  usuario: Usuario | null;
  isAuthenticated: boolean;
  carregandoUsuario: boolean;
  entrar: (token: string) => void;
  sair: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const STORAGE_KEY = 'taskflow.token';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(STORAGE_KEY));
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [carregandoUsuario, setCarregandoUsuario] = useState(false);

  useEffect(() => {
    if (!token) {
      setUsuario(null);
      return;
    }

    setCarregandoUsuario(true);
    usuarioAtual()
      .then(setUsuario)
      .catch(() => setUsuario(null))
      .finally(() => setCarregandoUsuario(false));
  }, [token]);

  const entrar = (novoToken: string) => {
    localStorage.setItem(STORAGE_KEY, novoToken);
    setToken(novoToken);
  };

  const sair = () => {
    localStorage.removeItem(STORAGE_KEY);
    setToken(null);
  };

  const value = useMemo(
    () => ({ token, usuario, isAuthenticated: Boolean(token), carregandoUsuario, entrar, sair }),
    [token, usuario, carregandoUsuario],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}
