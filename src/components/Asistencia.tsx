import React, { useState } from 'react';
import { Worker, DayAttendance, AttendanceRecord, AttendanceStatus } from '../types';
import { ClipboardList, Calendar, Users, FileSpreadsheet, PlusCircle, AlertCircle, Clock, ShieldAlert, Check } from 'lucide-react';

interface AsistenciaProps {
  workers: Worker[];
  attendance: DayAttendance[];
  onSaveDayAttendance: (date: string, records: Record<string, AttendanceRecord>) => void;
}

export default function Asistencia({ workers, attendance, onSaveDayAttendance }: AsistenciaProps) {
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  
  // Temporary state for the currently displayed/edited day's attendance
  const [editingRecords, setEditingRecords] = useState<Record<string, AttendanceRecord>>({});

  // Loaded day attendance from saved records, or initialized with defaults if none exists
  const activeDayRecord = attendance.find(a => a.date === selectedDate);

  // Synchronize staging record with active saved record or setup normal default items
  React.useEffect(() => {
    if (activeDayRecord) {
      setEditingRecords(activeDayRecord.records);
    } else {
      // Setup default active registry for the day
      const defaults: Record<string, AttendanceRecord> = {};
      workers.forEach(w => {
        // If worker is on vacation, default status is 'V' (Vacaciones)
        // If worker is on medical reposo, default status is 'R' (Reposo)
        let status: AttendanceStatus = 'A';
        let detail = '';
        if (w.status === 'Vacaciones') {
          status = 'V';
          detail = 'Vacaciones anuales reglamentarias';
        } else if (w.status === 'Reposo') {
          status = 'R';
          detail = w.notes || 'Reposo médico justificado';
        } else if (w.status === 'Movido') {
          status = 'P';
          detail = 'Movido temporalmente a otra dependencia';
        }

        defaults[w.id] = {
          entryTime: status === 'A' ? '06:30' : '--:--',
          entryConfirmed: status === 'A',
          exitTime: status === 'A' ? '12:00' : '--:--',
          exitConfirmed: status === 'A',
          status,
          details: detail
        };
      });
      setEditingRecords(defaults);
    }
  }, [selectedDate, activeDayRecord, workers]);

  const updateIndividualRecord = (workerId: string, field: keyof AttendanceRecord, value: any) => {
    const prev = editingRecords[workerId] || {
      entryTime: '06:30',
      entryConfirmed: true,
      exitTime: '12:00',
      exitConfirmed: true,
      status: 'A'
    };
    
    let updated = { ...prev, [field]: value };

    // If changing status to something other than Asistencia, clear times automatically
    if (field === 'status') {
      const stat = value as AttendanceStatus;
      if (stat !== 'A') {
        updated.entryTime = '--:--';
        updated.entryConfirmed = false;
        updated.exitTime = '--:--';
        updated.exitConfirmed = false;
        if (stat === 'V') updated.details = 'En disfrute de vacaciones';
        if (stat === 'R') updated.details = 'Reposo médico';
      } else {
        updated.entryTime = '06:30';
        updated.entryConfirmed = true;
        updated.exitTime = '12:00';
        updated.exitConfirmed = true;
        updated.details = '';
      }
    }

    setEditingRecords(prevRecords => ({
      ...prevRecords,
      [workerId]: updated
    }));
  };

  const handleSave = () => {
    onSaveDayAttendance(selectedDate, editingRecords);
    alert(`Asistencia para el día ${selectedDate} guardada exitosamente.`);
  };

  // Mass Shift Assignment Editor ("Edición masiva de los turnos asignados")
  const applyMassShift = (entry: string, exit: string) => {
    const updated = { ...editingRecords };
    Object.keys(updated).forEach(workerId => {
      if (updated[workerId].status === 'A') {
        updated[workerId].entryTime = entry;
        updated[workerId].exitTime = exit;
        updated[workerId].entryConfirmed = true;
        updated[workerId].exitConfirmed = true;
      }
    });
    setEditingRecords(updated);
    alert(`Turnos masivos actualizados para obreros activos: Entrada ${entry} - Salida ${exit}`);
  };

  // Compute stats of permissions/absences "al mes" (based on available records)
  // Let's analyze all logs and totalize indicators
  const currentMonth = selectedDate.slice(0, 7); // YYYY-MM
  const monthRecords = attendance.filter(a => a.date.startsWith(currentMonth));

  const monthlyReport = workers.map(worker => {
    let totalA = 0; // Asistencias
    let totalI = 0; // Inasistencias
    let totalP = 0; // Permisos
    let totalR = 0; // Reposo
    let totalV = 0; // Vacaciones
    let earlyDepartures = 0; // Se fue antes de la hora
    let illnessAccidentExit = 0; // Retirado por enfermedad o accidente

    monthRecords.forEach(day => {
      const rec = day.records[worker.id];
      if (rec) {
        if (rec.status === 'A') totalA++;
        if (rec.status === 'I') totalI++;
        if (rec.status === 'P') totalP++;
        if (rec.status === 'R') totalR++;
        if (rec.status === 'V') totalV++;

        // Chequear detalles para determinar salidas anticipadas o accidentes
        const detailLower = (rec.details || '').toLowerCase();
        if (detailLower.includes('antes de la hora') || detailLower.includes('retiró antes') || detailLower.includes('anticipad')) {
          earlyDepartures++;
        }
        if (detailLower.includes('accidente') || detailLower.includes('enfermedad') || detailLower.includes('mala salud')) {
          illnessAccidentExit++;
        }
      }
    });

    return {
      worker,
      totalA,
      totalI,
      totalP,
      totalR,
      totalV,
      earlyDepartures,
      illnessAccidentExit
    };
  });

  return (
    <div className="space-y-6">
      
      {/* Attendance Sheet Title & Setup */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="space-y-1.5 text-center md:text-left">
            <h2 className="text-base font-bold text-slate-900 font-display flex items-center justify-center md:justify-start gap-2">
              <ClipboardList className="w-5 h-5 text-emerald-800" />
              Libro Diario de Control de Asistencia del Personal
            </h2>
            <p className="text-xs text-slate-500">
              Replica digitalizada de la planilla de control de firmas física de la Alcaldía de Juan José Rondón
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-600">Fecha de Control:</span>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="border rounded-lg p-2 text-xs font-mono font-bold focus:ring-1 focus:ring-emerald-700 outline-none"
            />
          </div>
        </div>

        {/* Mass Assignment Tool (No-print) */}
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 grid grid-cols-1 md:grid-cols-3 gap-3 items-center text-xs">
          <div className="space-y-1">
            <span className="font-bold text-slate-800 block">Edición Masiva de Horarios:</span>
            <span className="text-[10px] text-slate-500">Asigna horas de entrada/salida a todos los activos del día</span>
          </div>
          <div className="flex gap-2 justify-center md:justify-start">
            <button
              onClick={() => applyMassShift('06:30', '12:00')}
              className="bg-white hover:bg-slate-150 border px-3 py-2 rounded-lg font-bold font-mono text-slate-700 hover:text-slate-905 shadow-sm"
            >
              Mañana (06:30 - 12:00)
            </button>
            <button
              onClick={() => applyMassShift('07:00', '17:00')}
              className="bg-white hover:bg-slate-150 border px-3 py-2 rounded-lg font-bold font-mono text-slate-700 hover:text-slate-905 shadow-sm"
            >
              Fuerte (07:00 - 17:00)
            </button>
          </div>
          <div className="text-[10px] text-slate-500 italic md:text-right">
            Tip: Esto acelera el trabajo diario del Coordinador.
          </div>
        </div>
      </div>

      {/* Main Grid: Left is direct daily sheet table, Right is summary reports */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* DAILY TABLE (Takes 3 Cols out of 4) */}
        <div className="lg:col-span-3 bg-white rounded-xl border border-slate-200 shadow-sm p-5 overflow-hidden space-y-4">
          <div className="flex items-center justify-between border-b pb-2">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-widest font-display">
              Planilla del Día: {selectedDate}
            </span>
            <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
              {activeDayRecord ? '✓ Cargado desde almacenamiento' : '✎ Nuevo registro (Sin Guardar)'}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-350 text-slate-800 font-display">
                  <th className="p-2 border-r font-bold w-12 text-center">Nº</th>
                  <th className="p-2 border-r font-bold">Obrero / Coordinación de Ornato</th>
                  <th className="p-2 border-r font-bold text-center w-28">Entrada / Hora</th>
                  <th className="p-2 border-r font-bold text-center w-28">Salida / Hora</th>
                  <th className="p-2 border-r font-bold text-center w-36 font-display">Firma / Estatus</th>
                  <th className="p-2 font-bold">Incidencias / Detalles de Salud o Salida</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {workers.map((worker, index) => {
                  const record = editingRecords[worker.id] || {
                    entryTime: '06:30',
                    entryConfirmed: true,
                    exitTime: '12:00',
                    exitConfirmed: true,
                    status: 'A',
                    details: ''
                  };

                  return (
                    <tr key={worker.id} className="hover:bg-slate-50/50">
                      <td className="p-2 border-r text-center font-mono font-medium text-slate-500 py-3">
                        {index + 1}
                      </td>
                      <td className="p-2 border-r">
                        <div className="font-bold text-slate-850">{worker.name}</div>
                        <div className="text-[10px] text-slate-500 font-mono">C.I: {worker.cedula} | {worker.brigade}</div>
                      </td>
                      <td className="p-2 border-r text-center">
                        <input
                          type="text"
                          value={record.entryTime}
                          onChange={(e) => updateIndividualRecord(worker.id, 'entryTime', e.target.value)}
                          className="w-16 border rounded p-1 text-center font-mono font-bold text-xs bg-slate-50"
                          disabled={record.status !== 'A'}
                        />
                      </td>
                      <td className="p-2 border-r text-center">
                        <input
                          type="text"
                          value={record.exitTime}
                          onChange={(e) => updateIndividualRecord(worker.id, 'exitTime', e.target.value)}
                          className="w-16 border rounded p-1 text-center font-mono font-bold text-xs bg-slate-50"
                          disabled={record.status !== 'A'}
                        />
                      </td>
                      <td className="p-2 border-r text-center">
                        <select
                          value={record.status}
                          onChange={(e) => updateIndividualRecord(worker.id, 'status', e.target.value as AttendanceStatus)}
                          className={`w-full text-[10px] font-bold p-1 rounded border outline-none bg-white font-display text-center ${
                            record.status === 'A' ? 'border-emerald-300 text-emerald-800' :
                            record.status === 'I' ? 'border-rose-300 text-rose-800' :
                            record.status === 'P' ? 'border-blue-300 text-blue-800' :
                            'border-amber-300 text-amber-800'
                          }`}
                        >
                          <option value="A">A - Asistencia</option>
                          <option value="I">I - Inasistencia</option>
                          <option value="P">P - Permiso</option>
                          <option value="R">R - Reposo Médico</option>
                          <option value="V">V - Vacaciones</option>
                        </select>
                      </td>
                      <td className="p-2">
                        <input
                          type="text"
                          value={record.details || ''}
                          onChange={(e) => updateIndividualRecord(worker.id, 'details', e.target.value)}
                          placeholder="Ej., Se retiró temprano por accidente de labor, justificativo, inasistencia fortuita"
                          className="w-full text-[11px] p-1 border border-slate-200 rounded outline-none focus:border-slate-400 placeholder:italic"
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end pt-4 border-t gap-3">
            <button
              onClick={handleSave}
              className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-6 py-2.5 rounded-lg text-xs transition shadow-sm"
            >
              Guardar Control de Asistencia Diario
            </button>
          </div>
        </div>

        {/* MONTHLY SUMMARY indicator report (1 Col out of 4) */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
          <div className="border-b pb-2">
            <h3 className="font-bold text-slate-900 font-display text-sm leading-tight">Resumen Mensual</h3>
            <p className="text-[10px] text-slate-500">Métricas analíticas acumuladas del mes: <span className="font-bold font-mono">{currentMonth}</span></p>
          </div>

          <div className="space-y-4 max-h-[460px] overflow-y-auto pr-1">
            {monthlyReport.map((stat) => (
              <div 
                key={stat.worker.id} 
                className="p-3 border border-slate-100 rounded-lg text-xs space-y-1.5 hover:bg-slate-50"
              >
                <div className="font-bold text-slate-800 truncate leading-snug">
                  {stat.worker.name}
                </div>
                <div className="grid grid-cols-5 gap-1 text-[10px] font-bold text-center">
                  <div className="bg-emerald-50 text-emerald-800 p-1 rounded" title="Total Asistencias">
                    <div>A</div>
                    <div className="font-mono text-xs">{stat.totalA}</div>
                  </div>
                  <div className="bg-red-50 text-red-800 p-1 rounded" title="Inasistencias">
                    <div>I</div>
                    <div className="font-mono text-xs text-red-600">{stat.totalI}</div>
                  </div>
                  <div className="bg-blue-50 text-blue-800 p-1 rounded" title="Permisos">
                    <div>P</div>
                    <div className="font-mono text-xs">{stat.totalP}</div>
                  </div>
                  <div className="bg-amber-50 text-amber-800 p-1 rounded" title="Reposos Médicos">
                    <div>R</div>
                    <div className="font-mono text-xs">{stat.totalR}</div>
                  </div>
                  <div className="bg-purple-50 text-purple-800 p-1 rounded" title="Días Vacaciones">
                    <div>V</div>
                    <div className="font-mono text-xs">{stat.totalV}</div>
                  </div>
                </div>

                {/* Sub-indicators layout */}
                {(stat.earlyDepartures > 0 || stat.illnessAccidentExit > 0) && (
                  <div className="pt-1 space-y-1 border-t border-slate-100 text-[10px]">
                    {stat.earlyDepartures > 0 && (
                      <div className="flex items-center justify-between text-amber-700">
                        <span className="font-medium">Salidas antes de hora:</span>
                        <span className="font-mono font-bold">{stat.earlyDepartures}</span>
                      </div>
                    )}
                    {stat.illnessAccidentExit > 0 && (
                      <div className="flex items-center justify-between text-rose-700">
                        <span className="font-medium">Salidas enf./accidente:</span>
                        <span className="font-mono font-bold">{stat.illnessAccidentExit}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="bg-emerald-900 rounded-xl text-white p-3.5 space-y-1.5 text-[11px] leading-relaxed">
            <div className="font-bold flex items-center gap-1">
              <ShieldAlert className="w-4 h-4 text-yellow-400 shrink-0" />
              Simbología Oficial
            </div>
            <p>
              Use las columnas para auditar incapacidades o permisos. Las salidas por enfermedad o accidente laboral se catalogan agregando en las notas palabras como "enfermedad" o "accidente".
            </p>
          </div>
        </div>

      </div>

    </div>
  );
}
