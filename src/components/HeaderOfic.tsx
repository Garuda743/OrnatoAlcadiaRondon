import React from 'react';

interface HeaderOficProps {
  title?: string;
  subtitle?: string;
}

export default function HeaderOfic({ title = "PLANIFICACIÓN OPERATIVA SEMANAL", subtitle }: HeaderOficProps) {
  const currentDate = new Date().toLocaleDateString('es-VE', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="border-b-2 border-slate-800 pb-4 mb-6">
      {/* Top Header - National & Local Symbols */}
      <div className="flex flex-col md:flex-row items-center justify-between text-center md:text-left gap-4">
        {/* Coat of Arms Representation */}
        <div className="flex items-center gap-3">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex flex-col items-center justify-center border-2 border-amber-500 relative overflow-hidden shadow-sm">
            {/* Tricolor Ribbon on top */}
            <div className="absolute top-0 left-0 right-0 h-1.5 flex">
              <div className="w-1/3 bg-yellow-400 h-full"></div>
              <div className="w-1/3 bg-blue-600 h-full"></div>
              <div className="w-1/3 bg-red-600 h-full"></div>
            </div>
            <div className="text-[9px] font-bold text-slate-800 leading-none mt-1 text-center font-display">
              ALCALDÍA
            </div>
            <div className="text-[8px] text-emerald-700 font-extrabold leading-none text-center">
              ORNATO
            </div>
            {/* Stars */}
            <div className="flex gap-0.5 text-[6px] text-amber-500 mt-1">
              <span>★</span><span>★</span><span>★</span><span>★</span><span>★</span>
            </div>
            <div className="text-[7px] text-slate-500 mt-0.5 italic text-center">
              J.J. Rondón
            </div>
          </div>
          <div>
            <h1 className="text-xs font-semibold tracking-wider text-slate-750 font-display leading-tight">
              REPÚBLICA BOLIVARIANA DE VENEZUELA
            </h1>
            <h2 className="text-[11px] font-bold text-slate-700 leading-tight">
              ESTADO BOLIVARIANO DE GUÁRICO
            </h2>
            <h3 className="text-sm font-bold text-slate-900 leading-tight">
              ALCALDÍA DEL MUNICIPIO JUAN JOSÉ RONDÓN
            </h3>
            <p className="text-[11px] text-slate-600 italic">
              "Las Mercedes del Llano - Cuna de Progreso y Tradición"
            </p>
          </div>
        </div>

        {/* Directorate Meta */}
        <div className="text-center md:text-right font-display">
          <div className="text-[11px] font-semibold text-slate-700 uppercase">
            Dirección de Servicios Públicos
          </div>
          <div className="text-xs font-bold text-emerald-800 uppercase tracking-wide">
            Coordinación de Planificación y Ornato
          </div>
          <div className="text-[10px] text-slate-500 font-mono mt-1">
            Emitido: {currentDate}
          </div>
          <div className="inline-block mt-1 bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded border border-emerald-300">
            CÓDIGO: AMJJR-DSP-CO-2026
          </div>
        </div>
      </div>

      {/* Decorative Tricolor Bar */}
      <div className="h-[3px] flex mt-4 rounded-full overflow-hidden">
        <div className="w-1/3 bg-yellow-400 h-full"></div>
        <div className="w-1/3 bg-blue-600 h-full"></div>
        <div className="w-1/3 bg-red-600 h-full"></div>
      </div>

      {/* Report Title */}
      <div className="mt-4 text-center">
        <h2 className="text-lg font-bold text-slate-900 font-display uppercase tracking-wide">
          {title}
        </h2>
        {subtitle && (
          <p className="text-xs text-slate-600 font-medium italic mt-1">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}

// Separate print signatures helper
export function PrintSignatures() {
  return (
    <div className="mt-12 pt-6 border-t border-slate-200 grid grid-cols-1 md:grid-cols-3 gap-6 text-center text-xs font-semibold print-card p-4 rounded-lg bg-slate-50">
      <div>
        <div className="h-16 flex items-end justify-center">
          <div className="w-40 border-b border-dashed border-slate-400"></div>
        </div>
        <p className="mt-2 text-slate-800 uppercase font-bold text-[10px]">Elaborado por:</p>
        <p className="text-slate-600 font-medium">Joan Siso</p>
        <p className="text-[9px] text-slate-500 italic">Coordinador de Ornato Municipal</p>
      </div>

      <div>
        <div className="h-16 flex items-end justify-center">
          <div className="w-40 border-b border-dashed border-slate-400"></div>
        </div>
        <p className="mt-2 text-slate-800 uppercase font-bold text-[10px]">Revisado por:</p>
        <p className="text-slate-600 font-medium">Dirección de Servicios Públicos</p>
        <p className="text-[9px] text-slate-500 italic">Alcaldía de Juan José Rondón</p>
      </div>

      <div>
        <div className="h-16 flex items-end justify-center">
          <div className="w-36 h-12 border-2 border-slate-300 rounded flex items-center justify-center text-slate-400 text-[10px] italic">
            Sello Oficina
          </div>
        </div>
        <p className="mt-2 text-slate-800 uppercase font-bold text-[10px]">Aprobado por:</p>
        <p className="text-slate-600 font-medium">Alcalde / Despacho Municipal</p>
        <p className="text-[9px] text-slate-500 italic">Municipio Juan José Rondón</p>
      </div>
    </div>
  );
}
