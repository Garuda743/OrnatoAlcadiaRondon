import { Worker, Task, POAGoal, DayAttendance, VacationPeriod } from './types';

export const INITIAL_WORKERS: Worker[] = [
  { id: 'w1', cedula: 'V14056328', name: 'SISO JHOAN', status: 'Activo', brigade: 'Barrido y Limpieza' },
  { id: 'w2', cedula: 'V14056328', name: 'SISO CARRILLO JOAN MANUEL', status: 'Activo', brigade: 'Barrido y Limpieza' },
  { id: 'w3', cedula: 'V08574720', name: 'DOMINGUEZ DÍAZ JESÚS ALFREDO', status: 'Activo', brigade: 'Poda y Tala' },
  { id: 'w4', cedula: 'V06150466', name: 'AGUILERA MARQUEZ ZAIDA JOSEFINA', status: 'Reposo', brigade: 'Barrido y Limpieza', notes: 'Reposo médico por 15 días' },
  { id: 'w5', cedula: 'V08570364', name: 'SANCHEZ PEDRIQUE JOSE AUDIENI', status: 'Activo', brigade: 'Jardinería' },
  { id: 'w6', cedula: 'V08805955', name: 'OJEDA DE HERRERA CARIDAD DE JESUS', status: 'Activo', brigade: 'Barrido y Limpieza' },
  { id: 'w7', cedula: 'V10983346', name: 'RODRIGUEZ RAFAEL HUMBERTO', status: 'Activo', brigade: 'Poda y Tala' },
  { id: 'w8', cedula: 'V11842066', name: 'RIOS RICHAR RAFAEL', status: 'Activo', brigade: 'Pintura y Herrería' },
  { id: 'w9', cedula: 'V12595320', name: 'BLONDER SALMERON JULIO RAMON', status: 'Vacaciones', brigade: 'Vivero y Producción' },
  { id: 'w10', cedula: 'V14029878', name: 'BERMUDEZ MOIRA MATILDE', status: 'Activo', brigade: 'Barrido y Limpieza' },
  { id: 'w11', cedula: 'V19701916', name: 'HERRERA JUANA SORELIS', status: 'Activo', brigade: 'Barrido y Limpieza' },
  { id: 'w12', cedula: 'V14344226', name: 'MARTINEZ SORYS YNOLUZ', status: 'Movido', brigade: 'Barrido y Limpieza', notes: 'Movido temporalmente a Dirección de Rentas' },
  { id: 'w13', cedula: 'V12118266', name: 'ARIAS NELLYVY KATIUSKA', status: 'Activo', brigade: 'Jardinería' },
  { id: 'w14', cedula: 'V19161702', name: 'MARTINEZ JORGE', status: 'Activo', brigade: 'Poda y Tala' }
];

