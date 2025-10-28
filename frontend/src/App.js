import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import GuestList from './components/GuestList';
import TablesView from './components/TablesView';
import SeatingView from './components/SeatingView';
import Navbar from './components/Navbar';

function App() {
  return (
    <BrowserRouter>
      <div className="bg-rose-water min-h-screen font-sans text-charcoal">
        <Navbar />
        <main>
          <Routes>
            <Route path="/guests" element={<GuestList />} />
            <Route path="/tables" element={<TablesView />} />
            <Route path="/seating" element={
              <DndProvider backend={HTML5Backend}>
                <SeatingView />
              </DndProvider>
            } />
            <Route path="/" element={<Navigate replace to="/tables" />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;