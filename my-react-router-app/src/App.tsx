//  ─── src/App.tsx ───────────────────────────────────────────────
import React from 'react';
import Header from './components/Header';

import {
  Link,
  Outlet,
  ScrollRestoration,
  isRouteErrorResponse, // Needed for ErrorBoundary
  useRouteError, // Hook to get error info within ErrorBoundary component defined below
  Route, // Import Route to define routes
} from 'react-router-dom';

// Error Boundary Component - defined in the same file
// This component catches rendering errors in child components, including route errors.
export function AppErrorBoundary() {
  const error = useRouteError();
  let title = 'Oops!', details = 'Unexpected error.';
  if (isRouteErrorResponse(error)) {
    title   = error.status === 404 ? 'Page Not Found (404)' : `Error ${error.status}`;
    details = error.statusText || (error.data as any)?.message || details;
  } else if (error instanceof Error) {
    details = error.message;
  }
  return (
    <div className="p-6 text-center">
      <h1 className="text-2xl font-bold text-red-600 mb-2">{title}</h1>
      <p className="text-gray-700 mb-4">{details}</p>
      <Link to="/" className="text-blue-600 underline">Go home</Link>
    </div>
  );
}

/* --------------------------- Layout --------------------------- */
export default function App() {
  return (
    <div className="flex flex-col min-h-screen">
        <Header />
      {/* Main content area - Outlet renders the matched route component */}
      <main className="flex-grow p-6">
        <Outlet />
      </main>

      <ScrollRestoration />
      
      <footer className="p-4 text-center text-sm text-gray-500 border-t">
        © 2025 [Placeholder]. All rights reserved.
      </footer>
    </div>
  );
}