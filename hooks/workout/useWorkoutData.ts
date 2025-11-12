import { useState, useEffect } from "react";
import { Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams } from "expo-router";
import { SetRecord } from "../../components/Exercise/SetRow"; // Importamos el tipo

// --- TIPOS DE DATOS (Basados en el JSON de la IA) ---
interface EjercicioPrescrito {
  nombre: string;
  series: string;
  repeticiones: string;
  carga_notacion: string;
  nota?: string;
  descanso?: string;
}
interface GrupoMuscular {
  grupo_muscular: string;
  ejercicios: EjercicioPrescrito[];
}
interface DiaEntrenamiento {
  dia_entrenamiento: string;
  grupos: GrupoMuscular[];
}
export interface ExerciseLog {
  id: string;
  ejercicio: EjercicioPrescrito;
  sets: SetRecord[];
  user_notes: string;
  grupo: string;
}
interface RutinaGenerada {
  rutina_periodizada: {
    semana: number;
    fase: string;
    dias: DiaEntrenamiento[];
  }[];
}
// --- FIN DE TIPOS ---

export const useWorkoutData = () => {
  const { day } = useLocalSearchParams<{ day: string }>();
  const [workoutLog, setWorkoutLog] = useState<ExerciseLog[]>([]);
  const [diaActualData, setDiaActualData] = useState<DiaEntrenamiento | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);

  // Inicialización de Sets
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

  // Carga de Datos
  useEffect(() => {
    const loadWorkoutData = async () => {
      if (!day) return;
      setIsLoading(true);
      const jsonString = await AsyncStorage.getItem("@FitAI_UserRoutine");

      try {
        if (jsonString) {
          const rutina: RutinaGenerada = JSON.parse(jsonString);
          let targetDay: DiaEntrenamiento | undefined;

          // Lógica de compatibilidad de estructura
          if (
            rutina.rutina_periodizada &&
            Array.isArray(rutina.rutina_periodizada)
          ) {
            const semana = rutina.rutina_periodizada[0];
            if (semana && semana.dias) {
              targetDay = semana.dias.find(
                (d: any) => d.dia_entrenamiento === day
              );
            }
          }

          if (targetDay && targetDay.grupos) {
            setDiaActualData(targetDay);
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

  // Manejadores de Estado
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
    day,
    isLoading,
    diaActualData,
    workoutLog,
    handleUpdateSet,
    handleUpdateNotes,
  };
};
