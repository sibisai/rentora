import React from 'react';
import ReactDOM from 'react-dom/client';
import {
  createBrowserRouter,
  Navigate,
  RouterProvider,
  useLocation,
} from 'react-router-dom';
import { AuthProvider, useAuth } from './features/auth/AuthContext';
import App, { AppErrorBoundary } from './App';

// Import your page components from their feature folders
import HomePage from './features/home/HomePage';
import LoginPage from './features/auth/LoginPage';
import HostPage from './features/host/HostPage';
import SearchPage from './features/search/SearchPage';
import AccountPage from './features/account/AccountPage';
import CartPage from './features/cart/CartPage';
import PropertyDetailsPage from './features/property/pages/PropertyDetailsPage';
import PropertyListPage from './features/property/pages/PropertyListPage';
import EditPropertyPage    from './features/property/pages/EditPropertyPage';
import CreatePropertyPage  from './features/property/pages/CreatePropertyPage';
import NotFoundPage from './pages/NotFoundPage';
import ContactPage from './features/contact/ContactPage';
import ServicesPage from './features/services/ServicesPage';
import ConfirmPage from './features/cart/ConfirmPage';

import './styles/index.css';

/* ---------- simple auth‑guard ---------- */
function RequireAuth({ children }: { children: JSX.Element }) {
  const { user, loading } = useAuth();
  const location = useLocation()

  if (loading) return <p>Loading…</p>
  if (!user) {
    // send them to /login and remember where they came from
    return <Navigate to="/login" state={{ from: location }} replace />
  }
  return children
}

// Define the application routes using the createBrowserRouter API
const router = createBrowserRouter([
  {
    // Root route: Uses App component for layout
    path: "/",
    element: <App />,
    // Sets the error boundary for the root layout and all child routes
    errorElement: <AppErrorBoundary />,
    // Child routes that will render inside App's <Outlet />
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
        element: <RequireAuth><PropertyListPage /></RequireAuth>
      },
      {
        path: 'host/properties/new',
        element: <RequireAuth><CreatePropertyPage /></RequireAuth>,
      },
      {
        path: 'host/properties/:id/edit',
        element: <RequireAuth><EditPropertyPage /></RequireAuth>,
      },
      {
        path: "search",
        element: <SearchPage />,
      },
      // {
      //   path: "account",
      //   element: <RequireAuth><AccountPage /></RequireAuth>,
      // },
      {
        path: "cart",
        element: <RequireAuth><CartPage /></RequireAuth>,
      },
      {
        path: "properties/:id",
        element: <PropertyDetailsPage />,
      },
      // Add a catch-all route for 404 pages
      {
        path: "*",
        element: <NotFoundPage />,
      },
      {
        path: "/contact",
        element: <ContactPage />
      },
      {
        path: "/services",
        element: <ServicesPage />
      },
      {
        path: "confirm",
        element: <ConfirmPage />,
      }
      
    ],
  },
]);

// Render the application using the RouterProvider
const rootElement = document.getElementById('root');
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </React.StrictMode>
  );
} else {
  console.error("Failed to find the root element");
}