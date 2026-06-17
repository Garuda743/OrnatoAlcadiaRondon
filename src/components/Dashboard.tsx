import React from 'react';
import { Worker, Task, VacationPeriod, POAGoal } from '../types';
import { AlertTriangle, Users, CheckCircle2, Calendar, Clock, CloudRain, Bell, Briefcase, TrendingUp } from 'lucide-react';
import { motion } from 'motion/react';

interface DashboardProps {
  workers: Worker[];
  tasks: Task[];
  vacations: VacationPeriod[];
  poaGoals: POAGoal[];
  onNavigate: (tab: string) => void;
}

export default function Dashboard({ workers, tasks, vacations, poaGoals, onNavigate }: DashboardProps) {
  // Compute key statistics
  const totalWorkers = workers.length;
  const activeWorkers = workers.filter(w => w.status === 'Activo').length;
  const sickLeaveWorkers = workers.filter(w => w.status === 'Reposo').length;
  const vacationWorkers = workers.filter(w => w.status === 'Vacaciones').length;
  
  const completedTasks = tasks.filter(t => t.status === 'Completada').length;
  const inProgressTasks = tasks.filter(t => t.status === 'En Progreso').length;
  const rainPendingTasks = tasks.filter(t => t.status === 'Pendiente (Lluvia)').length;
  const fortuitoPendingTasks = tasks.filter(t => t.status === 'Pendiente (Hecho Fortuito)').length;
  const scheduledTasks = tasks.filter(t => t.status === 'Programada').length;

  // Real-time notifications / Alerts logic
  const alerts: { id: string; type: 'error' | 'warning' | 'info' | 'success'; title: string; desc: string; time: string }[] = [];

  // Generate dynamic alerts based on actual state
  tasks.forEach(t => {
    if (t.status === 'Pendiente (Lluvia)') {
      alerts.push({
        id: `alert-rain-${t.id}`,
        type: 'warning',
        title: 'Retraso por Lluvia',
        desc: `"${t.description}" se detuvo por clima lluvioso. Se posterga a la nueva planificación.`,
        time: 'Hace poco'
      });
    }
    if (t.status === 'Pendiente (Hecho Fortuito)') {
      alerts.push({
        id: `alert-fort-${t.id}`,
        type: 'error',
        title: 'Hecho Fortuito',
        desc: `"${t.description}" suspendida temporalmente por evento fortuito: ${t.notes || 'sin detalles'}.`,
        time: 'Hoy'
      });
    }
  });

  vacations.forEach(v => {
    if (v.status === 'Activa') {
      const workerName = workers.find(w => w.id === v.workerId)?.name || 'Trabajador';
      alerts.push({
        id: `alert-vac-${v.id}`,
        type: 'info',
        title: 'Trabajador Vacaciones Activas',
        desc: `${workerName} se reincorpora el día ${v.incorporationDate}.`,
        time: 'Control de Vacaciones'
      });
    }
  });

  workers.forEach(w => {
    if (w.status === 'Reposo') {
      alerts.push({
        id: `alert-rep-${w.id}`,
        type: 'error',
        title: 'Personal en Reposo Médico',
        desc: `${w.name} con reposo médico activo. Brigade: ${w.brigade}.`,
        time: 'Alerta médica'
      });
    }
  });

  // Calculate POAGoal general accomplishment
  const totalPOATarget = poaGoals.reduce((sum, g) => sum + g.targetQuantity, 0);
  const totalPOACompleted = poaGoals.reduce((sum, g) => sum + g.completedQuantity, 0);
  const generalPOAPercent = totalPOATarget > 0 ? Math.round((totalPOACompleted / totalPOATarget) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Workers Active */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between hover:shadow-md transition duration-200">
          <div className="space-y-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider font-display">Personal Registrado</span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-slate-800 font-mono">{activeWorkers}</span>
              <span className="text-sm text-slate-500">/ {totalWorkers} activos</span>
            </div>
            <p className="text-[10px] text-slate-500">
              {sickLeaveWorkers} en reposo • {vacationWorkers} de vacaciones
            </p>
          </div>
          <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* Card 2: Tasks in progress */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between hover:shadow-md transition duration-200">
          <div className="space-y-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider font-display">Tareas Planificadas</span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-blue-600 font-mono">{inProgressTasks + scheduledTasks}</span>
              <span className="text-sm text-slate-500">en ejecución</span>
            </div>
            <p className="text-[10px] text-emerald-700 font-semibold flex items-center gap-0.5">
              <CheckCircle2 className="w-3 text-emerald-500" /> {completedTasks} completadas hoy/semana
            </p>
          </div>
          <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        {/* Card 3: Clima Alertas */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between hover:shadow-md transition duration-200">
          <div className="space-y-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider font-display">Retrasos / Clima</span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-amber-500 font-mono">{rainPendingTasks + fortuitoPendingTasks}</span>
              <span className="text-sm text-slate-500">pendientes</span>
            </div>
            <p className="text-[10px] text-amber-600 flex items-center gap-1 font-medium">
              <CloudRain className="w-3 text-slate-400" /> Reprogramados para reordenamiento
            </p>
          </div>
          <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center text-amber-500">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>

        {/* Card 4: POA Metas Cumplidas */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between hover:shadow-md transition duration-200">
          <div className="space-y-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider font-display">Cumplimiento Metas POA</span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-slate-800 font-mono">{generalPOAPercent}%</span>
              <span className="text-sm text-slate-500">logrado</span>
            </div>
            {/* Simple sparkline style progress bar */}
            <div className="w-28 bg-slate-100 h-1.5 rounded-full overflow-hidden">
              <div 
                className="bg-emerald-600 h-full rounded-full" 
                style={{ width: `${generalPOAPercent}%` }}
              ></div>
            </div>
          </div>
          <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Grid Layout for widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Active & Pending Operations list */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-slate-900 font-display text-base">Planificación Activa y Rutinas Clave</h3>
                <p className="text-xs text-slate-500">Operaciones vigentes según el Plan de Ornato Las Mercedes</p>
              </div>
              <button 
                onClick={() => onNavigate('asistencia')} 
                className="text-xs font-bold text-emerald-700 hover:text-emerald-800 focus:underline font-display"
              >
                Registrar Asistencia &rarr;
              </button>
            </div>

            <div className="space-y-3">
              {tasks.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-sm">
                  No hay tareas registradas para esta semana. Cree tareas en el módulo de Planificación.
                </div>
              ) : (
                tasks.slice(0, 4).map((task) => (
                  <div key={task.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 rounded-lg border border-slate-100 hover:bg-slate-50/50 gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          task.status === 'Completada' ? 'bg-emerald-100 text-emerald-800' :
                          task.status === 'En Progreso' ? 'bg-blue-100 text-blue-800' :
                          task.status === 'Programada' ? 'bg-slate-100 text-slate-800' :
                          'bg-amber-100 text-amber-800'
                        }`}>
                          {task.status}
                        </span>
                        {task.isRecurring && (
                          <span className="bg-purple-100 text-purple-800 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                            Recurrente cada {task.recurringIntervalDays} días
                          </span>
                        )}
                        <span className="text-[10px] text-slate-500 font-mono">{task.category}</span>
                      </div>
                      <h4 className="text-sm font-semibold text-slate-800">{task.description}</h4>
                      <p className="text-xs text-slate-500 font-medium">Ubicación: {task.location}</p>
                    </div>

                    <div className="flex -space-x-1 overflow-hidden">
                      {task.assignedWorkerIds.map((id, index) => {
                        const workerName = workers.find(w => w.id === id)?.name || 'Personal';
                        const initials = workerName.split(' ').map(n => n[0]).join('').slice(0, 2);
                        return (
                          <span 
                            key={id} 
                            title={workerName} 
                            className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-[9px] font-bold text-white ring-2 ring-white cursor-pointer ${
                              index % 3 === 0 ? 'bg-emerald-600' : index % 3 === 1 ? 'bg-blue-600' : 'bg-amber-600'
                            }`}
                          >
                            {initials}
                          </span>
                        );
                      })}
                      {task.assignedWorkerIds.length === 0 && (
                        <span className="text-xs text-rose-500 italic font-semibold">Sin personal asignado</span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="mt-4 pt-4 border-t border-slate-100 flex justify-end">
              <button 
                onClick={() => onNavigate('planificacion')} 
                className="text-xs bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold px-3 py-1.5 rounded-lg transition"
              >
                Ir a Módulo de Planificación Completa &rarr;
              </button>
            </div>
          </div>

          {/* Quick POA goals dashboard checklist */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <h3 className="font-bold text-slate-900 font-display text-base mb-1">Indicadores Básicos del Plan Operativo Anual (POA)</h3>
            <p className="text-xs text-slate-500 mb-4">Verifique el logro acumulado para los pilares gubernamentales de ornato de Juan José Rondón</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {poaGoals.slice(0, 4).map(goal => {
                const percent = Math.min(100, Math.round((goal.completedQuantity / goal.targetQuantity) * 100));
                return (
                  <div key={goal.id} className="p-3.5 border border-slate-100 rounded-lg hover:border-slate-200">
                    <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5 font-medium">
                      <span className="font-bold text-slate-700 max-w-[200px] truncate">{goal.pillar}</span>
                      <span className="font-mono font-bold text-slate-800">{goal.completedQuantity}/{goal.targetQuantity} {goal.unit}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div 
                          className="bg-emerald-600 h-full rounded-full" 
                          style={{ width: `${percent}%` }}
                        ></div>
                      </div>
                      <span className="text-xs font-bold text-slate-700 min-w-[32px] text-right font-mono">{percent}%</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1 italic line-clamp-1">{goal.description}</p>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 pt-4 border-t border-slate-100 flex justify-end">
              <button 
                onClick={() => onNavigate('reportes')} 
                className="text-xs text-blue-700 font-bold hover:text-blue-800 font-display flex items-center gap-1"
              >
                Abrir Estadísticas & Reportes de POA &rarr;
              </button>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Real-time progress updates & Alerts */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <div className="flex items-center gap-2 mb-4 border-b border-slate-100 pb-3">
              <div className="relative">
                <Bell className="w-5 h-5 text-slate-700" />
                {alerts.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-rose-500 rounded-full"></span>
                )}
              </div>
              <div>
                <h3 className="font-bold text-slate-900 font-display text-base leading-tight">Alertas en Tiempo Real</h3>
                <p className="text-[10px] text-slate-500">Notificaciones automáticas del personal y clima</p>
              </div>
            </div>

            <div className="space-y-3.5 max-h-[420px] overflow-y-auto pr-1">
              {alerts.length === 0 ? (
                <div className="text-center py-10 text-slate-400 text-xs italic">
                  No hay alertas urgentes pendientes en este momento.
                </div>
              ) : (
                alerts.map((alert) => (
                  <div 
                    key={alert.id} 
                    className={`p-3 rounded-lg border flex items-start gap-3 text-xs leading-relaxed ${
                      alert.type === 'error' ? 'bg-red-50/50 border-red-100 text-red-900' :
                      alert.type === 'warning' ? 'bg-amber-50/50 border-amber-100 text-amber-900' :
                      alert.type === 'info' ? 'bg-blue-50/50 border-blue-100 text-blue-900' :
                      'bg-emerald-50/50 border-emerald-100 text-emerald-900'
                    }`}
                  >
                    <div className="mt-0.5">
                      {alert.type === 'error' && <AlertTriangle className="w-4 h-4 text-red-600 block shrink-0" />}
                      {alert.type === 'warning' && <CloudRain className="w-4 h-4 text-amber-600 block shrink-0" />}
                      {alert.type === 'info' && <Briefcase className="w-4 h-4 text-blue-600 block shrink-0" />}
                      {alert.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-600 block shrink-0" />}
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between gap-1.5">
                        <span className="font-bold text-slate-900 uppercase tracking-wide text-[10px]">
                          {alert.title}
                        </span>
                        <span className="text-[9px] text-slate-400 font-mono shrink-0">
                          {alert.time}
                        </span>
                      </div>
                      <p className="text-slate-700">{alert.desc}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
            
            <div className="bg-slate-50 border border-slate-100 p-3 rounded-lg mt-4 text-[10px] text-slate-500 text-center">
              Las reprogramaciones climáticas (lluvia/fortuito) se agregan automáticamente a la bolsa de pendientes.
            </div>
          </div>

          {/* Quick instructions / guidelines for the municipality users */}
          <div className="bg-emerald-800 rounded-xl text-white p-5 shadow-sm space-y-3">
            <h4 className="font-bold font-display text-sm">Objetivos de Gestión de Ornato</h4>
            <p className="text-xs text-emerald-100 leading-relaxed">
              Conserve y mantenga la estética urbana del Municipio Juan José Rondón apoyándose en los tres pilares operativos:
            </p>
            <ol className="text-xs space-y-1.5 text-emerald-100 list-decimal pl-4">
              <li>Planifique tareas recurrentes con alertas de vencimiento automático.</li>
              <li>Supervise ausentismo con el control de firmas oficial (asistencia).</li>
              <li>Asegure el POA para la auditoría de metas semestral/anual de la alcaldía.</li>
            </ol>
            <p className="text-[10px] text-emerald-200">
              Coordinador General: Joan Siso
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
