import React, { useState } from 'react';
import { Worker, Task, POAGoal } from '../types';
import { TrendingUp, FileSpreadsheet, Percent, Calendar, Sparkles, Filter, ChevronRight, AlertTriangle, AlertCircle, Printer } from 'lucide-react';
import HeaderOfic, { PrintSignatures } from './HeaderOfic';

interface POAStatsProps {
  workers: Worker[];
  tasks: Task[];
  poaGoals: POAGoal[];
  onUpdateGoalProgress: (id: string, amount: number) => void;
}

type PeriodFilter = 'Semanal' | 'Bisemanal' | 'Trisemanal' | 'Mensual' | 'Trimestral' | 'Semestral' | 'Anual';

export default function POAStats({ workers, tasks, poaGoals, onUpdateGoalProgress }: POAStatsProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodFilter>('Semanal');
  const [isPrintLayout, setIsPrintLayout] = useState(false);

  // Manual increase input state for goals (just to make the system highly interactive!)
  const [editingGoalId, setEditingGoalId] = useState<string | null>(null);
  const [progressAmount, setProgressAmount] = useState<number>(1);

  // Filter duration logic or simulation multiplier reflecting period density
  const getPeriodLabel = () => {
    switch (selectedPeriod) {
      case 'Semanal': return 'Semana en Curso (Últimos 7 días)';
      case 'Bisemanal': return 'Bi-semanal (Últimos 14 días)';
      case 'Trisemanal': return 'Tri-semanal (Últimos 21 días)';
      case 'Mensual': return 'Mensual (Periodo de 30 días)';
      case 'Trimestral': return 'Informe Trimestral de Gestión (Enero-Marzo / Abril-Junio)';
      case 'Semestral': return 'Informe Semestral de Desempeño (Metas de Medio Año)';
      case 'Anual': return 'Plan Operativo Anual (POA 2026 - Año Completo)';
    }
  };

  // Metas Cumplidas vs Faltantes computing
  // Let's calculate for each goal the current status
  const totalCompleted = poaGoals.reduce((sum, g) => sum + g.completedQuantity, 0);
  const totalTarget = poaGoals.reduce((sum, g) => sum + g.targetQuantity, 0);
  const overallSuccessRate = totalTarget > 0 ? Math.round((totalCompleted / totalTarget) * 100) : 0;

  const metGoalsCount = poaGoals.filter(g => g.completedQuantity >= g.targetQuantity).length;
  const pendingGoalsCount = poaGoals.length - metGoalsCount;

  // Let's create a downloader function for EXCEL / CSV export
  const exportToCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,\uFEFF"; // Include BOM for Excel Spanish encoding
    
    // Header
    csvContent += "REPÚBLICA BOLIVARIANA DE VENEZUELA - ALCALDÍA JUAN JOSÉ RONDÓN - COORDINACIÓN DE ORNATO\n";
    csvContent += `INFORME ESTADÍSTICO DE METAS - PERIODO: ${selectedPeriod} (${getPeriodLabel()})\n\n`;
    csvContent += "ID;Pilar Operativo Ornato;Meta del POA (Plan Operativo Anual);Porcentaje Logrado;Meta Planificada;Cantidad Lograda;Cantidad Faltante;Unidad de Medida;Estatus\n";
    
    // Rows
    poaGoals.forEach(goal => {
      const achieved = goal.completedQuantity;
      const target = goal.targetQuantity;
      const missing = Math.max(0, target - achieved);
      const percent = target > 0 ? Math.round((achieved / target) * 100) : 0;
      const estatus = percent >= 100 ? "Cumplida" : percent >= 50 ? "En Progreso" : "Crítico";
      
      csvContent += `${goal.id};"${goal.pillar}";"${goal.description}";${percent}%;${target};${achieved};${missing};"${goal.unit}";"${estatus}"\n`;
    });

    // Generate URI and download
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `POA_REPORTE_${selectedPeriod.toUpperCase()}_ORNATO_LAS_MERCEDES.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleUpdateProgressSubmit = (goalId: string) => {
    onUpdateGoalProgress(goalId, progressAmount);
    setEditingGoalId(null);
    setProgressAmount(1);
    alert('Logro del POA registrado exitosamente.');
  };

  return (
    <div className="space-y-6 text-xs">
      
      {/* Filters & Export Options (No-Print) */}
      <div className="no-print bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-b pb-3">
          <div className="space-y-1 text-center md:text-left">
            <h3 className="font-bold text-slate-900 font-display text-sm flex items-center justify-center md:justify-start gap-1">
              <TrendingUp className="w-5 h-5 text-emerald-800" />
              Auditoría y Estadísticas del Plan Operativo Anual (POA)
            </h3>
            <p className="text-xs text-slate-500">Filtrado analítico por lapsos de tiempo reglamentarios y exportación de informes oficiales</p>
          </div>

          <div className="flex flex-wrap gap-2 justify-center">
            <button
              onClick={exportToCSV}
              className="text-xs bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-extrabold px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 transition"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-700" /> Exportar a Excel (CSV)
            </button>
            <button
              onClick={() => setIsPrintLayout(!isPrintLayout)}
              className="text-xs bg-slate-800 hover:bg-slate-900 text-white font-extrabold px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 transition"
            >
              <Printer className="w-4 h-4" /> {isPrintLayout ? 'Salir de Modo Imprimir' : 'Generar PDF para Firma'}
            </button>
          </div>
        </div>

        {/* Lapsos Filters */}
        <div className="flex flex-wrap items-center gap-1 bg-slate-50 p-1.5 rounded-lg border">
          <span className="text-[10px] font-bold text-slate-500 px-2 uppercase tracking-wide">Filtro Temporal:</span>
          {(['Semanal', 'Bisemanal', 'Trisemanal', 'Mensual', 'Trimestral', 'Semestral', 'Anual'] as const).map(period => (
            <button
              key={period}
              onClick={() => setSelectedPeriod(period)}
              className={`text-[10px] font-bold px-3 py-1.5 rounded font-display transition-all ${
                selectedPeriod === period 
                  ? 'bg-emerald-800 text-white shadow-sm' 
                  : 'text-slate-600 hover:bg-white hover:text-slate-850'
              }`}
            >
              {period}
            </button>
          ))}
        </div>
      </div>

      {/* -------------------- FULL PRINT / PDF GENERATION MODE -------------------- */}
      {isPrintLayout ? (
        <div className="bg-white p-8 rounded-xl border-3 border-slate-700 shadow-md max-w-4xl mx-auto space-y-6">
          <div className="text-right no-print">
            <button
              onClick={() => window.print()}
              className="text-xs bg-emerald-700 text-white font-bold px-6 py-2 rounded-lg hover:bg-emerald-800 transition shadow inline-flex items-center gap-1.5"
            >
              <Printer className="w-4 h-4" /> Ejecutar Impresión (PDF)
            </button>
          </div>

          <HeaderOfic 
            title={`INFORME ESTADÍSTICO DE METAS - PERIODO ${selectedPeriod.toUpperCase()}`}
            subtitle={`Lapsos de análisis: ${getPeriodLabel()} - Consolidado de Ornato`} 
          />

          {/* Quick Stats Summary block for printing */}
          <div className="grid grid-cols-3 gap-4 border border-slate-400 p-4 rounded-lg text-center font-display">
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase block">Logro Global POA</span>
              <span className="text-2xl font-bold font-mono text-emerald-800">{overallSuccessRate}%</span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase block">Metas Desplegadas</span>
              <span className="text-2xl font-bold font-mono text-slate-800">{poaGoals.length}</span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase block">Cumplidas al 100%</span>
              <span className="text-2xl font-bold font-mono text-emerald-700">{metGoalsCount}</span>
            </div>
          </div>

          {/* Detailed Print Table */}
          <div className="border border-slate-400 rounded-lg overflow-hidden">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-400 font-display text-slate-800">
                  <th className="p-2 border-r border-slate-450 font-bold">Pilar de Ornato / Meta Directa</th>
                  <th className="p-2 border-r border-slate-450 font-bold text-center">Meta Anual</th>
                  <th className="p-2 border-r border-slate-450 font-bold text-center">Cumplido</th>
                  <th className="p-2 border-r border-slate-450 font-bold text-center">Faltante</th>
                  <th className="p-2 border-r border-slate-450 font-bold text-center">Porcentaje %</th>
                  <th className="p-2 font-bold text-center">Estatus POA</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-400">
                {poaGoals.map(goal => {
                  const percent = Math.min(100, Math.round((goal.completedQuantity / goal.targetQuantity) * 100));
                  const missing = Math.max(0, goal.targetQuantity - goal.completedQuantity);
                  return (
                    <tr key={goal.id} className="hover:bg-slate-50 text-slate-800">
                      <td className="p-2 border-r border-slate-350 font-medium">
                        <div className="font-bold text-slate-900">{goal.pillar}</div>
                        <div className="text-[10px] text-slate-500">{goal.description}</div>
                      </td>
                      <td className="p-2 border-r border-slate-350 text-center font-mono font-bold">{goal.targetQuantity} {goal.unit}</td>
                      <td className="p-2 border-r border-slate-350 text-center font-mono text-emerald-800 font-bold">{goal.completedQuantity}</td>
                      <td className="p-2 border-r border-slate-350 text-center font-mono text-red-700 font-semibold">{missing}</td>
                      <td className="p-2 border-r border-slate-350 text-center font-mono font-bold">{percent}%</td>
                      <td className="p-2 text-center text-[10px] font-bold">
                        <span className={percent >= 100 ? 'text-emerald-700' : 'text-amber-800'}>
                          {percent >= 100 ? '✓ Cumplida' : '✎ En Progreso'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="text-[11px] text-slate-500 italic text-center p-3 border border-slate-300 rounded bg-slate-50">
            Firma autorizada del Coordinador de Planificación Técnica y Ornato Municipal para la Alcaldía Juan José Rondón, Estado Guárico, garantizando la consistencia del POA aquí expuesto.
          </div>

          <PrintSignatures />
        </div>
      ) : (
        /* -------------------- NORMAL INTERACTIVE CHARTS & METRICS -------------------- */
        <div className="space-y-6">
          
          {/* Top general statistics box */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Achieved metric */}
            <div className="flex items-center gap-4 border-r border-slate-100 last:border-0 pr-4">
              <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-800 shrink-0">
                <Percent className="w-6 h-6" />
              </div>
              <div className="space-y-1 flex-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase font-display block">Nivel de Logro Global</span>
                <span className="text-2xl font-bold font-mono text-emerald-800 leading-none">{overallSuccessRate}%</span>
                {/* Visual indicator bar */}
                <div className="bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-emerald-600 h-full rounded-full" 
                    style={{ width: `${overallSuccessRate}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Metas Cumplidas vs Faltaron */}
            <div className="flex items-center gap-4 border-r border-slate-100 last:border-0 pr-4">
              <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-800 shrink-0">
                <Calendar className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase font-display block">Sectores del POA</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold font-mono text-slate-800 leading-none">{poaGoals.length}</span>
                  <span className="text-xs text-slate-500">Pilares de Ornato</span>
                </div>
                <div className="flex items-center gap-2 text-[10px] text-slate-500">
                  <span className="font-bold text-emerald-800">{metGoalsCount} Cumplidas</span> • 
                  <span className="font-bold text-amber-700">{pendingGoalsCount} Pendientes</span>
                </div>
              </div>
            </div>

            {/* Focus on Protection detail statement (PROTECCIÓN DE METAS) */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-800 text-white flex items-center justify-center font-display font-medium shrink-0 shadow-sm text-sm">
                POA
              </div>
              <div className="space-y-0.5 leading-snug">
                <span className="font-bold text-slate-900 block font-display">Protección Operativa Activa</span>
                <p className="text-[10px] text-slate-600">
                  Estudio detallado del Plan Operativo Anual (POA). Las metas rezagadas o afectadas por clima se reprograman bajo amortiguamiento para garantizar la inversión municipal.
                </p>
              </div>
            </div>

          </div>

          {/* Interactive list with manual progress update triggers for auditing */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
            <div className="border-b pb-2 flex flex-col sm:flex-row items-center justify-between gap-2">
              <div>
                <h4 className="font-bold text-slate-900 font-display text-base">Desempeño Analítico por Pilares de Gestión</h4>
                <p className="text-xs text-slate-500">Audite el progreso detallado de cada meta del POA para la Alacaldía Juan José Rondón</p>
              </div>
              <div className="text-[11px] font-bold text-slate-500 italic bg-slate-50 px-3 py-1 rounded">
                Lapso Activo: <span className="text-emerald-800 font-bold font-mono">{selectedPeriod}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {poaGoals.map(goal => {
                const percent = Math.min(100, Math.round((goal.completedQuantity / goal.targetQuantity) * 100));
                const missing = Math.max(0, goal.targetQuantity - goal.completedQuantity);
                const isCompleted = percent >= 100;

                return (
                  <div key={goal.id} className="p-4 border border-slate-150 rounded-xl space-y-3 hover:border-slate-300 hover:shadow-sm transition">
                    <div className="flex items-start justify-between gap-2 border-b border-slate-50 pb-2">
                      <div className="space-y-0.5">
                        <span className="text-[9px] font-mono font-bold text-slate-400 uppercase block">{goal.pillar}</span>
                        <h5 className="font-bold text-slate-900 text-xs tracking-tight">{goal.description}</h5>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                        isCompleted ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {isCompleted ? '100% Cumplida' : 'En Ejecución'}
                      </span>
                    </div>

                    {/* Progress details */}
                    <div className="grid grid-cols-3 gap-2 font-mono text-center text-[11px] font-bold bg-slate-50 p-2 rounded">
                      <div className="text-slate-600">
                        <div className="text-[9px] text-slate-400 font-medium font-sans">META</div>
                        <div>{goal.targetQuantity} {goal.unit}</div>
                      </div>
                      <div className="text-emerald-800 border-x border-slate-200">
                        <div className="text-[9px] text-slate-400 font-medium font-sans">LOGRADO</div>
                        <div>{goal.completedQuantity}</div>
                      </div>
                      <div className="text-red-700">
                        <div className="text-[9px] text-slate-400 font-medium font-sans">FALTA</div>
                        <div>{missing}</div>
                      </div>
                    </div>

                    {/* Progress HTML bar */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[10px] font-bold text-slate-500">
                        <span>Grado de Avance:</span>
                        <span>{percent}%</span>
                      </div>
                      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className="bg-emerald-600 h-full rounded-full transition-all duration-300" 
                          style={{ width: `${percent}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Custom inline progress incrementer tool since the user requested direct POA support! */}
                    <div className="pt-2 flex justify-end">
                      {editingGoalId === goal.id ? (
                        <div className="flex items-center gap-1.5 animate-fadeIn">
                          <input
                            type="number"
                            min={1}
                            value={progressAmount}
                            onChange={(e) => setProgressAmount(Number(e.target.value))}
                            className="border w-14 rounded text-center font-bold p-1 bg-white font-mono"
                          />
                          <button
                            onClick={() => handleUpdateProgressSubmit(goal.id)}
                            className="bg-emerald-800 hover:bg-emerald-950 text-white font-extrabold px-3 py-1 rounded"
                          >
                            + Registrar Avance
                          </button>
                          <button
                            onClick={() => setEditingGoalId(null)}
                            className="text-slate-500 hover:text-slate-800 px-1 font-bold"
                          >
                            ×
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => { setEditingGoalId(goal.id); setProgressAmount(1); }}
                          className="text-[10px] text-emerald-800 hover:text-emerald-950 font-extrabold border border-emerald-200 hover:border-emerald-300 px-3 py-1 rounded-lg transition"
                        >
                          + Registrar Avance Realizado (POA)
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
