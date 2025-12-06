import React, { useState, useEffect } from 'react';

const GastosView = () => {
    const [gastos, setGastos] = useState([]);
    const [gastoActual, setGastoActual] = useState({ id: null, nombre: '', total: '', pagado: false });
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    const API_URL = 'http://localhost:8000/api/gastos';

    // Cargar gastos desde la API
    useEffect(() => {
        const fetchGastos = async () => {
            try {
                const response = await fetch(API_URL);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                if (Array.isArray(data)) {
                    setGastos(data);
                } else {
                    setGastos([]); // Asegurarse de que gastos sea siempre un array
                }
            } catch {
                setGastos([]); // En caso de error, asegurar que gastos sea un array vacío
            }
        };
        fetchGastos();
    }, []);

    const totalGastos = Array.isArray(gastos) ? gastos.reduce((acc, gasto) => acc + parseFloat(gasto.total || 0), 0) : 0;

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setGastoActual({ ...gastoActual, [name]: type === 'checkbox' ? checked : value });
    };

    const handleCrearGasto = () => {
        setIsEditing(false);
        setGastoActual({ id: null, nombre: '', total: '', pagado: false });
        setIsModalOpen(true);
    };

    const handleEditarGasto = (gasto) => {
        setIsEditing(true);
        setGastoActual(gasto);
        setIsModalOpen(true);
    };

    const handleGuardarGasto = () => {
        const method = isEditing ? 'PUT' : 'POST';
        const url = isEditing ? `${API_URL}/${gastoActual.id}` : API_URL;

        fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(gastoActual),
        })
            .then(response => response.json())
            .then(data => {
                if (isEditing) {
                    setGastos(gastos.map(g => (g.id === data.id ? data : g)));
                } else {
                    setGastos([...gastos, data]);
                }
                setIsModalOpen(false);
            });
    };

    const handleEliminarGasto = (id) => {
        fetch(`${API_URL}/${id}`, { method: 'DELETE' })
            .then(response => {
                if (response.ok) {
                    setGastos(gastos.filter(g => g.id !== id));
                }
            });
    };

    return (
        <div className="container mx-auto p-4 md:p-8">
            <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
                <h1 className="text-5xl font-script text-rose-gold drop-shadow-sm">Control de Gastos</h1>
                <button
                    onClick={handleCrearGasto}
                    className="bg-rose-gold text-white px-6 py-3 rounded-full shadow-lg hover:bg-rose-gold-dark transition-all transform hover:scale-105 font-bold tracking-wide"
                >
                    + Añadir Nuevo Gasto
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                {gastos.map((gasto) => (
                    <div key={gasto.id} className="glass-card p-6 relative group hover:shadow-2xl transition-all duration-300">
                        <div className="flex justify-between items-start mb-4">
                            <h3 className={`text-xl font-bold text-charcoal/90 ${gasto.pagado ? 'line-through opacity-50' : ''}`}>
                                {gasto.nombre}
                            </h3>
                            <span className={`text-lg font-bold ${gasto.pagado ? 'text-green-600' : 'text-rose-gold'}`}>
                                €{parseFloat(gasto.total).toFixed(2)}
                            </span>
                        </div>

                        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                            <button
                                onClick={() => handleEditarGasto(gasto)}
                                className="text-blue-500 hover:text-blue-700 bg-white/80 rounded-full p-2 shadow-sm"
                                title="Editar"
                            >
                                ✏️
                            </button>
                            <button
                                onClick={() => handleEliminarGasto(gasto.id)}
                                className="text-red-500 hover:text-red-700 bg-white/80 rounded-full p-2 shadow-sm"
                                title="Eliminar"
                            >
                                🗑️
                            </button>
                        </div>

                        <div className="mt-4 pt-4 border-t border-rose-water flex justify-between items-center">
                            <span className="text-xs text-charcoal/60 uppercase tracking-wider font-semibold">Estado</span>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${gasto.pagado ? 'bg-green-100 text-green-700' : 'bg-rose-100 text-rose-gold'}`}>
                                {gasto.pagado ? 'PAGADO' : 'PENDIENTE'}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Total Card */}
            <div className="fixed bottom-8 right-8 z-30">
                <div className="glass-card p-6 bg-gradient-to-r from-rose-gold to-rose-gold-dark text-white border-none shadow-2xl transform hover:scale-105 transition-transform">
                    <p className="text-sm uppercase tracking-widest opacity-90 mb-1">Total Estimado</p>
                    <h2 className="text-4xl font-bold">€{totalGastos.toFixed(2)}</h2>
                </div>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md border-t-8 border-rose-gold animate-fadeIn">
                        <h2 className="text-3xl font-script text-center text-charcoal mb-6">{isEditing ? 'Editar Gasto' : 'Nuevo Gasto'}</h2>
                        <form>
                            <div className="mb-6">
                                <label className="block text-charcoal/70 text-sm font-bold mb-2 uppercase tracking-wide" htmlFor="nombre">
                                    Concepto
                                </label>
                                <input
                                    type="text"
                                    name="nombre"
                                    id="nombre"
                                    value={gastoActual.nombre}
                                    onChange={handleInputChange}
                                    className="input-field"
                                    placeholder="Ej: Floristería"
                                />
                            </div>
                            <div className="mb-6">
                                <label className="block text-charcoal/70 text-sm font-bold mb-2 uppercase tracking-wide" htmlFor="total">
                                    Costo (€)
                                </label>
                                <input
                                    type="number"
                                    name="total"
                                    id="total"
                                    value={gastoActual.total}
                                    onChange={handleInputChange}
                                    className="input-field"
                                    placeholder="0.00"
                                    min="0"
                                />
                            </div>
                            <div className="mb-8 flex items-center">
                                <input
                                    type="checkbox"
                                    name="pagado"
                                    id="pagado"
                                    checked={gastoActual.pagado || false}
                                    onChange={handleInputChange}
                                    className="w-5 h-5 text-rose-gold border-gray-300 rounded focus:ring-rose-gold"
                                />
                                <label className="ml-3 block text-charcoal font-medium" htmlFor="pagado">
                                    Marcar como pagado
                                </label>
                            </div>
                            <div className="flex items-center justify-end gap-4">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="text-charcoal/60 hover:text-charcoal font-bold py-2 px-4 transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="button"
                                    onClick={handleGuardarGasto}
                                    className="bg-rose-gold hover:bg-rose-gold-dark text-white font-bold py-3 px-8 rounded-lg shadow-lg transform transition hover:-translate-y-1"
                                >
                                    Guardar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GastosView;