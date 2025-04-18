import React from 'react';
import ReactDOM from 'react-dom/client';
import {
  createBrowserRouter,
  RouterProvider,
} from 'react-router-dom';

import App, { AppErrorBoundary } from './App';

// Import your page components from their feature folders
import HomePage from './features/home/HomePage';
import HostPage from './features/host/HostPage';
import LoginPage from './features/auth/LoginPage';
import SearchPage from './features/search/SearchPage';
import AccountPage from './features/account/AccountPage';
import CartPage from './features/cart/CartPage';
import PropertyDetailsPage from './features/property/PropertyDetailsPage';
import NotFoundPage from './pages/NotFoundPage';

import './styles/index.css';

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
        path: "host",
        element: <HostPage />,
      },
      {
        // Incase the property details page needs an ID parameter
        // Adjust path and component as needed
        path: "property-details/", // Example with URL param
        element: <PropertyDetailsPage />,
      },
      // {
      //   // Incase the property details page needs an ID parameter
      //   // Adjust path and component as needed
      //   path: "property-details/:propertyId", // Example with URL param
      //   element: <PropertyDetailsPage />,
      // },
      // Add a catch-all route for 404 pages
      {
        path: "*",
        element: <NotFoundPage />,
      },
    ],
  },
]);

// Render the application using the RouterProvider
const rootElement = document.getElementById('root');
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <RouterProvider router={router} />
    </React.StrictMode>
  );
} else {
  console.error("Failed to find the root element");
}