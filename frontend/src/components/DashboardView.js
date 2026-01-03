import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Componente Dashboard principal
const DashboardView = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        invitados: { total: 0, confirmados: 0, pendientes: 0 },
        mesas: { total: 0, ocupadas: 0, capacidadTotal: 0, plazasOcupadas: 0 },
        gastos: { total: 0, pagado: 0, presupuesto: 25000 } // Presupuesto ejemplo
    });
    const [loading, setLoading] = useState(true);

    // Efecto para cargar datos de todas las APIs
    useEffect(() => {
        const fetchAllData = async () => {
            try {
                const [guestsRes, mesasRes, gastosRes] = await Promise.all([
                    fetch('http://localhost:8000/api/guests'),
                    fetch('http://localhost:8000/api/mesas'),
                    fetch('http://localhost:8000/api/gastos')
                ]);

                const guests = await guestsRes.json();
                const mesas = await mesasRes.json();
                const gastos = await gastosRes.json();

                // Calcular estadísticas de invitados
                const invitadosStats = {
                    total: guests.length,
                    confirmados: guests.filter(g => g.confirmado === 1).length,
                    pendientes: guests.filter(g => g.confirmado === 0).length
                };

                // Calcular estadísticas de mesas
                let capacidadTotal = 0;
                let plazasOcupadas = 0;
                mesas.forEach(m => {
                    capacidadTotal += m.capacidad;
                    plazasOcupadas += m.guests ? m.guests.length : 0;
                });

                // Calcular estadísticas de gastos
                const gastosTotal = gastos.reduce((acc, curr) => acc + parseFloat(curr.total), 0);
                const gastosPagado = gastos.filter(g => g.pagado).reduce((acc, curr) => acc + parseFloat(curr.total), 0);

                setStats({
                    invitados: invitadosStats,
                    mesas: {
                        total: mesas.length,
                        capacidadTotal,
                        plazasOcupadas
                    },
                    gastos: {
                        total: gastosTotal,
                        pagado: gastosPagado,
                        presupuesto: 25000 // Podría ser dinámico en futuro
                    }
                });
            } catch (error) {
                console.error("Error cargando dashboard:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchAllData();
    }, []);

    // Cálculo de tiempo restante (traído de App.js pero local para display grande)
    const [timeLeft, setTimeLeft] = useState({});

    useEffect(() => {
        const calculateTimeLeft = () => {
            const difference = +new Date('2027-10-16T00:00:00') - +new Date();
            let newTimeLeft = {};
            if (difference > 0) {
                newTimeLeft = {
                    días: Math.floor(difference / (1000 * 60 * 60 * 24)),
                    horas: Math.floor((difference / (1000 * 60 * 60)) % 24),
                    minutos: Math.floor((difference / 1000 / 60) % 60),
                };
            }
            return newTimeLeft;
        };
        const timer = setInterval(() => setTimeLeft(calculateTimeLeft()), 1000);
        return () => clearInterval(timer);
    }, []);

    if (loading) return <div className="p-8 text-center text-rose-gold">Cargando resumen de tu boda...</div>;

    return (
        <div className="p-8 h-full overflow-y-auto bg-cream">
            {/* Cabecera con Cuenta Atrás */}
            <div className="bg-gradient-to-r from-rose-gold to-rose-gold-dark text-white rounded-2xl p-8 mb-8 shadow-xl text-center transform hover:scale-[1.01] transition-all">
                <h1 className="text-4xl md:text-5xl font-script mb-4">Faltan</h1>
                <div className="flex justify-center gap-8 md:gap-16">
                    <div className="flex flex-col animate-fadeIn">
                        <span className="text-4xl md:text-6xl font-bold">{timeLeft.días || 0}</span>
                        <span className="text-sm uppercase tracking-widest opacity-80">Días</span>
                    </div>
                    <div className="flex flex-col animate-fadeIn delay-100">
                        <span className="text-4xl md:text-6xl font-bold">{timeLeft.horas || 0}</span>
                        <span className="text-sm uppercase tracking-widest opacity-80">Horas</span>
                    </div>
                    <div className="flex flex-col animate-fadeIn delay-200">
                        <span className="text-4xl md:text-6xl font-bold">{timeLeft.minutos || 0}</span>
                        <span className="text-sm uppercase tracking-widest opacity-80">Minutos</span>
                    </div>
                </div>
                <p className="mt-6 text-lg font-light italic opacity-90">"El amor no hace que el mundo gire, hace que el viaje valga la pena."</p>
            </div>

            {/* Grid de KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {/* Card Invitados */}
                <div
                    onClick={() => navigate('/guests')}
                    className="glass-card p-6 cursor-pointer hover:shadow-2xl transition-all group"
                >
                    <div className="flex justify-between items-start mb-4">
                        <h3 className="text-xl font-bold text-charcoal group-hover:text-rose-gold transition-colors">Invitados</h3>
                        <span className="text-3xl">👥</span>
                    </div>
                    <div className="text-4xl font-bold text-charcoal mb-2">{stats.invitados.total}</div>
                    <div className="flex justify-between text-sm">
                        <span className="text-green-600 font-medium">✨ {stats.invitados.confirmados} Confirmados</span>
                        <span className="text-charcoal/50">⏳ {stats.invitados.pendientes} Pendientes</span>
                    </div>
                    <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
                        <div
                            className="bg-rose-gold h-2 rounded-full transition-all duration-1000"
                            style={{ width: `${(stats.invitados.confirmados / (stats.invitados.total || 1)) * 100}%` }}
                        ></div>
                    </div>
                </div>

                {/* Card Mesas */}
                <div
                    onClick={() => navigate('/tables')}
                    className="glass-card p-6 cursor-pointer hover:shadow-2xl transition-all group"
                >
                    <div className="flex justify-between items-start mb-4">
                        <h3 className="text-xl font-bold text-charcoal group-hover:text-rose-gold transition-colors">Mesas</h3>
                        <span className="text-3xl">🪑</span>
                    </div>
                    <div className="text-4xl font-bold text-charcoal mb-2">{stats.mesas.total} <span className="text-lg font-normal text-charcoal/50">mesas</span></div>
                    <div className="text-sm text-charcoal/70 mb-2">
                        {stats.mesas.plazasOcupadas} de {stats.mesas.capacidadTotal} asientos ocupados
                    </div>
                    <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
                        <div
                            className="bg-sage h-2 rounded-full transition-all duration-1000"
                            style={{ width: `${(stats.mesas.plazasOcupadas / (stats.mesas.capacidadTotal || 1)) * 100}%` }}
                        ></div>
                    </div>
                </div>

                {/* Card Presupuesto */}
                <div
                    onClick={() => navigate('/gastos')}
                    className="glass-card p-6 cursor-pointer hover:shadow-2xl transition-all group"
                >
                    <div className="flex justify-between items-start mb-4">
                        <h3 className="text-xl font-bold text-charcoal group-hover:text-rose-gold transition-colors">Presupuesto</h3>
                        <span className="text-3xl">💰</span>
                    </div>
                    <div className="text-3xl font-bold text-charcoal mb-1">{stats.gastos.total.toLocaleString('es-ES')}€</div>
                    <div className="text-xs text-charcoal/50 mb-3">Gastado de {stats.gastos.presupuesto.toLocaleString('es-ES')}€</div>

                    <div className="flex justify-between text-sm mb-1">
                        <span className="text-charcoal">Pagado: {stats.gastos.pagado.toLocaleString('es-ES')}€</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                            className="bg-green-500 h-2 rounded-full transition-all duration-1000"
                            style={{ width: `${(stats.gastos.pagado / (stats.gastos.total || 1)) * 100}%` }}
                        ></div>
                    </div>
                </div>
            </div>

            {/* Accesos Rápidos */}
            <h2 className="text-2xl font-bold text-charcoal mb-4">Accesos Rápidos</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <button onClick={() => navigate('/seating')} className="bg-white p-4 rounded-xl shadow hover:shadow-lg transition-all border border-rose-water hover:border-rose-gold group text-left">
                    <span className="text-2xl mb-2 block group-hover:scale-110 transition-transform origin-left">📐</span>
                    <h4 className="font-bold text-rose-gold">Diseñar Plano</h4>
                    <p className="text-xs text-charcoal/60">Mover mesas</p>
                </button>
                <button onClick={() => navigate('/guests')} className="bg-white p-4 rounded-xl shadow hover:shadow-lg transition-all border border-rose-water hover:border-rose-gold group text-left">
                    <span className="text-2xl mb-2 block group-hover:scale-110 transition-transform origin-left">➕</span>
                    <h4 className="font-bold text-rose-gold">Añadir Invitado</h4>
                    <p className="text-xs text-charcoal/60">Registrar nuevo</p>
                </button>
                <button onClick={() => navigate('/gastos')} className="bg-white p-4 rounded-xl shadow hover:shadow-lg transition-all border border-rose-water hover:border-rose-gold group text-left">
                    <span className="text-2xl mb-2 block group-hover:scale-110 transition-transform origin-left">💸</span>
                    <h4 className="font-bold text-rose-gold">Nuevo Gasto</h4>
                    <p className="text-xs text-charcoal/60">Registrar pago</p>
                </button>
                <button onClick={() => navigate('/cronograma')} className="bg-white p-4 rounded-xl shadow hover:shadow-lg transition-all border border-rose-water hover:border-rose-gold group text-left">
                    <span className="text-2xl mb-2 block group-hover:scale-110 transition-transform origin-left">📅</span>
                    <h4 className="font-bold text-rose-gold">Cronograma</h4>
                    <p className="text-xs text-charcoal/60">Ver eventos</p>
                </button>
            </div>
        </div>
    );
};

export default DashboardView;
