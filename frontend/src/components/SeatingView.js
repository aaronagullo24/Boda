import React, { useState, useEffect, useCallback } from 'react';
import Table from './Table';
import Guest from './Guest';
import Draggable from 'react-draggable';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Subcomponente envoltorio para manejar la referencia del nodo para Draggable
const DraggableTableWrapper = ({ mesa, isLayoutMode, onStop, children }) => {
  const nodeRef = React.useRef(null);

  // Fallback de posición por defecto si no hay coordenadas
  // Se calcula dentro o se pasa, pero aquí solo necesitamos los valores.
  // Asumimos que mesa.x/y ya vienen preparados por el padre.

  return (
    <Draggable
      nodeRef={nodeRef}
      defaultPosition={{ x: mesa.position_x || 0, y: mesa.position_y || 0 }}
      position={{ x: mesa.position_x || 0, y: mesa.position_y || 0 }}
      onStop={(e, data) => onStop(e, data, mesa.id)}
      disabled={!isLayoutMode}
      bounds="parent"
    >
      <div ref={nodeRef} style={{ position: 'absolute', zIndex: isLayoutMode ? 20 : 10 }}>
        {children}
      </div>
    </Draggable>
  );
};

const SeatingView = () => {
  const [mesas, setMesas] = useState([]);
  const [invitados, setInvitados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLayoutMode, setIsLayoutMode] = useState(false);
  const [isGuestPanelOpen, setIsGuestPanelOpen] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [mesasRes, invitadosRes] = await Promise.all([
        fetch('http://localhost:8000/api/mesas'),
        fetch('http://localhost:8000/api/guests'),
      ]);

      if (!mesasRes.ok || !invitadosRes.ok) {
        throw new Error('La respuesta de la red no fue correcta');
      }

      const mesasData = await mesasRes.json();
      const invitadosData = await invitadosRes.json();

      const mesasConAsientos = mesasData.map(mesa => {
        const asientos = Array(mesa.capacidad).fill(null);
        if (mesa.guests) {
          mesa.guests.forEach(invitado => {
            if (invitado.seat_position !== null && invitado.seat_position < mesa.capacidad) {
              asientos[invitado.seat_position] = invitado;
            }
          });
        }
        return { ...mesa, asientos };
      });

      setMesas(mesasConAsientos);
      setInvitados(invitadosData);
      setError(null);
    } catch (error) {
      console.error("Error al obtener los datos:", error);
      setError('No se pudieron cargar los datos. Inténtalo de nuevo más tarde.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDropGuest = useCallback(async (guestId, newMesaId, seatPosition) => {
    if (isLayoutMode) return; // Deshabilitar soltar invitados en modo diseño
    const guestToMove = invitados.find(inv => inv.id === guestId);
    if (!guestToMove) return;

    const originalMesas = JSON.parse(JSON.stringify(mesas));
    const originalInvitados = JSON.parse(JSON.stringify(invitados));

    setMesas(prevMesas => {
      const newMesas = JSON.parse(JSON.stringify(prevMesas));
      if (guestToMove.mesa_id !== null) {
        const oldMesa = newMesas.find(m => m.id === guestToMove.mesa_id);
        if (oldMesa) {
          const oldSeatIndex = oldMesa.asientos.findIndex(s => s && s.id === guestId);
          if (oldSeatIndex > -1) {
            oldMesa.asientos[oldSeatIndex] = null;
          }
        }
      }
      if (newMesaId !== null) {
        const newMesa = newMesas.find(m => m.id === newMesaId);
        if (newMesa) {
          newMesa.asientos[seatPosition] = { ...guestToMove, mesa_id: newMesaId, seat_position: seatPosition };
        }
      }
      return newMesas;
    });

    setInvitados(prevInvitados =>
      prevInvitados.map(inv =>
        inv.id === guestId ? { ...inv, mesa_id: newMesaId, seat_position: seatPosition } : inv
      )
    );

    try {
      const response = await fetch(`http://localhost:8000/api/guests/${guestId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ mesa_id: newMesaId, seat_position: seatPosition }),
      });
      if (!response.ok) throw new Error('Error al actualizar el invitado');
    } catch (error) {
      console.error("Error al mover el invitado:", error);
      setMesas(originalMesas);
      setInvitados(originalInvitados);
      setError('No se pudo mover al invitado.');
    }
  }, [invitados, mesas, isLayoutMode]);

  const handleUnassignGuest = (guest) => {
    if (isLayoutMode) return;
    if (!guest) return;
    handleDropGuest(guest.id, null, null);
  };

  const handleTableStop = async (e, data, mesaId) => {
    const { x, y } = data;
    // Actualización optimista
    setMesas(prevMesas => prevMesas.map(m =>
      m.id === mesaId ? { ...m, position_x: x, position_y: y } : m
    ));

    try {
      await fetch(`http://localhost:8000/api/mesas/${mesaId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ position_x: x, position_y: y }),
      });
    } catch (error) {
      console.error("Error al mover mesa:", error);
      // Revertir o mostrar error
    }
  };

  // Función para exportar a PDF
  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text("Distribución de Mesas - Sheri y Aarón", 14, 22);
    doc.setFontSize(12);

    const tablesData = mesas.map(mesa => {
      const invitadosNombres = mesa.asientos
        .filter(a => a !== null)
        .map(a => `${a.nombre} ${a.apellido}`)
        .join(', ');
      return [mesa.nombre, mesa.capacidad, invitadosNombres || '(Vacía)'];
    });

    autoTable(doc, {
      startY: 30,
      head: [['Nombre Mesa', 'Cap.', 'Invitados']],
      body: tablesData,
      styles: { font: 'helvetica', fontSize: 10 },
      headStyles: { fillColor: [183, 110, 121] }, // Rose Gold aprox
    });

    doc.save('distribucion_mesas.pdf');
  };

  const invitadosSinMesa = invitados.filter(inv =>
    inv.mesa_id === null &&
    (inv.nombre.toLowerCase() + ' ' + (inv.apellido || '').toLowerCase()).includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="text-center p-8">Cargando distribución...</div>;
  if (error) return <div className="text-center text-red-500 p-8">{error}</div>;

  return (
    <div className="flex h-[calc(100vh-64px)] bg-cream overflow-hidden relative">
      <div
        className={`bg-ivory flex flex-col p-4 shadow-lg z-20 transition-all duration-300 absolute md:static h-full
          ${isLayoutMode ? 'opacity-50 pointer-events-none' : ''}
          ${isGuestPanelOpen ? 'w-full md:w-1/4 translate-x-0' : 'w-0 -translate-x-full md:translate-x-0 md:w-0 overflow-hidden p-0 opacity-0'}`
        }
      >
        <div className="sticky top-0 bg-ivory z-10 pt-2 pb-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-bold text-2xl text-charcoal truncate">Invitados sin mesa</h2>
            <button onClick={() => setIsGuestPanelOpen(false)} className="md:hidden text-charcoal">✕</button>
          </div>
          <input
            type="text"
            placeholder="Buscar invitado..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-rose-gold"
          />
        </div>
        <div className="space-y-2 overflow-y-auto">
          {invitadosSinMesa.map(invitado => <Guest key={invitado.id} invitado={invitado} />)}
        </div>
      </div>

      <div className={`flex flex-col h-full transition-all duration-300 ${isGuestPanelOpen ? 'w-full md:w-3/4' : 'w-full'}`}>
        <div className="bg-ivory/80 p-4 border-b border-rose-water flex justify-between items-center z-10 backdrop-blur-sm">
          <div className="flex items-center gap-4">
            {!isGuestPanelOpen && (
              <button
                onClick={() => setIsGuestPanelOpen(true)}
                className="bg-white p-2 rounded-full shadow hover:bg-rose-white transition-colors text-rose-gold"
                title="Mostrar Invitados"
              >
                👥
              </button>
            )}
            <h2 className="text-2xl font-script text-rose-gold">Distribución Salón</h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportPDF}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-sage text-white font-bold shadow-md hover:scale-105 transition-all mr-2"
              title="Exportar listado a PDF"
            >
              📄 <span className="hidden sm:inline">PDF</span>
            </button>
            <button
              onClick={() => setIsGuestPanelOpen(!isGuestPanelOpen)}
              className="hidden md:block text-sm text-charcoal/60 hover:text-rose-gold underline ml-2"
            >
              {isGuestPanelOpen ? 'Ocultar Lista' : 'Ver Lista'}
            </button>

            <div className="ml-4 flex items-center gap-2">
              <span className="hidden md:inline text-sm text-charcoal/60 text-right w-24 leading-snug">
                {isLayoutMode ? "Mover mesas" : "Asignar"}
              </span>
              <button
                onClick={() => setIsLayoutMode(!isLayoutMode)}
                className={`px-4 py-2 rounded-lg font-bold shadow-md transition-all ${isLayoutMode ? 'bg-rose-gold text-white scale-105' : 'bg-white text-charcoal border border-gray-300 hover:bg-gray-50'}`}
              >
                {isLayoutMode ? 'Terminar' : 'Modo Diseño'}
              </button>
            </div>
          </div>
        </div>

        <div className="flex-grow overflow-auto relative bg-ivory">
          {/* Tamaño abstracto del lienzo para permitir scroll amplio */}
          <div className="bg-grid-pattern relative p-8" style={{ minWidth: '2000px', minHeight: '2000px' }}>
            {mesas.map((mesa, index) => {
              // Fallback de posición grid si no hay coordenadas
              const defaultX = (index % 3) * 350 + 50;
              const defaultY = Math.floor(index / 3) * 350 + 50;
              const mesaWithPos = {
                ...mesa,
                position_x: mesa.position_x !== null && mesa.position_x !== undefined ? mesa.position_x : defaultX,
                position_y: mesa.position_y !== null && mesa.position_y !== undefined ? mesa.position_y : defaultY,
              };

              return (
                <DraggableTableWrapper
                  key={mesa.id}
                  mesa={mesaWithPos}
                  isLayoutMode={isLayoutMode}
                  onStop={handleTableStop}
                >
                  <div className={`transition-all duration-300 ${isLayoutMode ? 'cursor-move ring-4 ring-rose-gold/50 shadow-2xl scale-105' : ''}`}>
                    <Table mesa={mesaWithPos} onDropGuest={handleDropGuest} onUnassignGuest={handleUnassignGuest} />
                  </div>
                  {isLayoutMode && (
                    <div className="absolute -top-6 left-0 w-full text-center bg-rose-gold text-white text-xs py-1 rounded shadow">
                      Mover
                    </div>
                  )}
                </DraggableTableWrapper>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeatingView;