import React, { useState, useEffect, useCallback } from 'react';
import Table from './Table';
import Guest from './Guest';

const SeatingView = () => {
  const [mesas, setMesas] = useState([]);
  const [invitados, setInvitados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

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
    const guestToMove = invitados.find(inv => inv.id === guestId);
    if (!guestToMove) return;

    const originalMesas = JSON.parse(JSON.stringify(mesas));
    const originalInvitados = JSON.parse(JSON.stringify(invitados));

    // Optimistic UI Update
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

    // API Call
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
  }, [invitados, mesas]);

  const handleUnassignGuest = (guest) => {
    if (!guest) return;
    handleDropGuest(guest.id, null, null);
  };

  const invitadosSinMesa = invitados.filter(inv => 
    inv.mesa_id === null &&
    (inv.nombre.toLowerCase() + ' ' + (inv.apellido || '').toLowerCase()).includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="text-center p-8">Cargando distribución...</div>;
  if (error) return <div className="text-center text-red-500 p-8">{error}</div>;

  return (
    <div className="flex h-[calc(100vh-64px)] bg-cream">
      <div className="w-1/4 bg-ivory flex flex-col p-4 shadow-lg">
        <div className="sticky top-0 bg-ivory z-10 pt-2 pb-4">
          <h2 className="font-bold text-2xl text-charcoal mb-4">Invitados sin mesa</h2>
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

      <div className="w-3/4 p-8 overflow-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {mesas.map(mesa => (
          <Table key={mesa.id} mesa={mesa} onDropGuest={handleDropGuest} onUnassignGuest={handleUnassignGuest} />
        ))}
      </div>
    </div>
  );
};

export default SeatingView;