
import RutinaJSON from './Rutina_TEST_fuerza_hipertrofia_ul_periodizado.json';

interface Ejercicio {
  nombre: string;
  series: string;
  repeticiones: string;
  carga_notacion: string;
  nota: string;
}

interface GrupoMuscular {
  grupo_muscular: string;
  ejercicios: Ejercicio[];
}

interface DiaEntrenamiento {
  dia_entrenamiento: string;
  grupos: GrupoMuscular[];
}

interface Semana {
  semana: number;
  fase: string;
  dias: DiaEntrenamiento[];
}


export const RUTINA_PERIODIZADA: Semana[] = RutinaJSON.rutina_periodizada as Semana[];

// Ejemplo de acceso al día de hoy:
export const DIA_ACTUAL = RUTINA_PERIODIZADA[0].dias[0]; // Semana 1, Día 1