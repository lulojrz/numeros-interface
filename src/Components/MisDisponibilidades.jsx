import React, { useState, useEffect, useContext } from 'react';
import Swal from 'sweetalert2';
import { NumerosContext } from '../context/NumerosContext';

const MisDisponibilidades = () => {
    const usuarioId = localStorage.getItem('usuarioId');
    const api = import.meta.env.VITE_API_URL;
    const [disponibilidades, setDisponibilidades] = useState([]);
    const [loading, setLoading] = useState(true);

    const [diaSemana, setDiaSemana] = useState('Lunes');
    const [hora, setHora] = useState('10:00');

    const dias = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

    const Toast = Swal.mixin({
        toast: true, position: 'top-end', showConfirmButton: false, timer: 2000, timerProgressBar: true
    });

    const fetchDisponibilidades = async () => {
        if (!usuarioId) return;
        setLoading(true);
        try {
            const res = await fetch(`${api}/disponibilidades/usuario/${usuarioId}`, { credentials: 'include' });
            if (res.ok) setDisponibilidades(await res.json());
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDisponibilidades();
    }, [usuarioId]);

    const agregar = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`${api}/disponibilidades/agregar`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    diaSemana,
                    hora,
                    usuario: { id: usuarioId }
                })
            });
            if (res.ok) {
                Toast.fire({ icon: 'success', title: 'Agregado' });
                fetchDisponibilidades();
            } else {
                Toast.fire({ icon: 'error', title: 'Error' });
            }
        } catch (e) {
            console.error(e);
        }
    };

    const borrar = async (id) => {
        try {
            const res = await fetch(`${api}/disponibilidades/borrar/${id}`, { method: 'DELETE', credentials: 'include' });
            if (res.ok) {
                Toast.fire({ icon: 'success', title: 'Borrado' });
                fetchDisponibilidades();
            }
        } catch (e) {
            console.error(e);
        }
    };

    if (loading) return <div className="text-center mt-5"><div className="spinner-border text-primary"></div></div>;

    return (
        <div className="container mt-4 mb-5" style={{ maxWidth: '600px' }}>
            <h2 className="h4 text-primary fw-bold mb-4">
                <i className="bi bi-clock me-2"></i>Mis Días de Salida
            </h2>
            <div className="card shadow-sm border-0 mb-4">
                <div className="card-body">
                    <p className="text-muted small">Agrega los días y horarios fijos en los que puedes sacar salidas de predicación.</p>
                    <form onSubmit={agregar} className="row g-2 align-items-end">
                        <div className="col-12 col-sm-5">
                            <label className="form-label small fw-bold">Día</label>
                            <select className="form-select" value={diaSemana} onChange={e => setDiaSemana(e.target.value)}>
                                {dias.map(d => <option key={d} value={d}>{d}</option>)}
                            </select>
                        </div>
                        <div className="col-12 col-sm-5">
                            <label className="form-label small fw-bold">Hora</label>
                            <input type="time" className="form-control" required value={hora} onChange={e => setHora(e.target.value)} />
                        </div>
                        <div className="col-12 col-sm-2">
                            <button type="submit" className="btn btn-primary w-100 fw-bold">+</button>
                        </div>
                    </form>
                </div>
            </div>

            <div className="list-group shadow-sm">
                {disponibilidades.length === 0 ? (
                    <div className="list-group-item text-center text-muted py-4">No has agregado disponibilidades.</div>
                ) : (
                    disponibilidades.map(d => (
                        <div key={d.id} className="list-group-item d-flex justify-content-between align-items-center py-3">
                            <div>
                                <h6 className="fw-bold mb-0">{d.diaSemana}s</h6>
                                <span className="text-muted small"><i className="bi bi-clock me-1"></i>{d.hora} hs</span>
                            </div>
                            <button className="btn btn-sm btn-outline-danger" onClick={() => borrar(d.id)}>
                                <i className="bi bi-trash"></i>
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default MisDisponibilidades;
