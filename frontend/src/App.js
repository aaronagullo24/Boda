import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import GuestList from './components/GuestList';
import TablesView from './components/TablesView';
import DashboardView from './components/DashboardView';
import SeatingView from './components/SeatingView';
import CronogramaView from './components/CronogramaView';
import GastosView from './components/GastosView';
import Sidebar from './components/Sidebar';
import './components/Sidebar.css';

function App() {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [timeLeft, setTimeLeft] = useState({});

  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = +new Date('2027-10-16T00:00:00') - +new Date();
      let newTimeLeft = {};

      if (difference > 0) {
        newTimeLeft = {
          días: Math.floor(difference / (1000 * 60 * 60 * 24)),
          horas: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutos: Math.floor((difference / 1000 / 60) % 60),
          segundos: Math.floor((difference / 1000) % 60),
        };
      }
      return newTimeLeft;
    };

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const timerComponents = Object.keys(timeLeft).map(interval => {
    if (!timeLeft[interval]) {
      return null;
    }
    return (
      <span key={interval} className="mx-1">
        {timeLeft[interval]} {interval}
      </span>
    );
  });

  return (
    <BrowserRouter>
      <div className="bg-rose-water min-h-screen font-sans text-charcoal">
        <Sidebar isOpen={isSidebarOpen} onClose={toggleSidebar} />

        <header className="bg-ivory text-charcoal p-4 shadow-md sticky top-0 z-50 flex items-center justify-between">
          <div className="flex-1">
            <button className="menu-btn text-charcoal text-2xl" onClick={toggleSidebar}>&#9776;</button>
          </div>
          <div className="flex-1 text-center">
            <h1 className="text-3xl font-script text-center flex-grow">Sheri y Aarón</h1>
            <div className="text-sm md:text-base font-sans">
              {timerComponents.length ? timerComponents : <span>¡Llegó el día!</span>}
            </div>
          </div>
          <div className="flex-1"></div>
        </header>

        <main>
          <Routes>
            <Route path="/dashboard" element={<DashboardView />} />
            <Route path="/guests" element={<GuestList />} />
            <Route path="/tables" element={<TablesView />} />
            <Route path="/seating" element={
              <DndProvider backend={HTML5Backend}>
                <SeatingView />
              </DndProvider>
            } />
            <Route path="/cronograma" element={<CronogramaView />} />
            <Route path="/gastos" element={<GastosView />} />
            <Route path="/" element={<Navigate replace to="/dashboard" />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;