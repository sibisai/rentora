export interface AuthResponse {
  message: string;
  token: string;
  userId: string;
  email: string;
}

const API = import.meta.env.local.VITE_API_URL

export const login = async (email: string, password: string): Promise<AuthResponse> => {
  const response = await fetch(`${API}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Login failed');
  }
  return data;
};

export const signup = async (email: string, password: string): Promise<AuthResponse> => {
  const response = await fetch('http://localhost:3001/auth/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Signup failed');
  }
  return data;
};