
import React from 'react';
import { NavLink, Link } from 'react-router-dom';

const Sidebar = ({ isOpen, onClose }) => {
  const linkClasses = "block py-3 px-6 text-charcoal/80 hover:text-rose-gold hover:bg-rose-white transition-all font-medium text-lg border-l-4 border-transparent";
  const activeClasses = "text-rose-gold !border-rose-gold bg-white/40 shadow-inner";

  return (
    <>
      {/* Backdrop for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 transition-opacity"
          onClick={onClose}
        ></div>
      )}

      {/* Sidebar Panel - Increased z-index to be above header */}
      <div
        className={`fixed top-0 left-0 h-full w-72 bg-white/90 backdrop-blur-xl shadow-2xl z-[100] transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="flex justify-between items-center p-6 border-b border-rose-gold/20">
          <h2 className="text-3xl font-script text-rose-gold">Mi Boda</h2>
          <button
            onClick={onClose}
            className="text-charcoal/50 hover:text-rose-gold text-2xl focus:outline-none transition-colors w-8 h-8 flex items-center justify-center rounded-full hover:bg-rose-50"
          >
            &times;
          </button>
        </div>

        <nav className="flex-grow py-4">
          <ul className="space-y-1">
            <li>
              <Link to="/dashboard" className="flex items-center gap-3 py-3 px-6 text-charcoal/80 hover:text-rose-gold hover:bg-rose-50 transition-all font-medium text-lg border-l-4 border-transparent hover:border-rose-gold" onClick={onClose}>
                <span className="text-xl w-8 text-center">🏠</span> Inicio
              </Link>
            </li>
            <li>
              <Link to="/guests" className="flex items-center gap-3 py-3 px-6 text-charcoal/80 hover:text-rose-gold hover:bg-rose-50 transition-all font-medium text-lg border-l-4 border-transparent hover:border-rose-gold" onClick={onClose}>
                <span className="text-xl w-8 text-center">👥</span> Invitados
              </Link>
            </li>
            <li>
              <NavLink
                to="/seating"
                className={({ isActive }) => `flex items-center gap-3 py-3 px-6 text-charcoal/80 hover:text-rose-gold hover:bg-rose-50 transition-all font-medium text-lg border-l-4 border-transparent hover:border-rose-gold ${isActive ? '!text-rose-gold !border-rose-gold bg-rose-50' : ''}`}
                onClick={onClose}
              >
                <span className="text-xl w-8 text-center">📐</span> Visualizador
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/tables"
                className={({ isActive }) => `flex items-center gap-3 py-3 px-6 text-charcoal/80 hover:text-rose-gold hover:bg-rose-50 transition-all font-medium text-lg border-l-4 border-transparent hover:border-rose-gold ${isActive ? '!text-rose-gold !border-rose-gold bg-rose-50' : ''}`}
                onClick={onClose}
                end
              >
                <span className="text-xl w-8 text-center">🪑</span> Distribución
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/cronograma"
                className={({ isActive }) => `flex items-center gap-3 py-3 px-6 text-charcoal/80 hover:text-rose-gold hover:bg-rose-50 transition-all font-medium text-lg border-l-4 border-transparent hover:border-rose-gold ${isActive ? '!text-rose-gold !border-rose-gold bg-rose-50' : ''}`}
                onClick={onClose}
              >
                <span className="text-xl w-8 text-center">📅</span> Cronograma
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/gastos"
                className={({ isActive }) => `flex items-center gap-3 py-3 px-6 text-charcoal/80 hover:text-rose-gold hover:bg-rose-50 transition-all font-medium text-lg border-l-4 border-transparent hover:border-rose-gold ${isActive ? '!text-rose-gold !border-rose-gold bg-rose-50' : ''}`}
                onClick={onClose}
              >
                <span className="text-xl w-8 text-center">💰</span> Gastos
              </NavLink>
            </li>
          </ul>
        </nav>

        <div className="absolute bottom-0 w-full p-6 text-center text-charcoal/40 text-sm font-script">
          Planificado con amor
        </div>
      </div>
    </>
  );
};

export default Sidebar;
