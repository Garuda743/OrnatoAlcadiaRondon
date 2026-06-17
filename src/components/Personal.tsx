import React, { useState } from 'react';
import { Worker } from '../types';
import { Users, Plus, Trash2, Edit3, ArrowRight, UserCheck, ShieldAlert, CheckSquare } from 'lucide-react';

interface PersonalProps {
  workers: Worker[];
  onAddWorker: (worker: Worker) => void;
  onUpdateWorker: (worker: Worker) => void;
  onDeleteWorker: (id: string) => void;
}

const BRIGADES = [
  'Barrido y Limpieza',
  'Poda y Tala',
  'Jardinería',
  'Pintura y Herrería',
  'Vivero y Producción'
];

export default function Personal({ workers, onAddWorker, onUpdateWorker, onDeleteWorker }: PersonalProps) {
  // New employee state
  const [cedula, setCedula] = useState('');
  const [name, setName] = useState('');
  const [brigade, setBrigade] = useState('Barrido y Limpieza');
  const [status, setStatus] = useState<Worker['status']>('Activo');
  const [notes, setNotes] = useState('');

  // Selected workers for mass operations
  const [checkedWorkerIds, setCheckedWorkerIds] = useState<string[]>([]);
  // Mass update state triggers
  const [massBrigade, setMassBrigade] = useState('Barrido y Limpieza');
  const [massStatus, setMassStatus] = useState<Worker['status']>('Activo');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cedula.trim() || !name.trim()) {
      alert('Por favor complete la Cédula y el Nombre completo del trabajador.');
      return;
    }

    // Check if worker already exists with that Cédula
    const exists = workers.some(w => w.cedula === cedula.trim() && w.name === name.trim().toUpperCase());
    if (exists) {
      alert('Ya existe un trabajador registrado con estas credenciales.');
      return;
    }

    const newWorker: Worker = {
      id: `w_usr_${Date.now()}`,
      cedula: cedula.trim(),
      name: name.trim().toUpperCase(),
      brigade: brigade as Worker['brigade'],
      status,
      notes: notes.trim() ? notes : undefined
    };

    onAddWorker(newWorker);
    
    // Clear
    setCedula('');
    setName('');
    setNotes('');

    alert('Trabajador incorporado exitosamente a la Coordinación de Ornato.');
  };

  const toggleCheckedWorker = (id: string) => {
    if (checkedWorkerIds.includes(id)) {
      setCheckedWorkerIds(checkedWorkerIds.filter(item => item !== id));
    } else {
      setCheckedWorkerIds([...checkedWorkerIds, id]);
    }
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setCheckedWorkerIds(workers.map(w => w.id));
    } else {
      setCheckedWorkerIds([]);
    }
  };

  const handleMassUpdate = () => {
    if (checkedWorkerIds.length === 0) {
      alert('Por favor seleccione al menos un trabajador para la edición masiva.');
      return;
    }

    checkedWorkerIds.forEach(id => {
      const worker = workers.find(w => w.id === id);
      if (worker) {
        onUpdateWorker({
          ...worker,
          brigade: massBrigade as Worker['brigade'],
          status: massStatus
        });
      }
    });

    setCheckedWorkerIds([]);
    alert(`Edición Masiva Guardada: Se actualizaron ${checkedWorkerIds.length} trabajadores a la brigada ${massBrigade} con estado ${massStatus}.`);
  };

  return (
    <div className="space-y-6 text-xs">
      
      {/* Intro section detail */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="space-y-1.5 text-center md:text-left">
          <h2 className="text-base font-bold text-slate-900 font-display flex items-center justify-center md:justify-start gap-2">
            <Users className="w-5 h-5 text-emerald-800" />
            Panel de Cuadrillas & Personal de Labores
          </h2>
          <p className="text-xs text-slate-500">
            Ficha oficial para dar de baja, incorporar obreros o agrupar brigadas operativas en las Mercedes del Llano
          </p>
        </div>
        <div className="text-[11px] font-bold text-slate-500 bg-slate-100 border px-3 py-1.5 rounded-lg flex items-center gap-1">
          Obreros en Nómina: <span className="font-mono text-xs font-black text-emerald-800">{workers.length}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Register New Worker */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <div className="border-b pb-2">
            <h3 className="font-bold text-slate-900 font-display text-sm">Registrar Nuevo Obrero</h3>
            <p className="text-[10px] text-slate-500">Incorporación de personal de campo</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="font-bold text-slate-700 block">Cédula de Identidad (C.I.):</label>
              <input
                type="text"
                value={cedula}
                onChange={(e) => setCedula(e.target.value)}
                placeholder="Ej., V14056328"
                className="w-full border rounded-lg p-2 focus:ring-1 focus:ring-emerald-750 outline-none font-mono font-bold"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700 block">Nombre Completo:</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej., Juan Pérez"
                className="w-full border rounded-lg p-2 focus:ring-1 focus:ring-emerald-750 outline-none uppercase font-semibold"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">Área / Funciones:</label>
                <select
                  value={brigade}
                  onChange={(e) => setBrigade(e.target.value)}
                  className="w-full border rounded-lg p-2 focus:ring-1 focus:ring-emerald-750 outline-none bg-white font-medium"
                >
                  {BRIGADES.map(b => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">Estatus Inicial:</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as Worker['status'])}
                  className="w-full border rounded-lg p-2 focus:ring-1 focus:ring-emerald-750 outline-none bg-white font-medium"
                >
                  <option value="Activo">Activo</option>
                  <option value="Reposo">Reposo Médico</option>
                  <option value="Vacaciones">Vacaciones</option>
                  <option value="Movido">Movido Dep.</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700 block">Notas de Expediente (Opcional):</label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ej., Reposo de rodilla válido hasta fin de mes"
                className="w-full border rounded-lg p-2 focus:ring-1 focus:ring-emerald-750 outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-emerald-800 hover:bg-emerald-900 text-white font-bold py-2 rounded-lg transition"
            >
              Dar de Alta Trabajador
            </button>
          </form>
        </div>

        {/* Right Columns: Workers list and Mass editor */}
        <div className="lg:col-span-2 space-y-4 text-xs font-sans">
          
          {/* MASS GROUP EDIT TOOL ("Edición masiva de los turnos asignados") */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4.5 space-y-3">
            <div className="flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-emerald-800" />
              <div>
                <h4 className="font-bold text-slate-900 font-display">Edición y Agrupación Masiva de Personal</h4>
                <p className="text-[10px] text-slate-500">Agrupe personal en diferentes funciones o asigne estatus simultáneamente para optimizar el tiempo de campo</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center pt-1.5">
              <div className="space-y-1">
                <label className="font-bold text-slate-650 block">Reasignar Brigada:</label>
                <select
                  value={massBrigade}
                  onChange={(e) => setMassBrigade(e.target.value)}
                  className="w-full border rounded bg-white p-1.5 font-medium outline-none"
                >
                  {BRIGADES.map(b => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-650 block">Reasignar Estatus:</label>
                <select
                  value={massStatus}
                  onChange={(e) => setMassStatus(e.target.value as Worker['status'])}
                  className="w-full border rounded bg-white p-1.5 font-medium outline-none"
                >
                  <option value="Activo">Activo</option>
                  <option value="Reposo">Reposo Médico</option>
                  <option value="Vacaciones">Vacaciones</option>
                  <option value="Movido">Movido Dependencia</option>
                </select>
              </div>

              <div className="pt-4">
                <button
                  onClick={handleMassUpdate}
                  className="w-full bg-slate-800 hover:bg-slate-900 text-white font-black py-2 rounded shadow-sm text-[10px]"
                >
                  Aplicar a Seleccionados ({checkedWorkerIds.length})
                </button>
              </div>
            </div>
          </div>

          {/* Workers list table matrix */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 overflow-hidden space-y-3">
            <div className="flex items-center justify-between border-b pb-2">
              <span className="font-bold text-slate-700 uppercase tracking-widest font-display text-[10px]">
                Nómina Oficial Coordinación Ornato
              </span>
              <span className="text-[10px] text-slate-400">Marque casillas para edición en masa</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-250 font-display text-slate-800">
                    <th className="p-2 border-r text-center w-10">
                      <input 
                        type="checkbox"
                        checked={checkedWorkerIds.length === workers.length && workers.length > 0}
                        onChange={handleSelectAll}
                        className="rounded cursor-pointer"
                      />
                    </th>
                    <th className="p-2 border-r font-bold">Cédula</th>
                    <th className="p-2 border-r font-bold">Nombre Completo</th>
                    <th className="p-2 border-r font-bold">Brigada de Despliegue</th>
                    <th className="p-2 border-r font-bold text-center">Estado</th>
                    <th className="p-2 font-bold text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {workers.map((worker) => {
                    const isChecked = checkedWorkerIds.includes(worker.id);
                    return (
                      <tr 
                        key={worker.id} 
                        className={`hover:bg-slate-50/50 ${
                          isChecked ? 'bg-emerald-50/20' : ''
                        }`}
                      >
                        <td className="p-2 border-r text-center py-2.5">
                          <input 
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => toggleCheckedWorker(worker.id)}
                            className="rounded cursor-pointer"
                          />
                        </td>
                        <td className="p-2 border-r font-mono font-bold text-slate-800">
                          {worker.cedula}
                        </td>
                        <td className="p-2 border-r font-bold text-slate-900">
                          {worker.name}
                        </td>
                        <td className="p-2 border-r font-medium text-slate-700">
                          {worker.brigade}
                        </td>
                        <td className="p-2 border-r text-center">
                          <span className={`inline-block text-[9px] font-bold px-2 py-0.5 rounded-full ${
                            worker.status === 'Activo' ? 'bg-emerald-100 text-emerald-850' :
                            worker.status === 'Reposo' ? 'bg-red-100 text-red-850' :
                            worker.status === 'Vacaciones' ? 'bg-purple-100 text-purple-850' :
                            'bg-amber-100 text-amber-850'
                          }`}>
                            {worker.status}
                          </span>
                        </td>
                        <td className="p-2 text-center">
                          <button
                            onClick={() => {
                              if (confirm(`¿Está seguro de remover a ${worker.name} de la coordinación de ornato?`)) {
                                onDeleteWorker(worker.id);
                              }
                            }}
                            className="text-slate-400 hover:text-red-500 font-bold hover:underline"
                          >
                            Remover
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="bg-slate-50 border border-slate-150 p-2 rounded text-[10px] text-slate-500 italic block">
              Nota: Alterar el estatus de un obrero (ej. marcar como Reposo) restringe su asiganción a planificaciones activas en tiempo real.
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
