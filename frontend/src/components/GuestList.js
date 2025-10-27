import React, { useState, useEffect } from 'react';
import GuestCard from './GuestCard';

const GuestList = () => {
  const [guests, setGuests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

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

      <div className="text-center mb-8">
        <p className="text-charcoal/80">
          Mostrando <strong>{filteredGuests.length}</strong> de <strong>{guests.length}</strong> invitados
        </p>
      </div>

      <div className="flex flex-wrap justify-center">
        {filteredGuests.map(guest => (
          <GuestCard key={guest.id} guest={guest} />
        ))}
      </div>
    </div>
  );
};

export default GuestList;
