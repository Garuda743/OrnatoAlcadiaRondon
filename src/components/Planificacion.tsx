import React, { useState } from 'react';
import { Worker, Task, TaskCategory } from '../types';
import { Calendar, Plus, Trash2, Camera, Printer, CheckCircle, RefreshCw, AlertTriangle, AlertCircle, Sparkles, Filter, CloudRain } from 'lucide-react';
import HeaderOfic, { PrintSignatures } from './HeaderOfic';

interface PlanificacionProps {
  workers: Worker[];
  tasks: Task[];
  onAddTask: (task: Omit<Task, 'id'>) => void;
  onUpdateTask: (task: Task) => void;
  onDeleteTask: (id: string) => void;
}

const CATEGORIES: TaskCategory[] = [
  'Mantenimiento de Áreas Verdes',
  'Gestión de Viveros Municipales',
  'Mantenimiento del Mobiliario Urbano',
  'Control Fitosanitario',
  'Limpieza Especializada',
  'Decoración de Eventos Públicos'
];

const STANDARD_MATERIALS = [
  'Escobas', 'Palas', 'Machetes', 'Desmalezadoras', 'Rastrillos', 
  'Bolsas para desechos', 'Pintura', 'Brochas', 'Detergente', 
  'Coleto', 'Plantas ornamentales', 'Insecticida orgánico'
];

