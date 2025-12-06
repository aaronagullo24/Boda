import React, { useState, useEffect, useCallback } from 'react';
import Modal from './Modal';

const TablesView = () => {
  const [mesas, setMesas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tableName, setTableName] = useState('');
  const [tableCapacity, setTableCapacity] = useState('');

  // Estados para edición
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingTable, setEditingTable] = useState(null);
  const [editTableName, setEditTableName] = useState('');
  const [editTableCapacity, setEditTableCapacity] = useState('');

  const fetchMesas = useCallback(async () => {
    try {
      setError(null);
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

      const mesasConInvitados = mesasData.map(mesa => ({
        ...mesa,
        guests: invitadosData.filter(inv => inv.mesa_id === mesa.id),
      }));

      setMesas(mesasConInvitados);
    } catch (error) {
      console.error("Error al obtener los datos:", error);
      setError('No se pudieron cargar los datos. Inténtalo de nuevo más tarde.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMesas();
  }, [fetchMesas]);

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setTableName('');
    setTableCapacity('');
  };

  const handleCreateTable = async (e) => {
    e.preventDefault();
    // TODO: Añadir estado de carga para el formulario
    try {
      const response = await fetch('http://localhost:8000/api/mesas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          nombre: tableName,
          capacidad: parseInt(tableCapacity, 10) || null,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al crear la mesa');
      }

      // Refrescamos la lista de mesas y cerramos el modal
      fetchMesas();
      handleCloseModal();
    } catch (error) {
      console.error(error);
      // TODO: Mostrar el error en la UI del modal
    }
  };

  const handleOpenEditModal = (mesa) => {
    setEditingTable(mesa);
    setEditTableName(mesa.nombre || '');
    setEditTableCapacity(mesa.capacidad || '');
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setEditingTable(null);
    setEditTableName('');
    setEditTableCapacity('');
  };

  const handleUpdateTable = async (e) => {
    e.preventDefault();
    if (!editingTable) return;

    try {
      const response = await fetch(`http://localhost:8000/api/mesas/${editingTable.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          nombre: editTableName,
          capacidad: parseInt(editTableCapacity, 10) || null,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al actualizar la mesa');
      }

      fetchMesas();
      handleCloseEditModal();
    } catch (error) {
      console.error(error);
      alert('Error al actualizar la mesa: ' + error.message);
    }
  };

  const renderContent = () => {
    if (loading) {
      return <div className="text-center text-charcoal/80">Cargando mesas...</div>;
    }

    if (error) {
      return <div className="text-center text-red-500">{error}</div>;
    }

    if (mesas.length === 0) {
      return <div className="text-center text-charcoal/80">Aún no se han creado mesas. ¡Crea la primera!</div>;
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {mesas.map((mesa) => (
          <div key={mesa.id} className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-rose-gold flex flex-col">
            <h2 className="text-3xl font-script text-center flex-grow">{mesa.nombre}</h2>
            <div className="space-y-3 flex-grow">
              {mesa.guests && mesa.guests.length > 0 ? (
                mesa.guests.map((guest) => (
                  <div key={guest.id} className="bg-ivory rounded-lg p-2 shadow-inner text-center">
                    <p className="text-charcoal font-medium">{guest.nombre}</p>
                  </div>
                ))
              ) : (
                <p className="text-charcoal/50 text-center italic mt-4">Mesa vacía</p>
              )}
            </div>
            <div className="text-center text-sm text-charcoal/60 mt-4 pt-2 border-t flex justify-between items-center">
              <span>Capacidad: {mesa.capacidad || 'N/A'}</span>
              <button
                onClick={() => handleOpenEditModal(mesa)}
                className="text-rose-gold hover:text-rose-gold/80 font-bold text-sm underline"
              >
                Editar
              </button>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <>
      <div className="p-8 bg-cream min-h-screen">
        <div className="flex justify-between items-center mb-12">
          <h1 className="font-script text-7xl text-rose-gold">Distribución de Mesas</h1>
          <button
            onClick={handleOpenModal}
            className="bg-rose-gold text-white font-bold py-3 px-6 rounded-lg shadow-md hover:bg-rose-gold/90 transition-all transform hover:scale-105"
          >
            Crear Mesa
          </button>
        </div>
        {renderContent()}
      </div>

      <Modal isOpen={isModalOpen} onClose={handleCloseModal}>
        <h2 className="text-3xl font-script text-center flex-grow">Crear Nueva Mesa</h2>
        <form onSubmit={handleCreateTable}>
          <div className="mb-4">
            <label htmlFor="tableName" className="block text-charcoal/80 mb-2">Nombre de la mesa (opcional)</label>
            <input type="text" id="tableName" value={tableName} onChange={(e) => setTableName(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-rose-gold" placeholder="Ej: Mesa de los novios" />
          </div>
          <div className="mb-6">
            <label htmlFor="tableCapacity" className="block text-charcoal/80 mb-2">Capacidad (opcional)</label>
            <input type="number" id="tableCapacity" value={tableCapacity} onChange={(e) => setTableCapacity(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-rose-gold" placeholder="Ej: 8" />
          </div>
          <div className="flex justify-end">
            <button type="button" onClick={handleCloseModal} className="text-charcoal/80 mr-4">Cancelar</button>
            <button type="submit" className="bg-rose-gold text-white font-bold py-2 px-4 rounded-lg shadow-md hover:bg-rose-gold/80 transition-colors">
              Crear
            </button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={isEditModalOpen} onClose={handleCloseEditModal}>
        <h2 className="text-3xl font-script text-center flex-grow">Editar Mesa</h2>
        <form onSubmit={handleUpdateTable}>
          <div className="mb-4">
            <label htmlFor="editTableName" className="block text-charcoal/80 mb-2">Nombre de la mesa</label>
            <input type="text" id="editTableName" value={editTableName} onChange={(e) => setEditTableName(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-rose-gold" />
          </div>
          <div className="mb-6">
            <label htmlFor="editTableCapacity" className="block text-charcoal/80 mb-2">Capacidad</label>
            <input type="number" id="editTableCapacity" value={editTableCapacity} onChange={(e) => setEditTableCapacity(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-rose-gold" />
          </div>
          <div className="flex justify-end">
            <button type="button" onClick={handleCloseEditModal} className="text-charcoal/80 mr-4">Cancelar</button>
            <button type="submit" className="bg-rose-gold text-white font-bold py-2 px-4 rounded-lg shadow-md hover:bg-rose-gold/80 transition-colors">
              Guardar Cambios
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
};

export default TablesView;