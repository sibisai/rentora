// app/App.tsx
import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import Home from '../app/routes/home';
import Login from '../app/routes/login';

export default function App() {
  return (
    <div className="p-6">
      <nav className="mb-4">
        <Link to="/" className="mr-4 text-blue-500">Home</Link>
        <Link to="/about" className="text-blue-500">About</Link>
      </nav>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<h1>test2</h1>} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </div>
  );
}
