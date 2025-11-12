import { useState, useCallback } from "react";
import { useFocusEffect } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { supabase } from "../../constants/supabaseClient"; // Asegúrate que la ruta sea correcta
import { useAuth } from "../auth/useAuth";

// Tipos de datos que el hook devolverá
interface WorkoutProgress {
  weekIndex: number;
  dayIndex: number;
  lastCompleted: string | null;
}
interface Parametros {
  kcal_mantenimiento: number;
  objetivo_calorico: string;
}
interface Registro {
  kcal_consumidas: number;
}
interface DashboardData {
  rutina: any | null;
  progress: WorkoutProgress | null;
  parametros: Parametros | null;
  registroHoy: Registro | null;
  isLoading: boolean;
  error: Error | null;
}

export const useDashboardData = (): DashboardData => {
  const { session } = useAuth();
  const [rutina, setRutina] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState<WorkoutProgress | null>(null);
  const [parametros, setParametros] = useState<Parametros | null>(null);
  const [registroHoy, setRegistroHoy] = useState<Registro | null>(null);
  const [error, setError] = useState<Error | null>(null);

  useFocusEffect(
    useCallback(() => {
      const loadData = async () => {
        setIsLoading(true);
        setError(null);
        const userId = session?.user?.id;

        try {
          // Cargar datos en paralelo
          const [routineString, progressString] = await Promise.all([
            AsyncStorage.getItem("@FitAI_UserRoutine"),
            AsyncStorage.getItem("@FitAI_WorkoutProgress"),
          ]);

          if (routineString) setRutina(JSON.parse(routineString));

          if (progressString) {
            setProgress(JSON.parse(progressString));
          } else {
            setProgress({ weekIndex: 0, dayIndex: 0, lastCompleted: null });
          }

          if (userId) {
            const today = new Date().toISOString().split("T")[0];

            // Cargar datos de nutrición en paralelo
            const [paramRes, regRes] = await Promise.all([
              supabase
                .from("parametros_usuario")
                .select("kcal_mantenimiento, objetivo_calorico")
                .eq("user_id", userId)
                .maybeSingle(),
              supabase
                .from("registro_calorias")
                .select("kcal_consumidas")
                .eq("user_id", userId)
                .eq("fecha", today)
                .maybeSingle(),
            ]);

            if (paramRes.data) setParametros(paramRes.data as Parametros);
            if (regRes.data) setRegistroHoy(regRes.data as Registro);

            if (paramRes.error) throw paramRes.error;
            if (regRes.error) throw regRes.error;
          }
        } catch (e: any) {
          console.error("Error cargando datos del dashboard:", e);
          setError(e);
        } finally {
          setIsLoading(false);
        }
      };

      loadData();
    }, [session]) // Volver a cargar si la sesión cambia
  );

  return { rutina, progress, parametros, registroHoy, isLoading, error };
};
