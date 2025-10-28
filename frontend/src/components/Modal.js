import React from 'react';

const Modal = ({ isOpen, onClose, children }) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-center items-center">
      {/* Overlay con degradado suave y desenfoque para temática de boda */}
      <div className="absolute inset-0 bg-gradient-to-br from-rose-100/70 via-white/60 to-amber-50/70 backdrop-blur-sm"></div>

      {/* Contenedor de la tarjeta */}
      <div className="relative bg-white/95 border border-rose-100 shadow-2xl rounded-2xl w-full max-w-lg p-8 mx-4">
        {/* Esquinas decorativas */}
        <div className="pointer-events-none absolute -top-3 left-6 text-rose-300 text-3xl select-none">❦</div>
        <div className="pointer-events-none absolute -bottom-3 right-6 text-rose-300 text-3xl rotate-180 select-none">❦</div>

        {/* Botón cerrar */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 inline-flex items-center justify-center w-9 h-9 rounded-full border border-rose-200 text-rose-400 hover:bg-rose-50 hover:text-rose-500 transition"
          aria-label="Cerrar"
        >
          <span className="text-xl leading-none">×</span>
        </button>

        {/* Contenido */}
        <div className="mt-2">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
