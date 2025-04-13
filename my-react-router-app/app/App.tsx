// app/App.tsx

import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';

// place holder:
function Home() {
  return <h2>Home Page</h2>;
}

function About() {
  return <h2>About Page</h2>;}

function App() {
  return (
    <div>
      <nav>
        <Link to="/">Helloooo</Link> | <Link to="/about">About</Link>
      </nav>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </div>
  );
}

export default App;
