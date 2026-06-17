import React, { useState } from 'react';
import { Worker, VacationPeriod } from '../types';
import { Calendar, Plus, Trash2, ArrowRightLeft, BookOpen, AlertCircle, Info, Sparkles, CheckCircle2 } from 'lucide-react';

interface VacacionesProps {
  workers: Worker[];
  vacations: VacationPeriod[];
  onAddVacation: (vacation: Omit<VacationPeriod, 'id'>) => void;
  onUpdateVacation: (vacation: VacationPeriod) => void;
  onDeleteVacation: (id: string) => void;
  onUpdateWorkerStatus: (id: string, status: Worker['status']) => void;
}

export default function Vacaciones({ workers, vacations, onAddVacation, onUpdateVacation, onDeleteVacation, onUpdateWorkerStatus }: VacacionesProps) {
  // New vacation form state
  const [workerId, setWorkerId] = useState<string>('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [incorporationDate, setIncorporationDate] = useState('');
  const [notes, setNotes] = useState('');

  // Active filter tab
  const [activeTab, setActiveTab] = useState<'Todas' | 'Activas' | 'Planificadas' | 'Incorporado'>('Todas');

  const handleWorkerChange = (wId: string) => {
    setWorkerId(wId);
    // Autofill dates based on typical duration: 15 working days is roughly 20 calendar days
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    setStartDate(todayStr);

    const end = new Date(today);
    end.setDate(end.getDate() + 20);
    setEndDate(end.toISOString().split('T')[0]);

    const incorp = new Date(end);
    incorp.setDate(incorp.getDate() + 1);
    setIncorporationDate(incorp.toISOString().split('T')[0]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!workerId || !startDate || !endDate || !incorporationDate) {
      alert('Por favor complete todos los datos del formulario de vacaciones.');
      return;
    }

    onAddVacation({
      workerId,
      startDate,
      endDate,
      incorporationDate,
      status: 'Planificada',
      notes: notes.trim() ? notes : undefined
    });

    // Reset form
    setWorkerId('');
    setStartDate('');
    setEndDate('');
    setIncorporationDate('');
    setNotes('');

    alert('Periodo de vacaciones planificado exitosamente.');
  };

  // Mark vacation as active and change worker state to 'Vacaciones' dynamically
  const activateVacation = (vacation: VacationPeriod) => {
    const updatedVac: VacationPeriod = {
      ...vacation,
      status: 'Activa'
    };
    onUpdateVacation(updatedVac);
    onUpdateWorkerStatus(vacation.workerId, 'Vacaciones');
    alert(`Vacaciones activadas. El estatus del obrero se actualizó a "Vacaciones" automáticamente.`);
  };

  // Incorporate worker back to work and change status to 'Activo'
  const incorporateWorker = (vacation: VacationPeriod) => {
    const updatedVac: VacationPeriod = {
      ...vacation,
      status: 'Incorporado'
    };
    onUpdateVacation(updatedVac);
    onUpdateWorkerStatus(vacation.workerId, 'Activo');
    alert(`Obrero reincorporado a las labores ordinarias. El estatus del obrero se actualizó a "Activo" automáticamente.`);
  };

  const filteredVacations = vacations.filter(v => {
    if (activeTab === 'Todas') return true;
    if (activeTab === 'Activas') return v.status === 'Activa';
    if (activeTab === 'Planificadas') return v.status === 'Planificada';
    return v.status === 'Incorporado';
  });

  return (
    <div className="space-y-6">
      
      {/* Module introduction banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center md:text-left">
          <h2 className="text-base font-bold text-slate-900 font-display">Control de Vacaciones y Reincorporaciones</h2>
          <p className="text-xs text-slate-500">Planifique el disfrute vacacional anual y automatice alertas de retorno de labores del personal de ornato</p>
        </div>
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] md:text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1">
          <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
          Sincronización automática de estatus laborales activa
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left column: Add/Plan Vacation form */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <div className="border-b pb-2">
            <h3 className="font-bold text-slate-900 font-display text-sm">Planificar Periodo Vacacional</h3>
            <p className="text-[10px] text-slate-500">Apertura de expediente vacacional para obrero de Ornato</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            
            <div className="space-y-1">
              <label className="font-bold text-slate-700 block">Seleccione el Obrero:</label>
              <select
                value={workerId}
                onChange={(e) => handleWorkerChange(e.target.value)}
                className="w-full border rounded-lg p-2 focus:ring-1 focus:ring-emerald-750 outline-none bg-white font-medium"
                required
              >
                <option value="">-- Seleccionar Obrero --</option>
                {workers.map(w => (
                  <option key={w.id} value={w.id}>
                    {w.name} (C.I: {w.cedula} • {w.status})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">Fecha Inicio:</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full border rounded-lg p-1.5 focus:ring-1 focus:ring-emerald-750 outline-none font-mono"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">Fecha Termina:</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full border rounded-lg p-1.5 focus:ring-1 focus:ring-emerald-750 outline-none font-mono"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-750 block">Fecha Incorporación Labores:</label>
              <input
                type="date"
                value={incorporationDate}
                onChange={(e) => setIncorporationDate(e.target.value)}
                className="w-full border rounded-lg p-2 focus:ring-1 focus:ring-emerald-750 outline-none font-mono font-bold"
                required
              />
              <span className="text-[9px] text-slate-500 block">
                Regularmente se incorpora el día hábil inmediato posterior a su terminación.
              </span>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700 block">Observaciones / Notas:</label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ej., Vacaciones diferidas del periodo 2024-2025"
                className="w-full border rounded-lg p-2 focus:ring-1 focus:ring-emerald-750 outline-none placeholder:italic"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-emerald-800 hover:bg-emerald-900 text-white font-bold py-2 rounded-lg transition"
            >
              Registrar Periodo Planificado
            </button>
          </form>
        </div>

        {/* Right column: list of vacation Periods */}
        <div className="lg:col-span-2 space-y-4">
          
          {/* Tabs view filters */}
          <div className="bg-white p-1.5 rounded-xl border border-slate-200 shadow-sm flex gap-1">
            {(['Todas', 'Planificadas', 'Activas', 'Incorporado'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`text-[11px] font-bold px-3 py-1 text-xs rounded-lg transition ${
                  activeTab === tab
                    ? 'bg-slate-800 text-white shadow-sm'
                    : 'text-slate-650 hover:bg-slate-50'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* List display */}
          <div className="space-y-3">
            {filteredVacations.length === 0 ? (
              <div className="bg-white p-12 text-center rounded-xl border border-slate-200 text-slate-400">
                <Info className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                <p className="text-xs font-medium italic">No se encontraron expedientes de vacaciones de este tipo.</p>
              </div>
            ) : (
              filteredVacations.map(vacation => {
                const worker = workers.find(w => w.id === vacation.workerId);
                
                // Real-time alerts of incorporation
                const today = new Date();
                const incorpDateObj = new Date(vacation.incorporationDate);
                const daysDiff = Math.ceil((incorpDateObj.getTime() - today.getTime()) / (1000 * 3605 * 24));
                const isUrgentReturn = vacation.status === 'Activa' && daysDiff <= 3;

                return (
                  <div 
                    key={vacation.id}
                    className={`bg-white p-4.5 rounded-xl border-2 transition shadow-sm space-y-3 ${
                      isUrgentReturn 
                        ? 'border-amber-400 bg-amber-50/10 animate-pulse' 
                        : 'border-slate-200 hover:border-slate-350'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-2 gap-1.5">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                            vacation.status === 'Activa' ? 'bg-emerald-100 text-emerald-800' :
                            vacation.status === 'Planificada' ? 'bg-blue-100 text-blue-800' :
                            'bg-slate-100 text-slate-700'
                          }`}>
                            {vacation.status}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">Expediente ID: {vacation.id}</span>
                        </div>
                        <h4 className="font-bold text-slate-900 text-sm mt-1">{worker?.name || 'Obrero Desconocido'}</h4>
                        <p className="text-[10px] text-slate-500 font-medium">Cédula: {worker?.cedula} | {worker?.brigade}</p>
                      </div>

                      {/* Action trigger based on vacation status */}
                      <div className="flex gap-1.5 self-end sm:self-auto shrink-0">
                        {vacation.status === 'Planificada' && (
                          <button
                            onClick={() => activateVacation(vacation)}
                            className="bg-blue-50 text-blue-800 border border-blue-200 hover:bg-blue-100 font-bold px-2.5 py-1 rounded text-[10px] flex items-center gap-1 transition"
                          >
                            Activar Goce
                          </button>
                        )}
                        {vacation.status === 'Activa' && (
                          <button
                            onClick={() => incorporateWorker(vacation)}
                            className="bg-emerald-800 text-white hover:bg-emerald-900 font-bold px-2.5 py-1 rounded text-[10px] flex items-center gap-1 transition shadow-sm"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" /> Reincorporar
                          </button>
                        )}
                        <button
                          onClick={() => onDeleteVacation(vacation.id)}
                          className="text-slate-400 hover:text-red-500 p-1 rounded"
                          title="Eliminar Expediente"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-xs font-medium text-slate-650 bg-slate-50 p-2.5 rounded-lg border border-slate-150">
                      <div>
                        <span className="text-[9px] font-bold text-slate-400 uppercase font-display block">Fecha Inicio</span>
                        <span className="font-mono text-slate-900 font-bold">{vacation.startDate}</span>
                      </div>
                      <div>
                        <span className="text-[9px] font-bold text-slate-400 uppercase font-display block">Fecha Fin</span>
                        <span className="font-mono text-slate-900 font-bold">{vacation.endDate}</span>
                      </div>
                      <div>
                        <span className="text-[9px] font-bold text-slate-400 uppercase font-display block">Día Retorno</span>
                        <span className="font-mono text-emerald-800 font-bold">{vacation.incorporationDate}</span>
                      </div>
                    </div>

                    {/* Warning overlay alerts if incorporation is coming up */}
                    {isUrgentReturn && (
                      <div className="flex items-center gap-2 text-[10px] text-amber-900 font-bold bg-amber-50 p-2 rounded border border-amber-200">
                        <AlertCircle className="w-4 h-4 text-amber-600 block shrink-0 animate-bounce" />
                        <span>¡ATENCIÓN COORDINADOR!: El obrero debe reincorporarse en {daysDiff} días ({vacation.incorporationDate}). Prepare el rol de cuadrillas.</span>
                      </div>
                    )}

                    {vacation.notes && (
                      <p className="text-[10px] text-slate-500 italic bg-white p-1.5 border rounded">
                        <span className="font-bold text-slate-750">Comentarios:</span> {vacation.notes}
                      </p>
                    )}
                  </div>
                );
              })
            )}
          </div>

        </div>

      </div>

    </div>
  );
}
