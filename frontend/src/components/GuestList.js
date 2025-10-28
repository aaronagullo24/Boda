import React, { useState, useEffect } from 'react';
import GuestCard from './GuestCard';
import Modal from './Modal';

const GuestList = () => {
  const [guests, setGuests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({ nombre: '', apellido: '', familiaridad: '' });
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    const fetchGuests = async () => {
      try {
        // Asumimos que la API está en http://localhost:8000
        const response = await fetch('http://localhost:8000/api/guests'); // Restaurar la URL original de la API
        if (!response.ok) {
          throw new Error('La respuesta de la red no fue correcta');
        }
        const data = await response.json();
        setGuests(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchGuests();
  }, []);

  const filteredGuests = guests.filter(guest =>
    guest.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openModal = () => {
    setSubmitError('');
    setForm({ nombre: '', apellido: '', familiaridad: '' });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
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

  if (loading) return <p className="text-center mt-8">Cargando invitados...</p>;
  if (error) return <p className="text-center mt-8 text-red-500">Error: {error}</p>;

  return (
    <div className="p-8">
      <h1 className="font-script text-7xl text-center mb-8 text-rose-gold">Lista de Invitados</h1>
      <div className="mb-8 px-4 max-w-md mx-auto">
        <input
          type="text"
          placeholder="Buscar invitado..."
          className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-rose-gold"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
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
        <div className="text-center mb-6">
          <div className="text-4xl">💍</div>
          <h2 className="text-3xl font-script text-rose-500">Nuevo invitado</h2>
          <p className="text-charcoal/70 text-sm">Añade a tu lista con cariño</p>
        </div>
        {submitError && <div className="text-red-600 mb-2">{submitError}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-charcoal">Nombre</label>
            <input name="nombre" value={form.nombre} onChange={handleChange} required className="w-full border border-rose-100 focus:border-rose-300 focus:ring-rose-200 px-3 py-2 rounded-md" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-charcoal">Apellido</label>
            <input name="apellido" value={form.apellido} onChange={handleChange} className="w-full border border-rose-100 focus:border-rose-300 focus:ring-rose-200 px-3 py-2 rounded-md" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-charcoal">Familiaridad</label>
            <select
              name="familiaridad"
              value={form.familiaridad}
              onChange={handleChange}
              className="w-full border border-rose-100 focus:border-rose-300 focus:ring-rose-200 px-3 py-2 rounded-md bg-white"
            >
              <option value="">Selecciona una opción</option>
              <option value="FAMILIA NOVIA">FAMILIA NOVIA</option>
              <option value="FAMILIA NOVIO">FAMILIA NOVIO</option>
              <option value="AMIGOS">AMIGOS</option>
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={closeModal} className="px-4 py-2 border border-rose-200 text-charcoal rounded-md hover:bg-rose-50">Cancelar</button>
            <button type="submit" disabled={submitting} className="px-4 py-2 bg-rose-500 text-white rounded-md shadow hover:bg-rose-600 disabled:opacity-60">
              {submitting ? 'Creando...' : 'Crear'}
            </button>
          </div>
        </form>
      </Modal>

      <div className="flex flex-wrap justify-center">
        {filteredGuests.map(guest => (
          <GuestCard key={guest.id} guest={guest} onDelete={async (g) => {
            if (!window.confirm(`¿Eliminar a ${g.nombre} ${g.apellido}?`)) return;
            try {
              const resp = await fetch(`http://localhost:8000/api/guests/${g.id}`, { method: 'DELETE' });
              if (!resp.ok && resp.status !== 204) {
                throw new Error('No se pudo eliminar');
              }
              setGuests(prev => prev.filter(x => x.id !== g.id));
            } catch (e) {
              alert(e.message || 'Error al eliminar');
            }
          }} />
        ))}
      </div>
    </div>
  );
};

export default GuestList;