export default function Planificacion({ workers, tasks, onAddTask, onUpdateTask, onDeleteTask }: PlanificacionProps) {
  // Navigation & filtering states
  const [activeFilter, setActiveFilter] = useState<'Todas' | 'Programada' | 'En Progreso' | 'Completada' | 'Pendiente (Lluvia)' | 'Pendiente (Hecho Fortuito)'>('Todas');
  
  // Create task modal states
  const [showAddForm, setShowAddForm] = useState(false);
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [category, setCategory] = useState<TaskCategory>('Mantenimiento de Áreas Verdes');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [numWorkersNeeded, setNumWorkersNeeded] = useState(2);
  const [assignedWorkerIds, setAssignedWorkerIds] = useState<string[]>([]);
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([]);
  const [customMaterial, setCustomMaterial] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringIntervalDays, setRecurringIntervalDays] = useState(15); // Default quincenal
  const [notes, setNotes] = useState('');

  // Selected task detail for photo uploads and status edits
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  // Print mode visual switch
  const [isPrintPreview, setIsPrintPreview] = useState(false);

  // Recurrency auto planning feedback state
  const [planningNotification, setPlanningNotification] = useState<string | null>(null);

  const activeTasks = tasks.filter(t => activeFilter === 'Todas' || t.status === activeFilter);

  const handleWorkerToggle = (workerId: string) => {
    if (assignedWorkerIds.includes(workerId)) {
      setAssignedWorkerIds(assignedWorkerIds.filter(id => id !== workerId));
    } else {
      setAssignedWorkerIds([...assignedWorkerIds, workerId]);
    }
  };

  const handleMaterialToggle = (material: string) => {
    if (selectedMaterials.includes(material)) {
      setSelectedMaterials(selectedMaterials.filter(m => m !== material));
    } else {
      setSelectedMaterials([...selectedMaterials, material]);
    }
  };

  const addCustomMaterial = () => {
    if (customMaterial.trim() && !selectedMaterials.includes(customMaterial.trim())) {
      setSelectedMaterials([...selectedMaterials, customMaterial.trim()]);
      setCustomMaterial('');
    }
  };

  const resetForm = () => {
    setDescription('');
    setLocation('');
    setCategory('Mantenimiento de Áreas Verdes');
    setStartDate(new Date().toISOString().split('T')[0]);
    setNumWorkersNeeded(2);
    setAssignedWorkerIds([]);
    setSelectedMaterials([]);
    setIsRecurring(false);
    setRecurringIntervalDays(15);
    setNotes('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() || !location.trim()) {
      alert('Por favor complete la descripción y la ubicación de la tarea.');
      return;
    }

    onAddTask({
      description,
      location,
      category,
      startDate,
      endDate: null,
      status: 'Programada',
      assignedWorkerIds,
      materialsUsed: selectedMaterials,
      numWorkersNeeded: Number(numWorkersNeeded),
      isRecurring,
      recurringIntervalDays: isRecurring ? Number(recurringIntervalDays) : 0,
      nextScheduledDate: null,
      images: {},
      notes: notes.trim() ? notes : undefined
    });

    resetForm();
    setShowAddForm(false);
  };

  // Before / during / after file uploads reader
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>, phase: 'antes' | 'durante' | 'despues', task: Task) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const updatedTask: Task = {
        ...task,
        images: {
          ...task.images,
          [phase]: reader.result as string
        }
      };
      onUpdateTask(updatedTask);
    };
    reader.readAsDataURL(file);
  };

  // Complete task handles automatic planning for next 15 / 20 days!
  const markTaskCompleted = (task: Task) => {
    const today = new Date().toISOString().split('T')[0];
    
    let nextScheduledDate: string | null = null;
    let planningMsg = null;

    if (task.isRecurring && task.recurringIntervalDays > 0) {
      // Auto-program the next action
      const nextDateObj = new Date();
      nextDateObj.setDate(nextDateObj.getDate() + task.recurringIntervalDays);
      nextScheduledDate = nextDateObj.toISOString().split('T')[0];
      planningMsg = `¡Automaticamente programada la repetición de "${task.description}" para el día ${nextScheduledDate} (en ${task.recurringIntervalDays} días)!`;
    }

    // Update active completed task
    const updatedTask: Task = {
      ...task,
      status: 'Completada',
      endDate: today,
      nextScheduledDate
    };
    onUpdateTask(updatedTask);

    // If it is recurring, we want to auto-create a new task representing that future action!
    if (task.isRecurring && nextScheduledDate) {
      onAddTask({
        description: task.description,
        location: task.location,
        category: task.category,
        startDate: nextScheduledDate,
        endDate: null,
        status: 'Programada',
        assignedWorkerIds: task.assignedWorkerIds,
        materialsUsed: task.materialsUsed,
        numWorkersNeeded: task.numWorkersNeeded,
        isRecurring: task.isRecurring,
        recurringIntervalDays: task.recurringIntervalDays,
        nextScheduledDate: null,
        images: {}, // Starts empty for the new future task
        notes: `Tarea recurrente periódica generada automáticamente tras completar la tarea ID: ${task.id.slice(0, 5)}`
      });

      setPlanningNotification(planningMsg);
      setTimeout(() => setPlanningNotification(null), 8500);
    }
  };

  const handleDelay = (task: Task, reason: 'Lluvia' | 'Hecho Fortuito') => {
    const status = reason === 'Lluvia' ? 'Pendiente (Lluvia)' : 'Pendiente (Hecho Fortuito)';
    // Increment date automatically to next week
    const nextWeekDate = new Date(task.startDate);
    nextWeekDate.setDate(nextWeekDate.getDate() + 7);
    const updatedDateStr = nextWeekDate.toISOString().split('T')[0];

    const updatedTask: Task = {
      ...task,
      status,
      startDate: updatedDateStr, // Pushed to next planning
      notes: `${task.notes || ''} - Pospuesta a fecha ${updatedDateStr} por ocurrencia de ${reason}.`.trim()
    };
    onUpdateTask(updatedTask);

    setPlanningNotification(`La tarea "${task.description}" ha sido pospuesta para la próxima semana (${updatedDateStr}) debido a ${reason}.`);
    setTimeout(() => setPlanningNotification(null), 6000);
  };

  // Launch browser native print dialog
  const printPage = () => {
    window.print();
  };

  // Filter Workers that are active
  const activeWorkersList = workers.filter(w => w.status === 'Activo');

  return (
    <div className="space-y-6">
      
      {/* Real-time automatic planning notification */}
      {planningNotification && (
        <div className="bg-emerald-800 text-white rounded-xl p-4 shadow-lg border border-emerald-500 animate-pulse flex items-center gap-3 text-xs md:text-sm">
          <Sparkles className="w-5 h-5 text-yellow-300 shrink-0" />
          <div className="flex-1">
            <span className="font-extrabold block">Algoritmo de Planificación Automática:</span>
            <span>{planningNotification}</span>
          </div>
          <button 
            onClick={() => setPlanningNotification(null)} 
            className="text-white hover:text-yellow-200 font-bold px-2 text-base"
          >
            ×
          </button>
        </div>
      )}

      {/* Control Actions Header (No-Print) */}
      <div className="no-print bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center md:text-left">
          <h2 className="text-base font-bold text-slate-900 font-display">Planificación de Labores y Rutinas Urbanas</h2>
          <p className="text-xs text-slate-500">Agrupe al personal, fije las alarmas periódicas y registre evidencia fotográfica</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsPrintPreview(!isPrintPreview)}
            className={`text-xs font-bold px-4 py-2 rounded-lg border transition flex items-center gap-1.5 ${
              isPrintPreview 
                ? 'bg-amber-100 border-amber-300 text-amber-900' 
                : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
            }`}
          >
            <Printer className="w-4 h-4" />
            {isPrintPreview ? 'Salir de Vista Impresión' : 'Vista de Impresión Oficial'}
          </button>
          
          <button
            onClick={() => { resetForm(); setShowAddForm(true); }}
            className="text-xs bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-4 py-2 rounded-lg shadow-sm flex items-center gap-1.5 transition"
          >
            <Plus className="w-4 h-4" />
            Programar Nueva Tarea (POA)
          </button>
        </div>
      </div>

      {/* -------------------- PRINT PREVIEW MODE -------------------- */}
      {isPrintPreview ? (
        <div className="bg-white p-8 rounded-xl border-3 border-slate-700 shadow-md max-w-4xl mx-auto space-y-6">
          <div className="text-right no-print">
            <button
              onClick={printPage}
              className="text-xs bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-6 py-2 rounded-lg shadow transition inline-flex items-center gap-2"
            >
              <Printer className="w-4 h-4" /> Imprimir Plan de Trabajo Semanal
            </button>
          </div>

          <HeaderOfic 
            title="PLAN SEMANAL DE SERVICIOS Y ORNATO MUNICIPAL" 
            subtitle="Plan Operativo Coordinado para el Municipio Juan José Rondón" 
          />

          <div className="border border-slate-400 rounded-lg overflow-hidden">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-400 font-display text-slate-800">
                  <th className="p-2 border-r border-slate-450 font-bold">Fecha / Categoría</th>
                  <th className="p-2 border-r border-slate-450 font-bold">Descripción de Labores</th>
                  <th className="p-2 border-r border-slate-450 font-bold">Ubicación / Zona</th>
                  <th className="p-2 border-r border-slate-450 font-bold">Personal Asignado</th>
                  <th className="p-2 border-r border-slate-450 font-bold">Materiales / Implementos</th>
                  <th className="p-2 font-bold text-center">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-350">
                {tasks.map(task => {
                  const assignedNames = task.assignedWorkerIds
                    .map(id => workers.find(w => w.id === id)?.name || '')
                    .join(', ');
                  return (
                    <tr key={task.id} className="hover:bg-slate-50 text-slate-800">
                      <td className="p-2 border-r border-slate-350 font-medium">
                        <div className="font-mono">{task.startDate}</div>
                        <div className="text-[9px] text-slate-500">{task.category}</div>
                      </td>
                      <td className="p-2 border-r border-slate-350 font-semibold">{task.description}</td>
                      <td className="p-2 border-r border-slate-350 font-medium text-slate-650">{task.location}</td>
                      <td className="p-2 border-r border-slate-350 text-slate-650 italic text-[11px]">
                        {assignedNames || <span className="text-red-500 font-bold">Sin asignar</span>}
                      </td>
                      <td className="p-2 border-r border-slate-350 text-[11px] font-mono">
                        {task.materialsUsed.join(', ') || 'N/A'}
                      </td>
                      <td className="p-2 text-center text-[10px] font-bold">
                        <span className={
                          task.status === 'Completada' ? 'text-emerald-700' :
                          task.status === 'En Progreso' ? 'text-blue-700' :
                          task.status === 'Programada' ? 'text-slate-800' :
                          'text-amber-800'
                        }>
                          {task.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="text-xs text-slate-500 italic text-center p-3 border border-slate-300 rounded bg-slate-50">
            Nota: Este documento refleja la programación del POA autorizada por el Coordinador de Ornato Joan Siso. Las variaciones climáticas o hechos fortuitos se reportan de inmediato a la Dirección de Servicios Públicos.
          </div>

          <PrintSignatures />
        </div>
      ) : (
        /* -------------------- NORMAL INTERACTIVE BOARD -------------------- */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left Columns (Tasks Interactive List) */}
          <div className="lg:col-span-2 space-y-4">
            
            {/* Filter Pill Tabs */}
            <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-sm flex flex-wrap gap-1">
              {(['Todas', 'Programada', 'En Progreso', 'Completada', 'Pendiente (Lluvia)', 'Pendiente (Hecho Fortuito)'] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setActiveFilter(status)}
                  className={`text-[11px] font-bold px-3 py-1.5 rounded-lg transition-all ${
                    activeFilter === status
                      ? 'bg-emerald-800 text-white shadow-sm'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-850'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>

            {/* Tasks mapping */}
            <div className="space-y-4">
              {activeTasks.length === 0 ? (
                <div className="bg-white p-12 text-center rounded-xl border border-slate-200 text-slate-400">
                  <AlertCircle className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                  <p className="text-sm font-medium">No se encontraron tareas bajo el filtro seleccionado.</p>
                </div>
              ) : (
                activeTasks.map((task) => (
                  <div 
                    key={task.id} 
                    className={`bg-white rounded-xl border-2 transition-all p-5 space-y-4 shadow-sm ${
                      selectedTaskId === task.id ? 'border-emerald-700 shadow-md ring-1 ring-emerald-500' : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {/* Task Header */}
                    <div className="flex flex-col sm:flex-row items-start justify-between gap-2 border-b border-rose-50/50 pb-3">
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            task.status === 'Completada' ? 'bg-emerald-100 text-emerald-800' :
                            task.status === 'En Progreso' ? 'bg-blue-100 text-blue-800' :
                            task.status === 'Programada' ? 'bg-slate-100 text-slate-800' :
                            'bg-amber-100 text-amber-800'
                          }`}>
                            {task.status}
                          </span>
                          <span className="text-[10px] bg-slate-100 text-slate-700 font-semibold px-2 py-0.5 rounded-full">
                            {task.category}
                          </span>
                          {task.isRecurring && (
                            <span className="text-[10px] bg-purple-100 text-purple-800 font-semibold px-2 py-0.5 rounded-full">
                              Recurrente cada {task.recurringIntervalDays} días
                            </span>
                          )}
                        </div>
                        <h3 className="text-base font-bold text-slate-800 tracking-tight leading-tight pt-1">
                          {task.description}
                        </h3>
                        <p className="text-xs text-slate-500 font-medium">
                          Ubicación: <span className="text-slate-800 font-semibold">{task.location}</span>
                        </p>
                      </div>

                      {/* Immediate actions */}
                      <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-auto">
                        {task.status !== 'Completada' && (
                          <button
                            onClick={() => markTaskCompleted(task)}
                            className="bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg p-1.5 hover:bg-emerald-100 text-xs font-bold flex items-center gap-1"
                            title="Completar Tarea"
                          >
                            <CheckCircle className="w-4 h-4 text-emerald-600 animate-bounce" /> Completar
                          </button>
                        )}
                        {task.status !== 'Completada' && (
                          <div className="flex border border-slate-200 rounded-lg overflow-hidden bg-white shrink-0">
                            <button
                              onClick={() => handleDelay(task, 'Lluvia')}
                              className="px-2 py-1.5 text-xs text-amber-800 font-bold hover:bg-amber-50 border-r border-slate-200 flex items-center gap-0.5"
                              title="Pospone por lluvia"
                            >
                              <CloudRain className="w-3" /> Lluvia
                            </button>
                            <button
                              onClick={() => handleDelay(task, 'Hecho Fortuito')}
                              className="px-2 py-1.5 text-xs text-slate-700 font-bold hover:bg-slate-100"
                              title="Pospone por hecho fortuito"
                            >
                              Fortuito
                            </button>
                          </div>
                        )}
                        <button
                          onClick={() => onDeleteTask(task.id)}
                          className="text-slate-400 hover:text-red-500 p-1.5 rounded-lg hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Mid Section: Workers, implements lists, and timings */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase font-display block mb-1">Duración y Tiempos</span>
                        <div className="space-y-1 font-medium text-slate-700">
                          <p>Inicio: <span className="font-mono text-slate-900 font-semibold">{task.startDate}</span></p>
                          <p>Fin: <span className="font-mono text-slate-900 font-semibold">{task.endDate || 'No culminó'}</span></p>
                          {task.nextScheduledDate && (
                            <p className="text-purple-700">Próxima repetición: <span className="font-mono font-bold">{task.nextScheduledDate}</span></p>
                          )}
                        </div>
                      </div>
                      
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase font-display block mb-1">Cuadrilla Utilizada ({task.assignedWorkerIds.length})</span>
                        <div className="flex flex-wrap gap-1">
                          {task.assignedWorkerIds.map(id => {
                            const worker = workers.find(w => w.id === id);
                            return (
                              <span 
                                key={id} 
                                className="bg-slate-150 text-slate-800 text-[11px] font-semibold px-2 py-0.5 rounded-full"
                              >
                                {worker?.name || id}
                              </span>
                            );
                          })}
                          {task.assignedWorkerIds.length === 0 && (
                            <span className="text-red-500 italic font-bold text-[11px]">Personal sin asignar</span>
                          )}
                        </div>
                      </div>

                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase font-display block mb-1">Implementos Utilizados ({task.materialsUsed.length})</span>
                        <div className="flex flex-wrap gap-1">
                          {task.materialsUsed.map(m => (
                            <span 
                              key={m} 
                              className="bg-emerald-50 text-emerald-800 text-[10px] font-semibold px-2 py-0.5 rounded border border-emerald-100"
                            >
                              {m}
                            </span>
                          ))}
                          {task.materialsUsed.length === 0 && (
                            <span className="text-slate-400 italic">No especificados</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Photo upload: antes / durante / despues */}
                    <div className="pt-3 border-t border-slate-100 space-y-2">
                      <span className="text-[11px] font-bold text-slate-500 font-display block">Evidencia Gráfica del Avance Municipal:</span>
                      <div className="grid grid-cols-3 gap-3">
                        {/* ANTES */}
                        <div className="border border-slate-200 rounded-lg p-2 bg-slate-50 text-center space-y-1 flex flex-col justify-between min-h-[110px]">
                          <span className="text-[10px] font-bold text-slate-500 block uppercase font-display">Antes</span>
                          {task.images.antes ? (
                            <div className="relative group">
                              <img 
                                src={task.images.antes} 
                                alt="Antes" 
                                className="w-full h-16 object-cover rounded border" 
                                referrerPolicy="no-referrer"
                              />
                              <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition rounded flex items-center justify-center cursor-pointer text-[10px] text-white">
                                Cambiar
                                <input 
                                  type="file" 
                                  accept="image/*" 
                                  onChange={(e) => handlePhotoUpload(e, 'antes', task)} 
                                  className="hidden" 
                                />
                              </label>
                            </div>
                          ) : (
                            <label className="flex flex-col items-center justify-center h-16 border border-dashed border-slate-300 rounded cursor-pointer hover:bg-slate-100/50">
                              <Camera className="w-5 h-5 text-slate-400" />
                              <span className="text-[9px] text-slate-500">Cargar</span>
                              <input 
                                type="file" 
                                accept="image/*" 
                                onChange={(e) => handlePhotoUpload(e, 'antes', task)} 
                                className="hidden" 
                              />
                            </label>
                          )}
                        </div>

                        {/* DURANTE */}
                        <div className="border border-slate-200 rounded-lg p-2 bg-slate-50 text-center space-y-1 flex flex-col justify-between min-h-[110px]">
                          <span className="text-[10px] font-bold text-slate-500 block uppercase font-display">Durante</span>
                          {task.images.durante ? (
                            <div className="relative group">
                              <img 
                                src={task.images.durante} 
                                alt="Durante" 
                                className="w-full h-16 object-cover rounded border" 
                                referrerPolicy="no-referrer"
                              />
                              <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition rounded flex items-center justify-center cursor-pointer text-[10px] text-white">
                                Cambiar
                                <input 
                                  type="file" 
                                  accept="image/*" 
                                  onChange={(e) => handlePhotoUpload(e, 'durante', task)} 
                                  className="hidden" 
                                />
                              </label>
                            </div>
                          ) : (
                            <label className="flex flex-col items-center justify-center h-16 border border-dashed border-slate-300 rounded cursor-pointer hover:bg-slate-100/50">
                              <Camera className="w-5 h-5 text-slate-400" />
                              <span className="text-[9px] text-slate-500">Cargar</span>
                              <input 
                                type="file" 
                                accept="image/*" 
                                onChange={(e) => handlePhotoUpload(e, 'durante', task)} 
                                className="hidden" 
                              />
                            </label>
                          )}
                        </div>

                        {/* DESPUES */}
                        <div className="border border-slate-200 rounded-lg p-2 bg-slate-50 text-center space-y-1 flex flex-col justify-between min-h-[110px]">
                          <span className="text-[10px] font-bold text-slate-500 block uppercase font-display">Cuando termine</span>
                          {task.images.despues ? (
                            <div className="relative group">
                              <img 
                                src={task.images.despues} 
                                alt="Después" 
                                className="w-full h-16 object-cover rounded border" 
                                referrerPolicy="no-referrer"
                              />
                              <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition rounded flex items-center justify-center cursor-pointer text-[10px] text-white">
                                Cambiar
                                <input 
                                  type="file" 
                                  accept="image/*" 
                                  onChange={(e) => handlePhotoUpload(e, 'despues', task)} 
                                  className="hidden" 
                                />
                              </label>
                            </div>
                          ) : (
                            <label className="flex flex-col items-center justify-center h-16 border border-dashed border-slate-300 rounded cursor-pointer hover:bg-slate-100/50">
                              <Camera className="w-5 h-5 text-slate-400" />
                              <span className="text-[9px] text-slate-500">Cargar</span>
                              <input 
                                type="file" 
                                accept="image/*" 
                                onChange={(e) => handlePhotoUpload(e, 'despues', task)} 
                                className="hidden" 
                              />
                            </label>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Notes expansion if there are any */}
                    {task.notes && (
                      <div className="bg-slate-50 text-slate-650 p-2.5 rounded-lg text-xs leading-relaxed border-l-4 border-slate-300">
                        <span className="font-bold text-slate-800">Notas de campo:</span> {task.notes}
                      </div>
                    )}

                    <div className="flex justify-end pt-1">
                      <button 
                        onClick={() => setSelectedTaskId(selectedTaskId === task.id ? null : task.id)}
                        className="text-[11px] font-bold text-slate-600 hover:text-emerald-700"
                      >
                        {selectedTaskId === task.id ? 'Cerrar Edición Detalles' : 'Ver / Editar Asignación Cuadrilla'}
                      </button>
                    </div>

                    {/* Task worker/materials modification inline edit */}
                    {selectedTaskId === task.id && (
                      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs space-y-3">
                        <h4 className="font-bold text-slate-800">Asignar Personal y Herramientas:</h4>
                        
                        <div className="space-y-1">
                          <span className="font-semibold text-slate-600 block">Personal Activo Disponible:</span>
                          <div className="flex flex-wrap gap-2">
                            {activeWorkersList.map(worker => {
                              const isAssigned = task.assignedWorkerIds.includes(worker.id);
                              return (
                                <button
                                  key={worker.id}
                                  onClick={() => {
                                    const assigned = isAssigned 
                                      ? task.assignedWorkerIds.filter(id => id !== worker.id)
                                      : [...task.assignedWorkerIds, worker.id];
                                    onUpdateTask({ ...task, assignedWorkerIds: assigned });
                                  }}
                                  className={`px-2.5 py-1 rounded-lg font-semibold border text-[11px] transition ${
                                    isAssigned 
                                      ? 'bg-emerald-800 border-emerald-800 text-white' 
                                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                                  }`}
                                >
                                  {worker.name} ({worker.brigade})
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        <div className="space-y-1 Pt-1">
                          <span className="font-semibold text-slate-600 block">Materiales Asignados:</span>
                          <div className="flex flex-wrap gap-2">
                            {STANDARD_MATERIALS.map(m => {
                              const hasMat = task.materialsUsed.includes(m);
                              return (
                                <button
                                  key={m}
                                  onClick={() => {
                                    const mats = hasMat 
                                      ? task.materialsUsed.filter(item => item !== m)
                                      : [...task.materialsUsed, m];
                                    onUpdateTask({ ...task, materialsUsed: mats });
                                  }}
                                  className={`px-2 py-1 rounded border text-[10px] ${
                                    hasMat 
                                      ? 'bg-blue-100 border-blue-400 text-blue-900 font-bold' 
                                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                                  }`}
                                >
                                  {m}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    )}

                  </div>
                ))
              )}
            </div>

          </div>

          {/* Right Column: New Task Creation Drawer form (No-print) */}
          <div className="no-print space-y-4">
            {showAddForm ? (
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b pb-2">
                  <h3 className="font-bold text-slate-900 font-display text-sm">Nueva Planificación</h3>
                  <button 
                    onClick={() => setShowAddForm(false)} 
                    className="text-slate-400 hover:text-slate-600 font-bold text-lg"
                  >
                    ×
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 block">Descripción Técnica de la Tarea:</label>
                    <textarea
                      rows={2}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Ej., Desmalezamiento de brocales y limpieza del mirador"
                      className="w-full border rounded-lg p-2 focus:ring-1 focus:ring-emerald-700 outline-none"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 block">Ubicación / Calle / Plaza:</label>
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="Ej., Plaza Bolívar, Entrada Sur"
                      className="w-full border rounded-lg p-2 focus:ring-1 focus:ring-emerald-700 outline-none"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 block">Pilar del Plan Operativo Ornato:</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value as TaskCategory)}
                      className="w-full border rounded-lg p-2 focus:ring-1 focus:ring-emerald-700 outline-none bg-white font-medium"
                    >
                      {CATEGORIES.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="font-bold text-slate-700 block">Fecha Ejecución:</label>
                      <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full border rounded-lg p-1.5 focus:ring-1 focus:ring-emerald-700 outline-none font-mono"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-slate-700 block">Cant. Obreros Requerida:</label>
                      <input
                        type="number"
                        min={1}
                        value={numWorkersNeeded}
                        onChange={(e) => setNumWorkersNeeded(Number(e.target.value))}
                        className="w-full border rounded-lg p-1.5 focus:ring-1 focus:ring-emerald-700 outline-none font-mono"
                      />
                    </div>
                  </div>

                  {/* Periodicity planning setting! */}
                  <div className="bg-purple-50/50 p-2.5 rounded-lg border border-purple-100 space-y-2">
                    <label className="flex items-center gap-2 font-bold text-purple-900 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isRecurring}
                        onChange={(e) => setIsRecurring(e.target.checked)}
                        className="w-4 h-4 text-purple-700 rounded focus:ring-purple-500"
                      />
                      ¿Es una Tarea Periódica / Rutina?
                    </label>

                    {isRecurring && (
                      <div className="space-y-1.5 animate-fadeIn">
                        <span className="text-[10px] text-purple-800 block">
                          El sistema reprogramará automáticamente la siguiente ejecución de nuevo al completar esta.
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-semibold text-slate-600 leading-tight">Repetir cada:</span>
                          <input
                            type="number"
                            min={1}
                            value={recurringIntervalDays}
                            onChange={(e) => setRecurringIntervalDays(Number(e.target.value))}
                            className="w-16 border rounded bg-white p-1 font-mono text-center font-bold text-xs"
                          />
                          <span className="text-[11px] font-semibold text-slate-600">días.</span>
                        </div>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => setRecurringIntervalDays(1)}
                            className="bg-white text-[9px] hover:bg-purple-100 border px-1.5 py-0.5 rounded"
                          >
                            Diario
                          </button>
                          <button
                            type="button"
                            onClick={() => setRecurringIntervalDays(7)}
                            className="bg-white text-[9px] hover:bg-purple-100 border px-1.5 py-0.5 rounded"
                          >
                            Semanal (7d)
                          </button>
                          <button
                            type="button"
                            onClick={() => setRecurringIntervalDays(15)}
                            className="bg-white text-[9px] hover:bg-purple-100 border px-1.5 py-0.5 rounded"
                          >
                            Quincenal (15d)
                          </button>
                          <button
                            type="button"
                            onClick={() => setRecurringIntervalDays(20)}
                            className="bg-white text-[9px] hover:bg-purple-100 border px-1.5 py-0.5 rounded"
                          >
                            Cada 20d
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Worker assignment checks */}
                  <div className="space-y-1.5 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                    <span className="font-bold text-slate-700 block">Personal Asignado:</span>
                    <div className="max-h-[140px] overflow-y-auto space-y-1.5 pr-1">
                      {activeWorkersList.map(worker => (
                        <label key={worker.id} className="flex items-center gap-2 font-medium text-slate-750 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={assignedWorkerIds.includes(worker.id)}
                            onChange={() => handleWorkerToggle(worker.id)}
                            className="w-3.5 h-3.5 text-emerald-800 rounded focus:ring-emerald-500"
                          />
                          <span>{worker.name} <span className="text-[9px] text-slate-400 font-bold">({worker.brigade})</span></span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Materials selection checklist */}
                  <div className="space-y-1.5 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                    <span className="font-bold text-slate-700 block">Herramientas & Implementos:</span>
                    <div className="flex flex-wrap gap-1">
                      {STANDARD_MATERIALS.map(m => {
                        const isSel = selectedMaterials.includes(m);
                        return (
                          <button
                            type="button"
                            key={m}
                            onClick={() => handleMaterialToggle(m)}
                            className={`text-[10px] px-1.5 py-0.5 rounded border transition ${
                              isSel 
                                ? 'bg-emerald-800 border-emerald-800 text-white font-bold' 
                                : 'bg-white border-slate-300 text-slate-650 hover:bg-slate-100'
                            }`}
                          >
                            {m}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 block">Instrucciones Adicionales o Notas (Opcional):</label>
                    <input
                      type="text"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Ej., Usar botas de caña larga y lentes protectores"
                      className="w-full border rounded-lg p-2 focus:ring-1 focus:ring-emerald-700 outline-none"
                    />
                  </div>

                  <div className="pt-2 flex gap-2">
                    <button
                      type="submit"
                      className="flex-1 bg-emerald-800 hover:bg-emerald-900 text-white font-bold py-2 rounded-lg text-xs"
                    >
                      Programar Ejecución
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowAddForm(false)}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-4 py-2 rounded-lg text-xs"
                    >
                      Cancelar
                    </button>
                  </div>

                </form>
              </div>
            ) : (
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 space-y-3 shadow-sm text-xs">
                <div className="flex items-center gap-1.5 text-emerald-800 font-bold font-display text-sm">
                  <Sparkles className="w-5 h-5 text-emerald-600 block shrink-0" />
                  <h4>Automatización de Rutinas</h4>
                </div>
                <p className="text-slate-700 leading-relaxed">
                  Para no olvidar trabajos rutinarios cruciales (como la limpieza periódica de plazas, iglesias, regados, desmalezamientos quincenales, etc.):
                </p>
                <ol className="list-decimal pl-4 space-y-1.5 text-slate-600 font-medium">
                  <li>Active la casilla <span className="font-bold text-slate-800">Tarea Periódica</span> al crearla.</li>
                  <li>Escriba el intervalo de repetición (Ej. <span className="font-bold text-slate-800">15</span> días o <span className="font-bold text-slate-800">20</span> días).</li>
                  <li>Al marcar la tarea como <span className="font-bold text-emerald-700">Completada</span>, se creará automáticamente la siguiente tarea en el calendario.</li>
                </ol>
                <div className="pt-2">
                  <button
                    onClick={() => { resetForm(); setShowAddForm(true); }}
                    className="w-full text-center bg-white text-emerald-800 hover:bg-emerald-100 border border-emerald-300 font-extrabold py-2 rounded-lg transition"
                  >
                    Establecer Rutinas de Ornato
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>
      )}

    </div>
  );
}
