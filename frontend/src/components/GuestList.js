import React, { useState, useEffect } from 'react';
import GuestCard from './GuestCard';
import Modal from './Modal';

const GuestList = () => {
  const [guests, setGuests] = useState([]);
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTable, setFilterTable] = useState('');
  const [filterFamiliaridad, setFilterFamiliaridad] = useState('');
  const [filterConfirmed, setFilterConfirmed] = useState('all');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({ nombre: '', apellido: '', familiaridad: '' });
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  // editingGuest removed as it was unused
  const [editForm, setEditForm] = useState({ id: null, nombre: '', apellido: '', familiaridad: '' });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [guestsRes, tablesRes] = await Promise.all([
          fetch('http://localhost:8000/api/guests'),
          fetch('http://localhost:8000/api/mesas'),
        ]);

        if (!guestsRes.ok || !tablesRes.ok) {
          throw new Error('La respuesta de la red no fue correcta');
        }

        const guestsData = await guestsRes.json();
        const tablesData = await tablesRes.json();

        setGuests(guestsData);
        setTables(tablesData);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredGuests = guests
    .filter(guest =>
      (guest.nombre.toLowerCase() + ' ' + guest.apellido.toLowerCase()).includes(searchTerm.toLowerCase())
    )
    .filter(guest => {
      if (!filterTable) return true;
      if (filterTable === 'unassigned') return guest.mesa_id === null;
      return guest.mesa_id === parseInt(filterTable);
    })
    .filter(guest => {
      if (!filterFamiliaridad) return true;
      return guest.familiaridad === filterFamiliaridad;
    })
    .filter(guest => {
      if (filterConfirmed === 'all') return true;
      if (filterConfirmed === 'confirmed') return guest.confirmado;
      if (filterConfirmed === 'pending') return !guest.confirmado;
      return true;
    });

  const openModal = () => {
    setSubmitError('');
    setForm({ nombre: '', apellido: '', familiaridad: '' });
    setIsModalOpen(true);
  };

  const openEditModal = (guest) => {
    setSubmitError('');
    setEditForm({
      id: guest.id,
      nombre: guest.nombre,
      apellido: guest.apellido,
      familiaridad: guest.familiaridad
    });
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => setIsEditModalOpen(false);

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError('');
    try {
      const resp = await fetch('http://localhost:8000/api/guests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        throw new Error(err.message || 'Error al crear el invitado');
      }
      const created = await resp.json();
      setGuests(prev => [created, ...prev]);
      closeModal();
    } catch (err) {
      setSubmitError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateGuest = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError('');
    try {
      const resp = await fetch(`http://localhost:8000/api/guests/${editForm.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(editForm),
      });
      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        throw new Error(err.message || 'Error al actualizar el invitado');
      }
      const updatedGuest = await resp.json();
      setGuests(prev => prev.map(g => g.id === updatedGuest.id ? updatedGuest : g));
      closeEditModal();
    } catch (err) {
      setSubmitError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleConfirm = async (guestToUpdate) => {
    try {
      const updatedGuestData = { ...guestToUpdate, confirmado: !guestToUpdate.confirmado };

      const resp = await fetch(`http://localhost:8000/api/guests/${guestToUpdate.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ confirmado: updatedGuestData.confirmado }),
      });

      if (!resp.ok) throw new Error('Error al actualizar el estado');

      setGuests(prev => prev.map(g => g.id === guestToUpdate.id ? updatedGuestData : g));
    } catch (err) {
      alert(err.message || 'No se pudo actualizar el invitado.');
    }
  };
  if (loading) return <p className="text-center mt-8">Cargando invitados...</p>;
  if (error) return <p className="text-center mt-8 text-red-500">Error: {error}</p>;

  return (
    <div className="p-8">
      <h1 className="font-script text-7xl text-center mb-8 text-rose-gold">Lista de Invitados</h1>

      <div className="max-w-4xl mx-auto bg-white/50 rounded-xl p-4 mb-8 shadow-sm">
        <div className="grid grid-cols-1 gap-4">
          <input
            type="text"
            placeholder="Buscar por nombre..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-rose-gold"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <select onChange={e => setFilterTable(e.target.value)} value={filterTable} className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-rose-gold">
              <option value="">Todas las mesas</option>
              <option value="unassigned">Sin asignar</option>
              {tables.map(table => (
                <option key={table.id} value={table.id}>{table.nombre}</option>
              ))}
            </select>

            <select onChange={e => setFilterFamiliaridad(e.target.value)} value={filterFamiliaridad} className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-rose-gold">
              <option value="">Toda la familiaridad</option>
              <option value="FAMILIA NOVIA">Familia Novia</option>
              <option value="FAMILIA NOVIO">Familia Novio</option>
              <option value="AMIGOS">Amigos</option>
            </select>

            <select onChange={e => setFilterConfirmed(e.target.value)} value={filterConfirmed} className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-rose-gold">
              <option value="all">Todos (Confirmación)</option>
              <option value="confirmed">Confirmados</option>
              <option value="pending">Pendientes</option>
            </select>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between max-w-3xl mx-auto mb-8 px-4">
        <p className="text-charcoal/80">
          Mostrando <strong>{filteredGuests.length}</strong> de <strong>{guests.length}</strong> invitados
        </p>
        <button onClick={openModal} className="bg-rose-gold text-white px-4 py-2 rounded-md shadow hover:opacity-90">
          Nuevo invitado
        </button>
      </div>

      <Modal isOpen={isModalOpen} onClose={closeModal}>
        <h2 className="text-2xl font-bold mb-4">Añadir Nuevo Invitado</h2>
        {submitError && <p className="text-red-500 bg-red-100 p-2 rounded mb-4">{submitError}</p>}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700">Nombre</label>
            <input type="text" name="nombre" value={form.nombre} onChange={handleChange} className="w-full px-3 py-2 border rounded" required />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Apellido</label>
            <input type="text" name="apellido" value={form.apellido} onChange={handleChange} className="w-full px-3 py-2 border rounded" />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Familiaridad</label>
            <select name="familiaridad" value={form.familiaridad} onChange={handleChange} className="w-full px-3 py-2 border rounded" required>
              <option value="">Selecciona una opción</option>
              <option value="FAMILIA NOVIA">Familia Novia</option>
              <option value="FAMILIA NOVIO">Familia Novio</option>
              <option value="AMIGOS">Amigos</option>
            </select>
          </div>
          <button type="submit" disabled={submitting} className="bg-rose-gold text-white px-4 py-2 rounded-md shadow hover:opacity-90 disabled:opacity-50">{submitting ? 'Añadiendo...' : 'Añadir Invitado'}</button>
        </form>
      </Modal>

      <div className="flex flex-wrap justify-center">
        {filteredGuests.map(guest => {
          const handleDelete = async (g) => {
            if (!window.confirm(`¿Eliminar a ${g.nombre} ${g.apellido}?`)) return;
            try {
              const resp = await fetch(`http://localhost:8000/api/guests/${g.id}`, { method: 'DELETE' });
              if (!resp.ok && resp.status !== 204) throw new Error('No se pudo eliminar');
              setGuests(prev => prev.filter(x => x.id !== g.id));
            } catch (e) {
              alert(e.message || 'Error al eliminar');
            }
          };

          return (
            <GuestCard
              key={guest.id}
              guest={guest}
              onToggleConfirm={handleToggleConfirm}
              onDelete={handleDelete}
              onEdit={openEditModal}
            />
          );
        })}
      </div>

      {/* Modal para Editar Invitado */}
      <Modal isOpen={isEditModalOpen} onClose={closeEditModal}>
        <h2 className="text-2xl font-bold mb-4">Editar Invitado</h2>
        {submitError && <p className="text-red-500 bg-red-100 p-2 rounded mb-4">{submitError}</p>}
        <form onSubmit={handleUpdateGuest}>
          <div className="mb-4">
            <label className="block text-gray-700">Nombre</label>
            <input type="text" name="nombre" value={editForm.nombre} onChange={handleEditChange} className="w-full px-3 py-2 border rounded" required />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Apellido</label>
            <input type="text" name="apellido" value={editForm.apellido} onChange={handleEditChange} className="w-full px-3 py-2 border rounded" />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Familiaridad</label>
            <select name="familiaridad" value={editForm.familiaridad} onChange={handleEditChange} className="w-full px-3 py-2 border rounded" required>
              <option value="">Selecciona una opción</option>
              <option value="FAMILIA NOVIA">Familia Novia</option>
              <option value="FAMILIA NOVIO">Familia Novio</option>
              <option value="AMIGOS">Amigos</option>
            </select>
          </div>
          <button type="submit" disabled={submitting} className="bg-rose-gold text-white px-4 py-2 rounded-md shadow hover:opacity-90 disabled:opacity-50">
            {submitting ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default GuestList;
