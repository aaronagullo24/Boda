import React from 'react';
import { NavLink } from 'react-router-dom';

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

      {/* Sidebar Panel */}
      <div
        className={`fixed top-0 left-0 h-full w-72 bg-white/80 backdrop-blur-xl shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="flex justify-between items-center p-6 border-b border-rose-gold/20">
          <h2 className="text-3xl font-script text-rose-gold">Mi Boda</h2>
          <button
            onClick={onClose}
            className="text-charcoal/50 hover:text-rose-gold text-2xl focus:outline-none"
          >
            &times;
          </button>
        </div>

        <nav className="mt-8">
          <ul className="space-y-2">
            <li>
              <NavLink
                to="/guests"
                className={({ isActive }) => `${linkClasses} ${isActive ? activeClasses : ''}`}
                onClick={onClose}
              >
                Lista de Invitados
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/seating"
                className={({ isActive }) => `${linkClasses} ${isActive ? activeClasses : ''}`}
                onClick={onClose}
              >
                Visualizador de Mesas
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/tables"
                className={({ isActive }) => `${linkClasses} ${isActive ? activeClasses : ''}`}
                onClick={onClose}
                end
              >
                Distribución de Mesas
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/cronograma"
                className={({ isActive }) => `${linkClasses} ${isActive ? activeClasses : ''}`}
                onClick={onClose}
              >
                Cronograma
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/gastos"
                className={({ isActive }) => `${linkClasses} ${isActive ? activeClasses : ''}`}
                onClick={onClose}
              >
                Gastos
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
