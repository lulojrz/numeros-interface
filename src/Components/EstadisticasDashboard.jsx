import React, { useState, useEffect, useContext } from 'react';
import { NumerosContext } from '../context/NumerosContext';
import Swal from 'sweetalert2';
import { 
    PieChart, Pie, Cell, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
    BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';

const EstadisticasDashboard = () => {
    const { numeros } = useContext(NumerosContext);
    const [turnos, setTurnos] = useState([]);
    const [loading, setLoading] = useState(true);
    const api = import.meta.env.VITE_API_URL;
    
    const currentYear = new Date().getFullYear();
    const [yearSelected, setYearSelected] = useState(currentYear.toString());

    // --- Telefónica Stats ---
    const numerosContestados = numeros.filter(numero => numero.contesta);
    const totalNumeros = numeros.length;
    const progresoTelefonica = totalNumeros > 0 ? Math.round((numerosContestados.length / totalNumeros) * 100) : 0;
    const necesitaReinicio = progresoTelefonica >= 70;

    const dataPie = [
        { name: 'Contactados', value: numerosContestados.length },
        { name: 'Pendientes/No Contestan', value: totalNumeros - numerosContestados.length }
    ];
    const COLORS = ['#10b981', '#cbd5e1']; // green and light gray

    // --- Pública Stats ---
    useEffect(() => {
        const fetchTurnos = async () => {
            setLoading(true);
            try {
                const response = await fetch(`${api}/api/turnos/todos?year=${yearSelected}`, {
                    credentials: 'include'
                });
                if (response.ok) {
                    const data = await response.json();
                    setTurnos(data);
                } else {
                    Swal.fire('Error', 'No se pudieron cargar los turnos para estadísticas.', 'error');
                }
            } catch (error) {
                console.error("Error al cargar turnos", error);
            } finally {
                setLoading(false);
            }
        };

        fetchTurnos();
    }, [api, yearSelected]);

    const getPublicaStats = () => {
        const hoy = new Date();
        const mesActual = hoy.getMonth();
        const añoActual = hoy.getFullYear();

        const mesPasado = mesActual === 0 ? 11 : mesActual - 1;
        const añoMesPasado = mesActual === 0 ? añoActual - 1 : añoActual;

        let cubiertosEsteMes = 0;
        let cubiertosMesPasado = 0;
        
        // Puntos con menor asistencia: map de {nombrePunto: {ocupados, total}}
        const asistenciaPuntos = {};

        turnos.forEach(turno => {
            if (!turno.fecha) return;
            const [year, month] = turno.fecha.split('-').map(Number);
            const turnoDate = new Date(year, month - 1);
            const tMonth = turnoDate.getMonth();
            const tYear = turnoDate.getFullYear();

            // Calcular cubiertos (si tiene al menos un publicador)
            const cuposOcupados = (turno.publicador1 ? 1 : 0) + (turno.publicador2 ? 1 : 0);
            
            if (tYear === añoActual && tMonth === mesActual) {
                cubiertosEsteMes += cuposOcupados;
            } else if (tYear === añoMesPasado && tMonth === mesPasado) {
                cubiertosMesPasado += cuposOcupados;
            }

            // Calcular asistencia (turnos ocupados vs totales)
            if (turno.punto && turno.punto.nombre) {
                if (!asistenciaPuntos[turno.punto.nombre]) {
                    asistenciaPuntos[turno.punto.nombre] = { ocupados: 0, total: 0 };
                }
                asistenciaPuntos[turno.punto.nombre].ocupados += cuposOcupados > 0 ? 1 : 0; // Turno cubierto si hay al menos 1 persona
                asistenciaPuntos[turno.punto.nombre].total += 1; // 1 turno en total
            }
        });

        const dataMensual = [
            { name: 'Mes Pasado', 'Turnos Cubiertos': cubiertosMesPasado },
            { name: 'Este Mes', 'Turnos Cubiertos': cubiertosEsteMes }
        ];

        // Ordenar puntos por menor porcentaje de ocupación (menor asistencia)
        const dataPuntos = Object.keys(asistenciaPuntos)
            .map(nombre => {
                const p = asistenciaPuntos[nombre];
                const porcentaje = p.total > 0 ? Math.round((p.ocupados / p.total) * 100) : 0;
                return {
                    nombre,
                    porcentaje,
                    ocupados: p.ocupados,
                    total: p.total
                };
            })
            .sort((a, b) => a.porcentaje - b.porcentaje);

        return { dataMensual, dataPuntos };
    };

    const { dataMensual, dataPuntos } = getPublicaStats();

    if (loading) {
        return (
            <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Cargando métricas...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="container-fluid p-0 mt-4">
            
            <div className="d-flex justify-content-end mb-3">
                <div className="d-flex align-items-center bg-body rounded-pill px-3 py-1 shadow-sm border">
                    <i className="bi bi-calendar-event text-primary me-2"></i>
                    <span className="text-secondary fw-semibold me-2">Año de Estadísticas:</span>
                    <select 
                        className="form-select form-select-sm border-0 bg-transparent fw-bold text-primary p-0 pe-3" 
                        value={yearSelected} 
                        onChange={(e) => setYearSelected(e.target.value)}
                        style={{ width: 'auto', cursor: 'pointer', outline: 'none', boxShadow: 'none' }}
                    >
                        <option value={currentYear + 1}>{currentYear + 1}</option>
                        <option value={currentYear}>{currentYear}</option>
                        <option value={currentYear - 1}>{currentYear - 1}</option>
                        <option value={currentYear - 2}>{currentYear - 2}</option>
                    </select>
                </div>
            </div>
            
            {/* Alerta de Reinicio Telefónica */}
            {necesitaReinicio && (
                <div className="alert alert-warning d-flex align-items-center shadow-sm border-0 border-start border-warning border-5" role="alert">
                    <i className="bi bi-exclamation-triangle-fill fs-4 text-warning me-3"></i>
                    <div>
                        <h5 className="alert-heading fw-bold mb-1">¡Reinicio Recomendado!</h5>
                        <p className="mb-0">Se ha contactado al <strong>{progresoTelefonica}%</strong> de los territorios telefónicos. Se recomienda borrar el progreso o cargar nuevos territorios pronto.</p>
                    </div>
                </div>
            )}

            <div className="row g-4">
                {/* 1. Telefónica: Gráfico de Progreso */}
                <div className="col-12 col-xl-6">
                    <div className="card border-0 shadow-sm h-100" style={{ borderRadius: '1rem' }}>
                        <div className="card-body p-4">
                            <h5 className="card-title fw-bold text-primary mb-3">
                                <i className="bi bi-telephone-fill me-2"></i>
                                Progreso Telefónico
                            </h5>
                            
                            <div style={{ height: '300px', width: '100%', minWidth: 0 }}>
                                <ResponsiveContainer width="99%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={dataPie}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={100}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {dataPie.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <RechartsTooltip />
                                        <Legend verticalAlign="bottom" height={36}/>
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            
                            <div className="text-center mt-2">
                                <h2 className={`fw-bold ${necesitaReinicio ? 'text-warning' : 'text-success'}`}>
                                    {progresoTelefonica}%
                                </h2>
                                <span className="text-muted">Territorio Contactado</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. Pública: Comparativa Mensual */}
                <div className="col-12 col-md-6 col-xl-6">
                    <div className="card border-0 shadow-sm h-100" style={{ borderRadius: '1rem' }}>
                        <div className="card-body p-4">
                            <h5 className="card-title fw-bold text-success mb-3">
                                <i className="bi bi-bar-chart-line-fill me-2"></i>
                                Comparativa Mensual (Pública)
                            </h5>
                            <p className="text-muted small mb-4">Cantidad de cupos de turnos cubiertos.</p>
                            
                            <div style={{ height: '300px', width: '100%', minWidth: 0 }}>
                                <ResponsiveContainer width="99%" height="100%">
                                    <BarChart data={dataMensual} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} />
                                        <YAxis axisLine={false} tickLine={false} width={30} />
                                        <RechartsTooltip cursor={{fill: '#f8f9fa'}} />
                                        <Bar dataKey="Turnos Cubiertos" fill="#10b981" radius={[4, 4, 0, 0]} barSize={50} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 3. Pública: Puntos con Menos Asistencia */}
                <div className="col-12">
                    <div className="card border-0 shadow-sm" style={{ borderRadius: '1rem' }}>
                        <div className="card-body p-4">
                            <h5 className="card-title fw-bold text-danger mb-3">
                                <i className="bi bi-geo-alt-fill me-2"></i>
                                Puntos con Menor Asistencia (Histórico)
                            </h5>
                            <p className="text-muted small mb-4">Muestra los puntos con el porcentaje de ocupación más bajo a lo largo del tiempo.</p>
                            
                            {dataPuntos.length === 0 ? (
                                <div className="alert alert-light text-center">No hay datos suficientes.</div>
                            ) : (
                                <div className="table-responsive">
                                    <table className="table align-middle table-hover">
                                        <thead className="table-light">
                                            <tr>
                                                <th>Punto de Predicación</th>
                                                <th className="text-center">Porcentaje Ocupado</th>
                                                <th>Progreso</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {dataPuntos.map((punto, index) => (
                                                <tr key={index}>
                                                    <td className="fw-medium">{punto.nombre} <br/><small className="text-muted">{punto.ocupados} de {punto.total} turnos</small></td>
                                                    <td className="text-center">
                                                        <span className="badge bg-danger bg-opacity-10 text-danger border border-danger rounded-pill px-3 py-2">
                                                            {punto.porcentaje}%
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <div className="progress" style={{height: '8px'}}>
                                                            <div className="progress-bar bg-danger" role="progressbar" style={{width: `${punto.porcentaje}%`}}></div>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default EstadisticasDashboard;
