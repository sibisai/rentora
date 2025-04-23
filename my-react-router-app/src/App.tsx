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
  const error = useRouteError(); // Hook to access the error
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    // Handles errors thrown by react-router loaders/actions or 404s
    message = error.status === 404 ? "Page Not Found (404)" : `Error ${error.status}`;
    details = error.statusText || (error.data as any)?.message || details; // Try to get more specific message
  } else if (error instanceof Error) {
    // Handles standard JavaScript errors
    details = error.message;
    // Show stack trace only in development for debugging
    if (import.meta.env.DEV) {
       stack = error.stack;
    }
  }

  return (
    <div className="p-6 text-center">
      <h1 className="text-2xl font-bold text-red-600 mb-2">{message}</h1>
      <p className="text-gray-700 mb-4">{details}</p>
      {stack && (
        <pre className="w-full max-w-2xl mx-auto p-4 overflow-x-auto bg-red-100 text-red-800 rounded text-left text-sm">
          <code>{stack}</code>
        </pre>
      )}
      <Link to="/" className="text-blue-600 hover:underline mt-4 inline-block">Go back home</Link>
    </div>
  );
}


// Main Application Component - provides layout and renders routes via Outlet
export default function App() {
  return (
    <div className="flex flex-col min-h-screen">
        <Header />
      {/* Main content area - Outlet renders the matched route component */}
      <main className="flex-grow p-6">
         {/* Note: The ErrorBoundary component itself is usually configured as
             part of the route definition (using the `errorElement` prop on Route)
             rather than wrapping the Outlet directly here for route-level errors.
             However, wrapping Outlet can catch general rendering errors within pages.
             For route-specific errors (loaders, 404s), configure `errorElement`
             when defining your routes (likely in main.tsx or routes/index.ts).
          */}
         <Outlet />
      </main>

      {/* Manages scroll position on navigation */}
      <ScrollRestoration />

            {/* Footer */}
      <footer className="search-page-footer">
        <p>© 2025 [Placeholder]. All rights reserved.</p>
        <div className="footer-links">
          <a href="#" className="footer-link">Privacy Policy</a>
          <a href="#" className="footer-link">Terms of Service</a>
          <a href="#" className="footer-link">Contact Us</a>
        </div>
      </footer>

    </div>
  );
}

