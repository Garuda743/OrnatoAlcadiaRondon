/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Worker, Task, VacationPeriod, DayAttendance, POAGoal, AttendanceRecord } from './types';
import { 
  INITIAL_WORKERS, 
  INITIAL_TASKS, 
  INITIAL_VACATIONS, 
  INITIAL_ATTENDANCE, 
  INITIAL_POA_METAS 
} from './initialData';
import Dashboard from './components/Dashboard';
import Planificacion from './components/Planificacion';
import Asistencia from './components/Asistencia';
import Vacaciones from './components/Vacaciones';
import Personal from './components/Personal';
import POAStats from './components/POAStats';

import { 
  Home, 
  CalendarClock, 
  CheckSquare, 
  TrendingUp, 
  Users, 
  Briefcase, 
  RotateCcw,
  CloudSun,
  LayoutDashboard,
  Menu,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('inicio');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Core municipal states with lazy initialization from localStorage
  const [workers, setWorkers] = useState<Worker[]>(() => {
    const saved = localStorage.getItem('ornato_workers');
    return saved ? JSON.parse(saved) : INITIAL_WORKERS;
  });

  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('ornato_tasks');
    return saved ? JSON.parse(saved) : INITIAL_TASKS;
  });

  const [vacations, setVacations] = useState<VacationPeriod[]>(() => {
    const saved = localStorage.getItem('ornato_vacations');
    return saved ? JSON.parse(saved) : INITIAL_VACATIONS;
  });

  const [attendance, setAttendance] = useState<DayAttendance[]>(() => {
    const saved = localStorage.getItem('ornato_attendance');
    return saved ? JSON.parse(saved) : INITIAL_ATTENDANCE;
  });

  const [poaGoals, setPoaGoals] = useState<POAGoal[]>(() => {
    const saved = localStorage.getItem('ornato_poa');
    return saved ? JSON.parse(saved) : INITIAL_POA_METAS;
  });

  // Persist states automatically
  useEffect(() => {
    localStorage.setItem('ornato_workers', JSON.stringify(workers));
  }, [workers]);

  useEffect(() => {
    localStorage.setItem('ornato_tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('ornato_vacations', JSON.stringify(vacations));
  }, [vacations]);

  useEffect(() => {
    localStorage.setItem('ornato_attendance', JSON.stringify(attendance));
  }, [attendance]);

  useEffect(() => {
    localStorage.setItem('ornato_poa', JSON.stringify(poaGoals));
  }, [poaGoals]);

  // Restores standard seeded values
  const handleResetData = () => {
    if (confirm('¿Está seguro de reiniciar los de datos? Se perderán las modificaciones realizadas y se recargarán los obreros y planificaciones originales.')) {
      setWorkers(INITIAL_WORKERS);
      setTasks(INITIAL_TASKS);
      setVacations(INITIAL_VACATIONS);
      setAttendance(INITIAL_ATTENDANCE);
      setPoaGoals(INITIAL_POA_METAS);
      localStorage.clear();
      setActiveTab('inicio');
      setIsMobileMenuOpen(false);
      alert('Datos reiniciados con éxito.');
    }
  };

  // State handlers logic
  const handleAddTask = (newTask: Omit<Task, 'id'>) => {
    const id = `t_usr_${Date.now()}`;
    setTasks(prev => [{ ...newTask, id } as Task, ...prev]);
  };

  const handleUpdateTask = (updatedTask: Task) => {
    setTasks(prev => prev.map(t => t.id === updatedTask.id ? updatedTask : t));
  };

  const handleDeleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  const handleAddWorker = (newWorker: Worker) => {
    setWorkers(prev => [...prev, newWorker]);
  };

  const handleUpdateWorker = (updatedWorker: Worker) => {
    setWorkers(prev => prev.map(w => w.id === updatedWorker.id ? updatedWorker : w));
  };

  const handleDeleteWorker = (id: string) => {
    setWorkers(prev => prev.filter(w => w.id !== id));
    // Set associated tasks runner worker removal
    setTasks(prev => prev.map(t => ({
      ...t,
      assignedWorkerIds: t.assignedWorkerIds.filter(wid => wid !== id)
    })));
  };

  const handleAddVacation = (newVacation: Omit<VacationPeriod, 'id'>) => {
    const id = `v_usr_${Date.now()}`;
    setVacations(prev => [...prev, { ...newVacation, id } as VacationPeriod]);
  };

  const handleUpdateVacation = (updatedVac: VacationPeriod) => {
    setVacations(prev => prev.map(v => v.id === updatedVac.id ? updatedVac : v));
  };

  const handleDeleteVacation = (id: string) => {
    setVacations(prev => prev.filter(v => v.id !== id));
  };

  const handleSaveDayAttendance = (date: string, records: Record<string, AttendanceRecord>) => {
    setAttendance(prev => {
      const idx = prev.findIndex(a => a.date === date);
      if (idx !== -1) {
        // Overwrite existing registry
        const copy = [...prev];
        copy[idx] = { date, records };
        return copy;
      } else {
        // Append new registry
        return [...prev, { date, records }];
      }
    });

    // Automatically check if any worker is marked on vacation/reposo and sync status
    // to improve administrative workflow!
    setWorkers(prevWorkers => prevWorkers.map(w => {
      const rec = records[w.id];
      if (rec) {
        if (rec.status === 'V' && w.status !== 'Vacaciones') {
          return { ...w, status: 'Vacaciones' };
        }
        if (rec.status === 'R' && w.status !== 'Reposo') {
          return { ...w, status: 'Reposo' };
        }
        if (rec.status === 'A' && (w.status === 'Vacaciones' || w.status === 'Reposo')) {
          return { ...w, status: 'Activo' };
        }
      }
      return w;
    }));
  };

  const handleUpdateGoalProgress = (goalId: string, amount: number) => {
    setPoaGoals(prev => prev.map(g => {
      if (g.id === goalId) {
        return {
          ...g,
          completedQuantity: g.completedQuantity + amount
        };
      }
      return g;
    }));
  };

  // Calculate POAGoal general accomplishment
  const totalPOATarget = poaGoals.reduce((sum, g) => sum + g.targetQuantity, 0);
  const totalPOACompleted = poaGoals.reduce((sum, g) => sum + g.completedQuantity, 0);
  const overallSuccessRate = totalPOATarget > 0 ? Math.round((totalPOACompleted / totalPOATarget) * 100) : 0;

  const navItems = [
    { id: 'inicio', label: 'Cuadro de Mando', icon: Home },
    { id: 'planificacion', label: 'Planificación Ornato', icon: CalendarClock },
    { id: 'asistencia', label: 'Control Asistencia', icon: CheckSquare },
    { id: 'vacaciones', label: 'Vacaciones Retornos', icon: Briefcase },
    { id: 'personal', label: 'Personal & Cuadrillas', icon: Users },
    { id: 'reportes', label: 'Reportes & Metas POA', icon: TrendingUp }
  ];

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col lg:flex-row font-sans text-slate-800 select-none antialiased">
      
      {/* ----------------- SIDEBAR NAVIGATION (Desktop) [No-Print] ----------------- */}
      <aside className="no-print w-60 bg-slate-900 text-white hidden lg:flex flex-col shrink-0 border-r border-slate-800">
        {/* Ribbon Flag Indicator */}
        <div className="h-1 bg-gradient-to-r from-yellow-400 via-blue-600 to-red-650 shrink-0"></div>
        
        {/* Sidebar Header Brand */}
        <div className="p-5 border-b border-slate-800">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-display">Municipio</div>
          <div className="text-base font-bold text-white tracking-tight leading-tight">Juan José Rondón</div>
          <div className="text-[9px] text-blue-400 font-bold uppercase tracking-wide">Estado Guárico</div>
        </div>

        {/* Sidebar Links */}
        <nav className="flex-1 py-4 px-2.5 space-y-1">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded text-xs uppercase font-extrabold font-display transition-all duration-150 text-left ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm font-semibold'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Authorized User Profile Section */}
        <div className="p-3 bg-slate-950 border-t border-slate-800">
          <div className="flex items-center space-x-2 bg-slate-900 border border-slate-850 p-2 rounded">
            <div className="w-8 h-8 rounded bg-blue-600 border border-blue-500 flex items-center justify-center text-xs font-black text-white">
              JD
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-[11px] font-extrabold text-white truncate uppercase font-display leading-tight">Coord. Operativa</p>
              <p className="text-[9px] text-slate-400 truncate tracking-wide font-medium">Juan Delgado</p>
            </div>
          </div>
        </div>
      </aside>

      {/* ----------------- MOBILE BRAND HEADER [No-Print] ----------------- */}
      <div className="no-print lg:hidden bg-slate-900 text-white p-3 flex justify-between items-center border-b border-slate-850 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-white/14 text-white rounded flex items-center justify-center font-bold text-xs ring-1 ring-white/10">
            AJR
          </div>
          <div>
            <div className="text-[9px] font-bold text-yellow-400 uppercase leading-none font-display">Alcaldía Juan José Rondón</div>
            <h2 className="text-xs font-black text-white tracking-tight uppercase leading-none mt-0.5 font-display">Ornato Las Mercedes</h2>
          </div>
        </div>

        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-1 rounded hover:bg-slate-800 transition text-slate-200 focus:outline-none"
          title="Abrir Menú"
        >
          {isMobileMenuOpen ? <X className="w-5 h-5 text-red-400" /> : <Menu className="w-5 h-5 text-slate-100" />}
        </button>
      </div>

      {/* MOBILE DRAWER OVERLAY */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.15 }}
            className="no-print lg:hidden bg-slate-900 border-b border-slate-800 text-white px-4 py-3 flex flex-col gap-2.5 z-40 absolute left-0 right-0 top-[53px] shadow-lg shrink-0"
          >
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded text-xs uppercase font-extrabold font-display transition ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ----------------- RIGHT COLUMN (Header, Main view & Footer) ----------------- */}
      <div className="flex-1 flex flex-col min-w-0 bg-slate-100 overflow-x-hidden">
        
        {/* FORMAL MUNICIPAL HEADER */}
        <header className="bg-white border-b border-slate-200 p-4 shrink-0 shadow-xs flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center space-x-3 md:space-x-4">
            <div className="w-14 h-14 bg-slate-50 border border-slate-350 flex flex-col items-center justify-center text-[8px] text-slate-500 uppercase italic text-center font-bold font-display tracking-tight leading-none shrink-0 rounded select-none shadow-2xs">
              <span>ESCUDO</span>
              <span className="text-[7px] text-slate-400 mt-0.5">OFICIAL</span>
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-bold text-slate-900 uppercase tracking-tight font-display leading-tight">
                Coordinación de Ornato y Espacios Públicos
              </h1>
              <p className="text-xs text-slate-500 italic mt-0.5">"Servicio y Compromiso con Las Mercedes"</p>
            </div>
          </div>

          <div className="flex items-center space-x-4 self-end md:self-auto flex-wrap gap-2">
            
            {/* POA global indicator */}
            <div className="text-right border-r pr-4 border-slate-200">
              <div className="text-[10px] uppercase font-bold text-slate-400 font-display">Estatus POA 2026</div>
              <div className="flex items-center gap-2 mt-0.5">
                <div className="w-24 bg-slate-200 h-2 rounded-full overflow-hidden shrink-0 border">
                  <div className="bg-green-500 h-full transition-all duration-300" style={{ width: `${overallSuccessRate}%` }}></div>
                </div>
                <span className="text-xs font-extrabold text-green-600 font-mono shrink-0">{overallSuccessRate}% Metas</span>
              </div>
            </div>

            {/* Quick weather status & reset widget [No-Print] */}
            <div className="no-print flex items-center gap-2">
              <div className="hidden sm:flex items-center gap-1.5 bg-slate-50 border p-1.5 rounded text-[10px] text-slate-650 font-bold">
                <CloudSun className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>Soleado • Las Mercedes</span>
              </div>

              <button 
                onClick={handleResetData}
                className="text-[9px] bg-slate-850 hover:bg-slate-950 text-white font-extrabold uppercase px-2.5 py-1.5 rounded shadow-2xs flex items-center gap-1 transition"
                title="Reiniciar base de datos a semilla original"
              >
                <RotateCcw className="w-3 h-3" /> Reiniciar
              </button>
            </div>

          </div>
        </header>

        {/* MAIN MODULE CONTENT WRAPPER */}
        <main className="flex-1 p-4 lg:p-6 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
              className="w-full h-full"
            >
              {activeTab === 'inicio' && (
                <Dashboard 
                  workers={workers} 
                  tasks={tasks} 
                  vacations={vacations} 
                  poaGoals={poaGoals} 
                  onNavigate={setActiveTab}
                />
              )}

              {activeTab === 'planificacion' && (
                <Planificacion 
                  workers={workers} 
                  tasks={tasks} 
                  onAddTask={handleAddTask} 
                  onUpdateTask={handleUpdateTask} 
                  onDeleteTask={handleDeleteTask}
                />
              )}

              {activeTab === 'asistencia' && (
                <Asistencia 
                  workers={workers} 
                  attendance={attendance} 
                  onSaveDayAttendance={handleSaveDayAttendance}
                />
              )}

              {activeTab === 'vacaciones' && (
                <Vacaciones 
                  workers={workers} 
                  vacations={vacations} 
                  onAddVacation={handleAddVacation} 
                  onUpdateVacation={handleUpdateVacation} 
                  onDeleteVacation={handleDeleteVacation}
                  onUpdateWorkerStatus={(id, status) => {
                    setWorkers(prev => prev.map(w => w.id === id ? { ...w, status } : w));
                  }}
                />
              )}

              {activeTab === 'personal' && (
                <Personal 
                  workers={workers} 
                  onAddWorker={handleAddWorker} 
                  onUpdateWorker={handleUpdateWorker} 
                  onDeleteWorker={handleDeleteWorker}
                />
              )}

              {activeTab === 'reportes' && (
                <POAStats 
                  workers={workers} 
                  tasks={tasks} 
                  poaGoals={poaGoals} 
                  onUpdateGoalProgress={handleUpdateGoalProgress}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* OFFICIAL STAMP FOOTER */}
        <footer className="bg-slate-200 border-t border-slate-350 px-6 py-4 flex flex-col sm:flex-row justify-between items-center sm:items-end gap-4 shrink-0 h-auto sm:h-20 text-slate-550">
          <div className="flex space-x-8 text-center sm:text-left">
            <div className="text-center">
              <div className="w-24 border-b border-slate-700/60 mx-auto"></div>
              <div className="text-[9px] font-bold uppercase mt-1 tracking-wider text-slate-705">Coord. Ornato</div>
            </div>
            <div className="text-center">
              <div className="w-24 border-b border-slate-700/60 mx-auto"></div>
              <div className="text-[9px] font-bold uppercase mt-1 tracking-wider text-slate-705">Recursos Humanos</div>
            </div>
          </div>
          <div className="text-center sm:text-right text-[9px] leading-tight uppercase font-medium">
            <p>Sistema de Planificación Técnica de Ornato v1.1.0-HighDensity</p>
            <p>Juan José Rondón - Municipio Las Mercedes</p>
            <p className="text-slate-400">© 2026 Alcaldía del Municipio</p>
          </div>
        </footer>

      </div>

    </div>
  );
}

