import React from 'react';
import ReactDOM from 'react-dom/client';
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from 'react-router-dom';

import { AuthProvider, useAuth } from './features/auth/AuthContext';
import App, { AppErrorBoundary } from './App';

/* ---------- pages ---------- */
import HomePage            from './features/home/HomePage';
import HostPage from './features/host/HostPage';
import LoginPage           from './features/auth/LoginPage';
import HostPage from './features/host/HostPage';
import SearchPage          from './features/search/SearchPage';
import AccountPage         from './features/account/AccountPage';
import CartPage            from './features/cart/CartPage';
import PropertyDetailsPage from './features/property/PropertyDetailsPage';

import PropertyListPage    from './features/property/pages/PropertyListPage';
import CreatePropertyPage  from './features/property/pages/CreatePropertyPage';
import EditPropertyPage    from './features/property/pages/EditPropertyPage';

import NotFoundPage        from './pages/NotFoundPage';
import './styles/index.css';

/* ---------- simple auth‑guard ---------- */
function RequireAuth({ children }: { children: JSX.Element }) {
  const { user, loading } = useAuth();
  if (loading) return <p>Loading…</p>;
  return user ? children : <Navigate to="/login" replace />;
}

/* ---------- router ---------- */
const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    errorElement: <AppErrorBoundary />,
    children: [
      {
        // Index route (renders at "/")
        index: true,
        element: <HomePage />,
      },
      {
        path: "login",
        element: <LoginPage />,
      },    
      {
        path: "host/properties",
        element: <HostPage />,
      },
      {
        path: "search",
        element: <SearchPage />,
      },
      {
        path: "account",
        element: <AccountPage />,
      },
      {
        path: "cart",
        element: <CartPage />,
      },
      {
        // Incase the property details page needs an ID parameter
        // Adjust path and component as needed
        path: "property-details/:propertyId",
        element: <PropertyDetailsPage />,
      },
      {
        path: 'host/properties/new',
        element: <RequireAuth><CreatePropertyPage /></RequireAuth>,
      },
      {
        path: 'host/properties/:id/edit',
        element: <RequireAuth><EditPropertyPage /></RequireAuth>,
      },

      /* public property details */
      { path: 'properties/:id', element: <PropertyDetailsPage /> },

      /* 404 */
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);

/* ---------- bootstrap ---------- */
const root = document.getElementById('root')!;
ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </React.StrictMode>,
);