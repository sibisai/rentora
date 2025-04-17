import axios from 'axios';
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  type PropsWithChildren,
} from 'react';

/* ---------- types ---------- */

export type Role = 'guest' | 'host' | 'admin';

export interface User {
  id:    string;
  email: string;
  role:  Role;
}

interface AuthContextValue {
  user:    User | null;
  token:   string | null;
  loading: boolean;
  login:   (token: string, user: User) => void;
  logout:  () => void;
}

/* ---------- context ---------- */

const AuthContext = createContext<AuthContextValue>({
  user:    null,
  token:   null,
  loading: true,
  login:   () => {},
  logout:  () => {},
});

export const AuthProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const [user,  setUser]  = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  /* restore session */
  useEffect(() => {
    const stored = localStorage.getItem('auth');
    if (stored) {
      const { token: t, user: u } = JSON.parse(stored) as {
        token: string;
        user:  User;
      };
      setToken(t);
      setUser(u);
      axios.defaults.headers.common.Authorization = `Bearer ${t}`;
    }
    setLoading(false);
  }, []);

  /* helpers */
  const login = (t: string, u: User) => {
    setToken(t);
    setUser(u);
    localStorage.setItem('auth', JSON.stringify({ token: t, user: u }));
    axios.defaults.headers.common.Authorization = `Bearer ${t}`;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('auth');
    delete axios.defaults.headers.common.Authorization;
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);