export const INITIAL_TASKS: Task[] = [
  {
    id: 't1',
    description: 'Barrido diario y limpieza general de la Plaza Bolívar',
    location: 'Plaza Bolívar, Casco Central',
    category: 'Limpieza Especializada',
    startDate: '2026-06-15',
    endDate: '2026-06-15',
    status: 'Completada',
    assignedWorkerIds: ['w1', 'w2', 'w6'],
    materialsUsed: ['Escobas', 'Palas', 'Bolsas para desechos'],
    numWorkersNeeded: 3,
    isRecurring: true,
    recurringIntervalDays: 1,
    nextScheduledDate: '2026-06-16',
    images: {
      antes: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?q=80&w=300&auto=format&fit=crop',
      durante: 'https://images.unsplash.com/photo-1574092415174-8848d6174a7f?q=80&w=300&auto=format&fit=crop',
      despues: 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?q=80&w=300&auto=format&fit=crop'
    },
    notes: 'Actividad ejecutada en el horario de la mañana sin contratiempos.'
  },
  {
    id: 't2',
    description: 'Desmalezamiento quincenal de los brocales y aceras',
    location: 'Avenida Bolívar (Desde Redoma hasta Entrada El Pueblo)',
    category: 'Mantenimiento de Áreas Verdes',
    startDate: '2026-06-16',
    endDate: null,
    status: 'En Progreso',
    assignedWorkerIds: ['w3', 'w7', 'w14'],
    materialsUsed: ['Machetes', 'Desmalezadoras', 'Rastrillos', 'Bolsas para desechos'],
    numWorkersNeeded: 3,
    isRecurring: true,
    recurringIntervalDays: 15,
    nextScheduledDate: '2026-07-01',
    images: {},
    notes: 'Se inició el desmalezamiento en el tramo norte.'
  },
  {
    id: 't3',
    description: 'Mantenimiento y limpieza profunda de la biblioteca pública',
    location: 'Biblioteca Pública, Calle Doña María',
    category: 'Limpieza Especializada',
    startDate: '2026-06-17',
    endDate: '2026-06-17',
    status: 'Completada',
    assignedWorkerIds: ['w10', 'w11'],
    materialsUsed: ['Escobas', 'Coleto', 'Desinfectante', 'Trapos de limpieza'],
    numWorkersNeeded: 2,
    isRecurring: true,
    recurringIntervalDays: 20,
    nextScheduledDate: '2026-07-07',
    images: {
      antes: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?q=80&w=300&auto=format&fit=crop',
      despues: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?q=80&w=300&auto=format&fit=crop'
    },
    notes: 'Se requiere retoque cada 20 días reglamentarios.'
  },
  {
    id: 't4',
    description: 'Pintura y restauración de bancos y luminarias ornamentales',
    location: 'Plaza Doña Bárbara',
    category: 'Mantenimiento del Mobiliario Urbano',
    startDate: '2026-06-14',
    endDate: null,
    status: 'Pendiente (Lluvia)',
    assignedWorkerIds: ['w8'],
    materialsUsed: ['Pintura en aceite verde bosque', 'Brochas', 'Disolvente', 'Lijas'],
    numWorkersNeeded: 1,
    isRecurring: false,
    recurringIntervalDays: 0,
    nextScheduledDate: null,
    images: {},
    notes: 'Suspendida por fuerte lluvia de la tarde. Se reprograma para la presente semana.'
  },
  {
    id: 't5',
    description: 'Control Fitosanitario contra plagas en árboles ornamentales',
    location: 'Islas centrales de la Avenida Principal',
    category: 'Control Fitosanitario',
    startDate: '2026-06-18',
    status: 'Programada',
    endDate: null,
    assignedWorkerIds: ['w5', 'w13'],
    materialsUsed: ['Atomizadores', 'Insecticida orgánico', 'Equipos de seguridad respiratoria'],
    numWorkersNeeded: 2,
    isRecurring: true,
    recurringIntervalDays: 30,
    nextScheduledDate: '2026-07-18',
    images: {}
  }
];

export const INITIAL_VACATIONS: VacationPeriod[] = [
  {
    id: 'v1',
    workerId: 'w9',
    startDate: '2026-06-01',
    endDate: '2026-06-21',
    incorporationDate: '2026-06-22',
    status: 'Activa',
    notes: 'Periodo reglamentario correspondiente al año 2025.'
  },
  {
    id: 'v2',
    workerId: 'w5',
    startDate: '2026-07-15',
    endDate: '2026-08-04',
    incorporationDate: '2026-08-05',
    status: 'Planificada',
    notes: 'Vacaciones planificadas y aprobadas.'
  }
];

export const INITIAL_POA_METAS: POAGoal[] = [
  {
    id: 'poa1',
    pillar: 'Mantenimiento de Áreas Verdes',
    description: 'Desmalezamiento y mantenimiento de plazas, avenidas urbanas e islas centrales del Municipio',
    targetQuantity: 72, // 72 desmalezamientos al año
    completedQuantity: 34,
    unit: 'Jornadas'
  },
  {
    id: 'poa2',
    pillar: 'Limpieza Especializada',
    description: 'Lavado a presión de monumentos históricos mundiales, plazas principales y barrido de alto tránsito',
    targetQuantity: 300,
    completedQuantity: 145,
    unit: 'Jornadas'
  },
  {
    id: 'poa3',
    pillar: 'Mantenimiento del Mobiliario Urbano',
    description: 'Restauración completa, pintura de bancos, refacción de barandas y señalización informativa municipal',
    targetQuantity: 50,
    completedQuantity: 22,
    unit: 'Bancos / Monumentos'
  },
  {
    id: 'poa4',
    pillar: 'Gestión de Viveros Municipales',
    description: 'Reproducción, siembra de plantas ornamentales y producción de árboles endémicos para reforestación',
    targetQuantity: 1200,
    completedQuantity: 580,
    unit: 'Plantas sembradas'
  },
  {
    id: 'poa5',
    pillar: 'Control Fitosanitario',
    description: 'Fumigación y control preventivo de plagas, poda correctiva de ramas peligrosas',
    targetQuantity: 40,
    completedQuantity: 18,
    unit: 'Árboles tratados'
  },
  {
    id: 'poa6',
    pillar: 'Decoración de Eventos Públicos',
    description: 'Decoración y embellecimiento ornamental en efemérides patrias, festividades religiosas y Navidad',
    targetQuantity: 12,
    completedQuantity: 4,
    unit: 'Eventos'
  }
];

