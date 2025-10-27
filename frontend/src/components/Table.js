import React from 'react';
import Seat from './Seat';

const Table = ({ mesa, onDropGuest }) => {
  const tableStyle = {
    width: '250px',
    height: '250px',
  };

  const getSeatPosition = (index, total) => {
    const angle = (index / total) * 2 * Math.PI;
    const radius = 100; // Radio del círculo de asientos
    const seatWidth = 80; // Ancho del componente Seat (w-20)
    const x = radius * Math.cos(angle) + 125 - (seatWidth / 2); // 125 es la mitad del ancho de la mesa
    const y = radius * Math.sin(angle) + 125 - (seatWidth / 2);
    return { top: `${y}px`, left: `${x}px` };
  };

  return (
    <div className="flex flex-col items-center">
      <h3 className="font-display text-2xl text-charcoal mb-2">{mesa.nombre || `Mesa ${mesa.id}`}</h3>
      <div
        style={tableStyle}
        className="relative bg-white rounded-full shadow-xl border-4 border-rose-gold flex items-center justify-center"
      >
        <div className="absolute text-center">
          <p className="font-bold text-lg">{mesa.asientos.filter(Boolean).length} / {mesa.capacidad}</p>
        </div>
        {mesa.asientos.map((invitado, index) => (
          <Seat key={index} seatInfo={{ mesaId: mesa.id, position: index, invitado }} onDropGuest={onDropGuest} style={getSeatPosition(index, mesa.capacidad)} />
        ))}
      </div>
    </div>
  );
};

export default Table;