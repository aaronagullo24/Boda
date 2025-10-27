import React from 'react';
import { NavLink } from 'react-router-dom';

const Navbar = () => {
  const activeStyle = {
    textDecoration: 'underline',
    color: '#B76E79', // rose-gold
  };

  return (
    <nav className="bg-ivory/80 backdrop-blur-sm p-4 shadow-md sticky top-0 z-10">
      <ul className="flex justify-center space-x-8 font-sans font-bold text-lg">
        <li>
          <NavLink to="/tables" style={({ isActive }) => isActive ? activeStyle : undefined} end>
            Distribución de Mesas
          </NavLink>
        </li>
        <li>
          <NavLink to="/guests" style={({ isActive }) => isActive ? activeStyle : undefined}>
            Lista de Invitados
          </NavLink>
        </li>
        <li>
          <NavLink to="/seating" style={({ isActive }) => isActive ? activeStyle : undefined}>
            Planificador de Mesas
          </NavLink>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;