export const INITIAL_ATTENDANCE: DayAttendance[] = [
  {
    date: '2026-06-15',
    records: {
      'w1': { entryTime: '06:30', entryConfirmed: true, exitTime: '12:00', exitConfirmed: true, status: 'A' },
      'w2': { entryTime: '06:30', entryConfirmed: true, exitTime: '12:00', exitConfirmed: true, status: 'A' },
      'w3': { entryTime: '06:30', entryConfirmed: true, exitTime: '12:00', exitConfirmed: true, status: 'A' },
      'w4': { entryTime: '--:--', entryConfirmed: false, exitTime: '--:--', exitConfirmed: false, status: 'R', details: 'Fiebre persistente, reposo validado por Seguro Social' },
      'w5': { entryTime: '07:00', entryConfirmed: true, exitTime: '12:00', exitConfirmed: true, status: 'A' },
      'w6': { entryTime: '06:30', entryConfirmed: true, exitTime: '12:00', exitConfirmed: true, status: 'A' },
      'w7': { entryTime: '06:30', entryConfirmed: true, exitTime: '12:00', exitConfirmed: true, status: 'A' },
      'w8': { entryTime: '06:30', entryConfirmed: true, exitTime: '12:00', exitConfirmed: true, status: 'A' },
      'w9': { entryTime: '--:--', entryConfirmed: false, exitTime: '--:--', exitConfirmed: false, status: 'V', details: 'Vacaciones anuales reglamentarias' },
      'w10': { entryTime: '06:30', entryConfirmed: true, exitTime: '12:00', exitConfirmed: true, status: 'A' },
      'w11': { entryTime: '06:30', entryConfirmed: true, exitTime: '12:00', exitConfirmed: true, status: 'A' },
      'w13': { entryTime: '07:00', entryConfirmed: true, exitTime: '12:00', exitConfirmed: true, status: 'A' },
      'w14': { entryTime: '06:30', entryConfirmed: true, exitTime: '12:00', exitConfirmed: true, status: 'A' }
    }
  },
  {
    date: '2026-06-16',
    records: {
      'w1': { entryTime: '06:30', entryConfirmed: true, exitTime: '12:00', exitConfirmed: true, status: 'A' },
      'w2': { entryTime: '06:30', entryConfirmed: true, exitTime: '12:00', exitConfirmed: true, status: 'A' },
      'w3': { entryTime: '06:30', entryConfirmed: true, exitTime: '12:00', exitConfirmed: true, status: 'A' },
      'w4': { entryTime: '--:--', entryConfirmed: false, exitTime: '--:--', exitConfirmed: false, status: 'R', details: 'Reposo' },
      'w5': { entryTime: '07:00', entryConfirmed: true, exitTime: '12:00', exitConfirmed: true, status: 'A' },
      'w6': { entryTime: '--:--', entryConfirmed: false, exitTime: '--:--', exitConfirmed: false, status: 'I', details: 'Falta injustificada' },
      'w7': { entryTime: '06:30', entryConfirmed: true, exitTime: '12:00', exitConfirmed: true, status: 'A' },
      'w8': { entryTime: '06:30', entryConfirmed: true, exitTime: '10:15', exitConfirmed: true, status: 'P', details: 'Permiso aprobado para cita médica ISSS' },
      'w9': { entryTime: '--:--', entryConfirmed: false, exitTime: '--:--', exitConfirmed: false, status: 'V' },
      'w10': { entryTime: '06:30', entryConfirmed: true, exitTime: '12:00', exitConfirmed: true, status: 'A' },
      'w11': { entryTime: '06:30', entryConfirmed: true, exitTime: '12:00', exitConfirmed: true, status: 'A' },
      'w13': { entryTime: '07:00', entryConfirmed: true, exitTime: '12:00', exitConfirmed: true, status: 'A' },
      'w14': { entryTime: '06:30', entryConfirmed: true, exitTime: '12:00', exitConfirmed: true, status: 'A' }
    }
  }
];
