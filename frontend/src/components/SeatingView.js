import React, { useState, useEffect, useCallback } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import Table from './Table';
import Guest from './Guest';

const SeatingView = () => {
  const [mesas, setMesas] = useState([]);
  const [invitados, setInvitados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

      // Asignar invitados a sus mesas
      const mesasConInvitados = mesasData.map(mesa => {
        const invitadosEnMesa = invitadosData.filter(inv => inv.mesa_id === mesa.id);
        const asientos = Array(mesa.capacidad).fill(null);
        invitadosEnMesa.forEach(inv => {
          if (inv.seat_position !== null && inv.seat_position < mesa.capacidad) {
            asientos[inv.seat_position] = inv;
          }
        });
        return { ...mesa, asientos };
      });

      setMesas(mesasConInvitados);
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
    // Usamos una función en setMesas y setInvitados para garantizar que trabajamos con el estado más reciente
    // y evitar problemas de "stale state" por dependencias en useCallback.
    
    // Guardamos el estado original para poder revertir en caso de error en la API
    const originalMesas = JSON.parse(JSON.stringify(mesas));
    const originalInvitados = JSON.parse(JSON.stringify(invitados));

    // Actualización optimista de la UI
    setMesas(prevMesas => {
      const newMesas = JSON.parse(JSON.stringify(prevMesas));
      const invitado = originalInvitados.find(inv => inv.id === guestId);
      if (!invitado) return prevMesas; // No hacer nada si el invitado no se encuentra

      // 1. Quitar al invitado de su asiento anterior (si lo tenía)
      const oldMesaId = invitado.mesa_id;
      if (oldMesaId !== null) {
        const oldMesa = newMesas.find(m => m.id === oldMesaId);
        if (oldMesa) {
          const oldSeatIndex = oldMesa.asientos.findIndex(s => s && s.id === guestId);
          if (oldSeatIndex > -1) {
            oldMesa.asientos[oldSeatIndex] = null;
          }
        }
      }

      // 2. Añadir al invitado a su nuevo asiento
      const newMesa = newMesas.find(m => m.id === newMesaId);
      const updatedGuest = { ...invitado, mesa_id: newMesaId, seat_position: seatPosition };
      if (newMesa) {
        newMesa.asientos[seatPosition] = updatedGuest;
      }
      return newMesas;
    });

    setInvitados(prevInvitados => prevInvitados.map(inv =>
        inv.id === guestId ? { ...inv, mesa_id: newMesaId, seat_position: seatPosition } : inv
    ));

    // Petición a la API
    try {
      const response = await fetch(`http://localhost:8000/api/guests/${guestId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          mesa_id: newMesaId,
          seat_position: seatPosition,
        }),
      });

      if (!response.ok) throw new Error('Error al actualizar el invitado');

    } catch (error) { 
      console.error("Error al mover el invitado:", error);
      // Si falla, revertimos al estado original
      setMesas(originalMesas);
      setInvitados(originalInvitados);
      setError('No se pudo mover al invitado.');
    }
  }, [mesas, invitados]); // Eliminamos fetchData de las dependencias

  const invitadosSinMesa = invitados.filter(inv => inv.mesa_id === null);

  if (loading) return <div className="text-center p-8">Cargando distribución...</div>;
  if (error) return <div className="text-center text-red-500 p-8">{error}</div>;

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="flex h-[calc(100vh-64px)] bg-cream">
        {/* Lista de Invitados */}
        <div className="w-1/4 bg-ivory p-4 overflow-y-auto shadow-lg">
          <h2 className="font-bold text-2xl text-charcoal mb-4 sticky top-0 bg-ivory pb-2">Invitados sin mesa</h2>
          <div className="space-y-2">
            {invitadosSinMesa.map(invitado => <Guest key={invitado.id} invitado={invitado} />)}
          </div>
        </div>

        {/* Área de Mesas */}
        <div className="w-3/4 p-8 overflow-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {mesas.map(mesa => (
            <Table key={mesa.id} mesa={mesa} onDropGuest={handleDropGuest} />
          ))}
        </div>
      </div>
    </DndProvider>
  );
};

export default SeatingView;