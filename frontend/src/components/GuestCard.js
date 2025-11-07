import React from 'react';

const GuestCard = ({ guest, onDelete, onToggleConfirm, onEdit }) => {
  const getBorderStyle = (familiaridad) => {
    switch (familiaridad) {
      case 'FAMILIA NOVIA':
        return 'border-pink-400';
      case 'FAMILIA NOVIO':
        return 'border-blue-400';
      case 'AMIGOS':
        return 'border-green-400';
      default:
        return 'border-gray-300';
    }
  };

  if (!guest) {
    return <div className="bg-red-100 text-red-500 p-4 rounded-lg">Error: Invitado no encontrado</div>;
  }
  
  return (
    <div className={`relative bg-ivory rounded-lg shadow-xl p-6 m-4 w-64 border-t-4 ${getBorderStyle(guest.familiaridad)} transition-all duration-300`}>
      <button
        onClick={() => onEdit && onEdit(guest)}
        title="Editar invitado"
        className="absolute -top-2 -left-2 w-7 h-7 rounded-full border border-gray-200 text-gray-500 bg-white/90 shadow-sm flex items-center justify-center hover:bg-gray-50 hover:text-gray-600 transition"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L14.732 5.232z" /></svg>
      </button>
      <button
        onClick={() => onDelete && onDelete(guest)}
        title="Eliminar invitado"
        className="absolute -top-2 -right-2 w-7 h-7 rounded-full border border-rose-200 text-rose-400 bg-white/90 shadow-sm flex items-center justify-center hover:bg-rose-50 hover:text-rose-500 transition"
      >
        <span className="text-base leading-none">×</span>
      </button>

      <h2 className="text-2xl font-bold mb-2 text-charcoal">{guest.nombre} {guest.apellido}</h2>
      <p className="text-charcoal/70">Parentesco: {guest.familiaridad || 'No especificada'}</p>
      <p className="text-charcoal/70">Mesa: {guest.mesa ? guest.mesa.nombre : 'No asignada'}</p>
      <div 
        className="mt-4 cursor-pointer inline-block"
        onClick={() => onToggleConfirm && onToggleConfirm(guest)}
        title="Cambiar estado de confirmación"
      >
        <p className={`text-sm font-semibold px-2 py-1 rounded-md transition-colors ${guest.confirmado ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-red-100 text-red-700 hover:bg-red-200'}`}>
          {guest.confirmado ? '✓ Confirmado' : '· Pendiente'}
        </p>
      </div>
    </div>
  );
};

export default GuestCard;
