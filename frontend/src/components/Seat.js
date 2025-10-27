import React from 'react';
import { useDrop } from 'react-dnd';
import Guest from './Guest';

const Seat = ({ seatInfo, onDropGuest, style }) => {
  const { mesaId, position, invitado } = seatInfo;

  const [{ isOver, canDrop }, drop] = useDrop(() => ({
    accept: 'guest',
    canDrop: () => !invitado, // Solo se puede soltar si el asiento está vacío
    drop: (item) => {
      // Doble comprobación para evitar condiciones de carrera
      if (!invitado) onDropGuest(item.id, mesaId, position);
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
      canDrop: !!monitor.canDrop(),
    }),
  }), [mesaId, position, invitado]);

  const getBackgroundColor = () => {
    if (isOver && canDrop) return 'bg-green-200';
    if (!isOver && canDrop) return 'bg-gray-200/50';
    return 'bg-gray-200';
  };

  return (
    <div
      ref={drop}
      style={style}
      className={`absolute w-20 flex flex-col items-center justify-center transition-all`}
    >
      <div
        className={`w-12 h-12 rounded-full flex items-center justify-center ${getBackgroundColor()} border-2 border-dashed border-gray-400`}
      >
        {invitado ? (
          <Guest invitado={invitado} isSeated={true} />
        ) : (
          <span className="text-xs text-gray-400">{position + 1}</span>
        )}
      </div>
      {invitado && <p className="text-xs mt-1 text-charcoal text-center w-20 truncate">{invitado.nombre}</p>}
    </div>
  );
};

export default Seat;