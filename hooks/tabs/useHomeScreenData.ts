import { useState, useCallback } from "react";
import { Alert } from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "../auth/useAuth"; // Ajusta la ruta si es necesario
import { normalizeAndExpandRutina } from "../../app/utils/expandRoutine";

// (Puedes mover estas interfaces a un archivo 'types/routine.ts' global)
interface DiaEntrenamiento {
  dia_entrenamiento: string;
  // ... (otros campos si los necesitas)
}
interface Semana {
  semana: number;
  fase: string;
  dias: DiaEntrenamiento[];
}
interface RutinaGenerada {
  rutina_periodizada: Semana[];
}
// ---

export const useHomeScreenData = () => {
  const router = useRouter();
  const { signOut } = useAuth();

  const [isLoading, setIsLoading] = useState(true);
  const [rutina, setRutina] = useState<RutinaGenerada | null>(null);
  const [progress, setProgress] = useState<{
    weekIndex: number;
    dayIndex: number;
    lastCompleted: string | null;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Carga la rutina desde AsyncStorage cada vez que la pantalla entra en foco
  useFocusEffect(
    useCallback(() => {
      const loadRoutine = async () => {
        setIsLoading(true);
        setError(null);
        try {
          const jsonString = await AsyncStorage.getItem("@FitAI_UserRoutine");
          const progString = await AsyncStorage.getItem(
            "@FitAI_WorkoutProgress"
          );

          if (progString) {
            try {
              setProgress(JSON.parse(progString));
            } catch (e) {
              console.warn("Progreso corrupto en AsyncStorage:", e);
              setProgress(null);
            }
          } else {
            setProgress({ weekIndex: 0, dayIndex: 0, lastCompleted: null });
          }

          if (jsonString) {
            const parsed = JSON.parse(jsonString);
            // Validación simple de la estructura que esperamos
            if (parsed && Array.isArray(parsed.rutina_periodizada)) {
              // Defensive normalization + expansion for human-readable week descriptions.
              // Some server responses include `dias` as a descriptive string like
              // "Replicar estructura de ejercicios de Semana 1 con ajuste a RPE 8..."
              // In that case we clone semana 1's structure and apply heuristics
              // so the frontend can render concrete days.
              try {
                const repaired = normalizeAndExpandRutina(parsed);
                parsed.rutina_periodizada = repaired.rutina_periodizada;
              } catch (e) {
                console.warn("Error usando normalizeAndExpandRutina:", e);
              }

              setRutina(parsed as RutinaGenerada);
            } else {
              throw new Error("Formato de rutina corrupto o inesperado.");
            }
          } else {
            setRutina(null); // No hay rutina guardada
          }
        } catch (e: any) {
          console.error("Error cargando o parseando la rutina:", e);
          setError("Error al cargar la rutina. Intenta generar una nueva.");
          setRutina(null);
        }
        setIsLoading(false);
      };

      loadRoutine();
      return () => {}; // Función de limpieza
    }, [])
  );

  // --- Handlers ---
  const handleSearch = () => Alert.alert("Búsqueda", "Pendiente.");
  const handleNotifications = () => Alert.alert("Notificaciones", "Pendiente.");

  const handleLogout = async () => {
    Alert.alert("Cerrar Sesión", "¿Estás seguro de que quieres salir?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Sí, Cerrar Sesión",
        onPress: async () => {
          await signOut();
          router.replace("/(auth)");
        },
      },
    ]);
  };

  const handleStartWorkout = (dia_entrenamiento: string) => {
    router.push(`/workout?day=${encodeURIComponent(dia_entrenamiento)}` as any);
  };

  return {
    isLoading,
    rutina,
    progress,
    error,
    handlers: {
      handleSearch,
      handleNotifications,
      handleLogout,
      handleStartWorkout,
    },
    router, // Exponemos el router por si la UI lo necesita para otra cosa
  };
};
