import React from 'react';
import { useDrag } from 'react-dnd';

const Guest = ({ invitado, isSeated = false }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'guest',
    item: invitado,
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }), [invitado.id]);

  // Función para asignar un color a cada grupo para una mejor visualización
  const getGroupColor = (group) => {
    if (!group) return 'bg-gray-200 text-gray-600';
    const colors = ['bg-blue-100 text-blue-800', 'bg-green-100 text-green-800', 'bg-yellow-100 text-yellow-800', 'bg-purple-100 text-purple-800', 'bg-pink-100 text-pink-800'];
    let hash = 0;
    for (let i = 0; i < group.length; i++) {
      hash = group.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash % colors.length);
    return colors[index];
  };

  if (isSeated) {
    return (
      <div ref={drag} className="w-10 h-10 bg-rose-gold rounded-full flex items-center justify-center text-white font-bold text-lg cursor-grab">
        {invitado.nombre.charAt(0)}
      </div>
    );
  }

  return (
    <div
      ref={drag}
      style={{ opacity: isDragging ? 0.5 : 1 }}
      className="p-3 bg-white rounded-lg shadow-md cursor-grab flex justify-between items-center"
    >
      <div className="flex-grow">
        <p className="font-semibold">{invitado.nombre} {invitado.apellido}</p>
        {invitado.grupo && (
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${getGroupColor(invitado.grupo)}`}>
            {invitado.grupo}
          </span>
        )}
      </div>
      <div className="w-8 h-8 bg-rose-gold rounded-full flex items-center justify-center text-white font-bold">
        {invitado.nombre.charAt(0)}
      </div>
    </div>
  );
};

export default Guest;