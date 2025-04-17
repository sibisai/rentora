//  ─── src/App.tsx ───────────────────────────────────────────────
import React from 'react';
import { Outlet, ScrollRestoration, Link, isRouteErrorResponse, useRouteError } from 'react-router-dom';

// *** adjust the import to wherever NavBar actually lives ***
import NavBar from './layout/NavBar';      

/* ------------ Error boundary (you removed it by mistake) ------------ */
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
      <NavBar />   {/* <‑‑ was “</NavBar>” before – that broke JSX */}

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