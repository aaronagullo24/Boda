import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import GuestList from './components/GuestList';
import TablesView from './components/TablesView';
import SeatingView from './components/SeatingView';
import Navbar from './components/Navbar';

function App() {
  return (
    // He cambiado BrowserRouter por Router para que sea más corto, pero es opcional.
    // Lo importante son los cambios en las rutas.
    <BrowserRouter>
      <div className="bg-rose-water min-h-screen font-sans text-charcoal">
        <Navbar />
        <main>
          <Routes>
            <Route path="/guests" element={<GuestList />} />
            <Route path="/tables" element={<TablesView />} />
            <Route path="/seating" element={<SeatingView />} />
            <Route path="/" element={<Navigate replace to="/tables" />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
