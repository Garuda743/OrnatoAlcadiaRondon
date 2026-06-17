/**
 * types.ts
 * Definición de tipos de datos para la aplicación de la Coordinación de Ornato.
 */

export interface Worker {
  id: string; // Identificador único (interno)
  cedula: string; // Cédula de Identidad (e.g., V14056328)
  name: string; // Nombre completo
  status: 'Activo' | 'Reposo' | 'Vacaciones' | 'Movido' | 'Permiso';
  brigade: 'Poda y Tala' | 'Jardinería' | 'Pintura y Herrería' | 'Vivero y Producción' | 'Barrido y Limpieza';
  notes?: string;
}

export type TaskCategory =
  | 'Mantenimiento de Áreas Verdes'
  | 'Gestión de Viveros Municipales'
  | 'Mantenimiento del Mobiliario Urbano'
  | 'Control Fitosanitario'
  | 'Limpieza Especializada'
  | 'Decoración de Eventos Públicos';

export interface Task {
  id: string;
  description: string; // e.g., "Desmalezamiento quincenal de los brocales"
  location: string; // e.g., "Avenida Bolívar"
  category: TaskCategory;
  startDate: string; // YYYY-MM-DD
  endDate: string | null; // YYYY-MM-DD
  status: 'Programada' | 'En Progreso' | 'Completada' | 'Pendiente (Lluvia)' | 'Pendiente (Hecho Fortuito)';
  assignedWorkerIds: string[];
  materialsUsed: string[]; // e.g., ["Machete", "Desmalezadora", "Bolsas para desechos"]
  numWorkersNeeded: number;
  isRecurring: boolean; // Indica si se repite periódicamente
  recurringIntervalDays: number; // Intervalo en días (e.g., 15 días, 20 días)
  nextScheduledDate: string | null; // Siguiente fecha en base a la repetición
  images: {
    antes?: string; // Base64 data URL
    durante?: string; // Base64 data URL
    despues?: string; // Base64 data URL
  };
  notes?: string;
}

export type AttendanceStatus = 'A' | 'I' | 'R' | 'P' | 'V'; 
// A: Asistencia, I: Inasistencia, R: Reposo, P: Permiso, V: Vacaciones

export interface AttendanceRecord {
  entryTime: string; // e.g., "06:30"
  entryConfirmed: boolean;
  exitTime: string; // e.g., "12:00" o "17:00"
  exitConfirmed: boolean;
  status: AttendanceStatus;
  details?: string; // Razones de inasistencia, accidente laboral, retiro anticipado, etc.
}

export interface DayAttendance {
  date: string; // YYYY-MM-DD
  records: Record<string, AttendanceRecord>; // Mapea workerId -> registro de asistencia
}

export interface VacationPeriod {
  id: string;
  workerId: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  incorporationDate: string; // YYYY-MM-DD
  status: 'Planificada' | 'Activa' | 'Incorporado';
  notes?: string;
}

export interface POAGoal {
  id: string;
  pillar: TaskCategory;
  description: string; // Meta específica del POA
  targetQuantity: number; // Meta anual / planificada
  completedQuantity: number; // Metas logradas
  unit: string; // e.g., "Plazas", "Kilómetros", "Árboles", "Jornadas"
}
