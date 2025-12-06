import React, { useState, useEffect, useCallback } from 'react';
import Modal from './Modal'; // Importar el componente Modal

const CronogramaView = () => {
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Estado para el modal y el formulario
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvento, setEditingEvento] = useState(null);
  const [formData, setFormData] = useState({ hora: '', evento: '' });

  const API_URL = 'http://localhost:8000/api/eventos';

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error('La respuesta de la red no fue correcta');
      const data = await response.json();
      setEventos(data);
      setError(null);
    } catch (error) {
      console.error("Error al obtener los eventos:", error);
      setError('No se pudieron cargar los eventos.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleOpenModal = (evento = null) => {
    if (evento) {
      setEditingEvento(evento);
      setFormData({ hora: evento.hora.substring(0, 5), evento: evento.evento });
    } else {
      setEditingEvento(null);
      setFormData({ hora: '', evento: '' });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingEvento(null);
    setFormData({ hora: '', evento: '' });
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const method = editingEvento ? 'PUT' : 'POST';
    const url = editingEvento ? `${API_URL}/${editingEvento.id}` : API_URL;

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al guardar el evento');
      }

      handleCloseModal();
      fetchData(); // Recargar los eventos
    } catch (error) {
      console.error("Error al enviar el formulario:", error);
      setError(error.message);
    }
  };

  const handleDeleteEvento = async (id) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este evento?')) {
      try {
        const response = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
        if (!response.ok) throw new Error('Error al eliminar el evento');
        fetchData(); // Recargar
      } catch (error) {
        console.error("Error al eliminar:", error);
        setError('No se pudo eliminar el evento.');
      }
    }
  };

  if (loading) return <div className="text-center p-8">Cargando cronograma...</div>;
  if (error) return <div className="text-center text-red-500 p-8">{error}</div>;

  return (
    <div className="container mx-auto p-4 md:p-12 min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-center mb-16">
        <h1 className="text-6xl font-script text-rose-gold mb-6 md:mb-0">Nuestro Día</h1>
        <button
          onClick={() => handleOpenModal()}
          className="btn-primary"
        >
          + Añadir Evento
        </button>
      </div>

      <div className="relative max-w-4xl mx-auto">
        {/* Línea central del timeline */}
        <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-0.5 bg-rose-gold/30 -ml-0.5 md:ml-0"></div>

        <div className="space-y-12">
          {eventos.map((evento, index) => (
            <div key={evento.id} className={`flex items-center ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} flex-row relative group`}>

              {/* Dot del timeline */}
              <div className="absolute left-8 md:left-1/2 w-4 h-4 bg-white border-4 border-rose-gold rounded-full transform -translate-x-1/2 z-10 group-hover:scale-150 transition-transform duration-300"></div>

              {/* Contenido (Hora) */}
              <div className={`w-full md:w-1/2 pl-20 md:pl-0 ${index % 2 === 0 ? 'md:pr-12 md:text-right' : 'md:pl-12 md:text-left'} mb-2 md:mb-0`}>
                <span className="inline-block px-4 py-1 bg-rose-water/50 text-rose-gold font-bold rounded-full text-sm mb-2 shadow-sm">
                  {evento.hora.substring(0, 5)}
                </span>
              </div>

              {/* Contenido (Tarjeta) */}
              <div className={`w-full md:w-1/2 pl-20 md:pl-0 ${index % 2 === 0 ? 'md:pl-12' : 'md:pr-12'} `}>
                <div className="glass-card p-6 hover:shadow-2xl transition-all duration-300 transform group-hover:-translate-y-1 cursor-default relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-rose-gold"></div>
                  <h3 className="text-2xl font-bold text-charcoal mb-1">{evento.evento}</h3>

                  <div className="mt-4 flex gap-3 opacity-0 group-hover:opacity-100 transition-opacity justify-end md:justify-start">
                    <button onClick={() => handleOpenModal(evento)} className="text-sm font-bold text-rose-gold hover:underline">EDITAR</button>
                    <button onClick={() => handleDeleteEvento(evento.id)} className="text-sm font-bold text-charcoal/40 hover:text-red-500">ELIMINAR</button>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {eventos.length === 0 && (
            <div className="text-center py-20 text-charcoal/50 italic">
              Aún no hay eventos en el cronograma. ¡Empieza a planificar tu gran día!
            </div>
          )}
        </div>
      </div>

      {/* Modal Reutilizable con estilo actualizado */}
      <Modal isOpen={isModalOpen} onClose={handleCloseModal}>
        <h2 className="text-4xl font-script text-center text-rose-gold mb-8">{editingEvento ? 'Editar Momento' : 'Nuevo Momento'}</h2>
        <form onSubmit={handleFormSubmit} className="space-y-6">
          <div>
            <label htmlFor="hora" className="block text-charcoal/80 font-bold mb-2 uppercase text-xs tracking-wider">Hora</label>
            <input
              type="time"
              id="hora"
              name="hora"
              value={formData.hora}
              onChange={handleFormChange}
              className="input-field text-lg"
              required
            />
          </div>
          <div>
            <label htmlFor="evento" className="block text-charcoal/80 font-bold mb-2 uppercase text-xs tracking-wider">Descripción</label>
            <input
              type="text"
              id="evento"
              name="evento"
              value={formData.evento}
              onChange={handleFormChange}
              className="input-field text-lg"
              placeholder="Ej: Ceremonia Civil"
              required
            />
          </div>
          <div className="flex justify-end pt-4 gap-4">
            <button type="button" onClick={handleCloseModal} className="text-charcoal/60 hover:text-charcoal font-bold px-4">Cancelar</button>
            <button type="submit" className="btn-primary">
              {editingEvento ? 'Guardar Cambios' : 'Añadir al Cronograma'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default CronogramaView;
