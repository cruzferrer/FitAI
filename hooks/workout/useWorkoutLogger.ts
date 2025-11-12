import { useState, useEffect } from "react";
import { Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams } from "expo-router";
import { useAuth } from "../auth/useAuth";
import { supabase } from "../../constants/supabaseClient";

// --- TIPOS DE DATOS ---
// (Estos tipos deben coincidir con tu JSON de la IA y el estado interactivo)

// Lo que la IA prescribe
interface EjercicioPrescrito {
  nombre: string;
  series: string;
  repeticiones: string;
  carga_notacion: string;
  nota?: string;
  descanso?: string;
}

// Lo que el usuario registra
interface SetRecord {
  prescribed_carga: string;
  prescribed_reps: string;
  actual_kg: string; // Input del usuario
  actual_reps: string; // Input del usuario
  completed: boolean; // Estado del checkbox
}

// El estado centralizado de cada ejercicio
interface ExerciseLog {
  id: string; // ID único para el estado de React
  ejercicio: EjercicioPrescrito;
  sets: SetRecord[];
  user_notes: string;
  grupo: string;
}

interface DiaEntrenamiento {
  dia_entrenamiento: string;
  grupos: {
    grupo_muscular: string;
    ejercicios: EjercicioPrescrito[];
  }[];
}

interface RutinaGenerada {
  rutina_periodizada: {
    semana: number;
    fase: string;
    dias: DiaEntrenamiento[];
  }[];
}

// --- EL HOOK ---
export const useWorkoutLogger = () => {
  const { day } = useLocalSearchParams<{ day: string }>();
  const { session } = useAuth();
  const [workoutLog, setWorkoutLog] = useState<ExerciseLog[]>([]);
  const [diaActualData, setDiaActualData] = useState<DiaEntrenamiento | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);

  // Inicialización de Sets para un Ejercicio
  const createInitialSets = (ejercicio: EjercicioPrescrito): SetRecord[] => {
    const numSets = parseInt(ejercicio.series, 10) || 0;
    return Array.from({ length: numSets }).map(() => ({
      prescribed_carga: ejercicio.carga_notacion,
      prescribed_reps: ejercicio.repeticiones,
      actual_kg: "",
      actual_reps: "",
      completed: false,
    }));
  };

  // Carga de Datos (del 'Mega index' original)
  useEffect(() => {
    const loadWorkoutData = async () => {
      if (!day) {
        // Si no hay parámetro 'day', no hacer nada
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      const jsonString = await AsyncStorage.getItem("@FitAI_UserRoutine");

      try {
        if (jsonString) {
          const rutina: RutinaGenerada = JSON.parse(jsonString);

          let targetDay: DiaEntrenamiento | undefined;

          if (
            rutina.rutina_periodizada &&
            Array.isArray(rutina.rutina_periodizada)
          ) {
            const semana = rutina.rutina_periodizada[0]; // Asumimos Semana 1
            if (semana && semana.dias) {
              targetDay = semana.dias.find(
                (d: any) => d.dia_entrenamiento === day
              );
            }
          }

          if (targetDay && targetDay.grupos) {
            setDiaActualData(targetDay);

            // Aplanamos la estructura para el estado interactivo
            const initialLog: ExerciseLog[] = targetDay.grupos.flatMap(
              (grupo) =>
                grupo.ejercicios.map((ej) => ({
                  id: `${ej.nombre}-${grupo.grupo_muscular}`,
                  ejercicio: ej,
                  sets: createInitialSets(ej),
                  user_notes: ej.nota || "",
                  grupo: grupo.grupo_muscular,
                }))
            );
            setWorkoutLog(initialLog);
          } else {
            Alert.alert(
              "Error",
              `No se encontró el día '${day}' o está vacío.`
            );
          }
        }
      } catch (e) {
        console.error("Error al parsear la rutina en WorkoutLog:", e);
        Alert.alert("Error Crítico", "La rutina guardada está corrupta.");
      }

      setIsLoading(false);
    };

    loadWorkoutData();
  }, [day]);
  const saveWorkoutLog = async (durationMinutes: number) => {
    const userId = session?.user?.id;
    if (!userId) {
      Alert.alert(
        "Error",
        "Debes iniciar sesión para guardar tu entrenamiento."
      );
      return;
    }

    // Simulación: Cálculo de Fatiga Muscular (para la tabla historial_sesiones)
    // La IA avanzada lo haría por ti, aquí usamos una simulación
    const musculosFatigaMock = {
      Pecho: Math.floor(Math.random() * 50) + 50, // 50-100
      Espalda: Math.floor(Math.random() * 50) + 50,
      Piernas: Math.floor(Math.random() * 50) + 50,
    };

    const { error } = await supabase.from("historial_sesiones").insert({
      user_id: userId,
      duracion_minutos: durationMinutes,
      nombre_dia: day!,
      musculos_fatiga: musculosFatigaMock,
      log_series: workoutLog, // Guardamos el estado completo de las series
    });

    if (error) {
      Alert.alert(
        "Error de DB",
        "No se pudo guardar el historial: " + error.message
      );
      console.error(error);
      return false;
    }
    return true;
  };

  // --- Manejadores de Estado ---

  const handleUpdateSet = (
    exerciseId: string,
    setIndex: number,
    updatedSet: SetRecord
  ) => {
    setWorkoutLog((prevLog) =>
      prevLog.map((exLog) => {
        if (exLog.id === exerciseId) {
          const newSets = [...exLog.sets];
          newSets[setIndex] = updatedSet;
          return { ...exLog, sets: newSets };
        }
        return exLog;
      })
    );
  };

  const handleUpdateNotes = (exerciseId: string, notes: string) => {
    setWorkoutLog((prevLog) =>
      prevLog.map((exLog) => {
        if (exLog.id === exerciseId) {
          return { ...exLog, user_notes: notes };
        }
        return exLog;
      })
    );
  };

  return {
    saveWorkoutLog,
    day,
    isLoading,
    diaActualData, // Datos originales (para el nombre, etc.)
    workoutLog, // Estado interactivo
    handleUpdateSet,
    handleUpdateNotes,
  };
};
