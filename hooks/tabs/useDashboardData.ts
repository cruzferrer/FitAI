import { useState, useCallback } from "react";
import { useFocusEffect } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { supabase } from "../../constants/supabaseClient"; // Asegúrate que la ruta sea correcta
import { useAuth } from "../auth/useAuth";
import { normalizeAndExpandRutina } from "../../app/utils/expandRoutine";

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

          if (routineString) {
            const parsed = JSON.parse(routineString);
            const normalized = normalizeAndExpandRutina(parsed);
            setRutina(normalized);
          }

          const localProg = progressString
            ? JSON.parse(progressString)
            : { weekIndex: 0, dayIndex: 0, lastCompleted: null };

          // Si hay sesión en Supabase, obtén progreso central y luego haremos merge
          let remoteProg: any = null;
          if (userId) {
            const { data: upData, error: upErr } = await supabase
              .from("user_progress")
              .select("week_index, day_index, last_completed")
              .eq("user_id", userId)
              .maybeSingle();

            if (upErr) throw upErr;
            if (upData) {
              remoteProg = {
                weekIndex: Number(upData.week_index) || 0,
                dayIndex: Number(upData.day_index) || 0,
                lastCompleted: upData.last_completed || null,
              };
            }
          }

          // Merge logic: prefer the most reciente por lastCompleted si existe,
          // si ambos null, preferir el que tenga mayor week/day. Finalmente,
          // si son iguales preferir remoteProg.
          const chooseProgress = (localP: any, remoteP: any) => {
            if (!remoteP) return localP;
            if (!localP) return remoteP;
            const localDate = localP.lastCompleted
              ? new Date(localP.lastCompleted)
              : null;
            const remoteDate = remoteP.lastCompleted
              ? new Date(remoteP.lastCompleted)
              : null;
            if (localDate && remoteDate) {
              if (remoteDate > localDate) return remoteP;
              if (localDate > remoteDate) return localP;
            }
            if (remoteP.weekIndex > localP.weekIndex) return remoteP;
            if (localP.weekIndex > remoteP.weekIndex) return localP;
            if (remoteP.dayIndex > localP.dayIndex) return remoteP;
            if (localP.dayIndex > remoteP.dayIndex) return localP;
            return remoteP;
          };

          const merged = chooseProgress(localProg, remoteProg);
          setProgress(merged);

          // Sincronizar en ambos sentidos según corresponda
          try {
            if (userId) {
              // Si elegimos local y hay remote distinto, subimos local a supabase
              const localEqualsRemote =
                JSON.stringify(localProg) === JSON.stringify(remoteProg);
              if (
                !localEqualsRemote &&
                JSON.stringify(merged) === JSON.stringify(localProg)
              ) {
                await supabase.from("user_progress").upsert(
                  {
                    user_id: userId,
                    week_index: merged.weekIndex,
                    day_index: merged.dayIndex,
                    last_completed: merged.lastCompleted,
                  },
                  { onConflict: "user_id" }
                );
              }

              // Si elegimos remote y local distinto, escribir en AsyncStorage
              if (
                !localEqualsRemote &&
                JSON.stringify(merged) === JSON.stringify(remoteProg)
              ) {
                await AsyncStorage.setItem(
                  "@FitAI_WorkoutProgress",
                  JSON.stringify(merged)
                );
              }
            }
          } catch (syncErr) {
            // No fatal: loggear pero continuar
            console.warn("Error sincronizando progreso:", syncErr);
          }

          if (userId) {
            // Use local date (YYYY-MM-DD) to match user local day instead of UTC
            const formatLocalDate = (d = new Date()) => {
              const y = d.getFullYear();
              const m = String(d.getMonth() + 1).padStart(2, "0");
              const day = String(d.getDate()).padStart(2, "0");
              return `${y}-${m}-${day}`;
            };
            const today = formatLocalDate();

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
