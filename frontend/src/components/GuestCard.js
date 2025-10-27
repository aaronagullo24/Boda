import React from 'react';

const GuestCard = ({ guest }) => {
  const getRibbonStyle = (familiaridad) => {
    switch (familiaridad) {
      case 'FAMILIA NOVIA':
        return 'bg-pink-500'; // Color distintivo para Familia Novia
      case 'FAMILIA NOVIO':
        return 'bg-blue-500'; // Color distintivo para Familia Novio
      case 'AMIGOS':
        return 'bg-green-500'; // Color distintivo para Amigos
      default:
        return 'bg-gray-300'; // Color por defecto
    }
  };

  if (!guest) {
    return <div className="bg-red-100 text-red-500 p-4 rounded-lg">Error: Invitado no encontrado</div>;
  }

  return (
    <div className="relative bg-ivory rounded-lg shadow-xl p-6 m-4 w-64 border-2 border-transparent hover:border-rose-gold transition-all duration-300">
      {/* Distintivo */}
      <div
        className={`absolute top-0 left-0 w-6 h-6 ${getRibbonStyle(guest.familiaridad)} rounded-full`}
        title={guest.familiaridad}
      ></div>

      <h2 className="text-2xl font-bold mb-2 text-charcoal">{guest.nombre} {guest.apellido}</h2>
      <p className="text-charcoal/70">Familiaridad: {guest.familiaridad || 'No especificada'}</p>
      <p className="text-charcoal/70">Mesa: {guest.mesa_id || 'No asignada'}</p>
      <p className={`text-sm mt-4 font-semibold ${guest.confirmed ? 'text-green-600' : 'text-red-600'}`}>
        {guest.confirmed ? 'Confirmado' : 'Pendiente'}
      </p>
    </div>
  );
};

export default GuestCard;
