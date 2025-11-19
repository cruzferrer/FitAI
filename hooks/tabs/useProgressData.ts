import { useState, useCallback } from "react";
import { useFocusEffect } from "expo-router";
import { supabase } from "../../constants/supabaseClient";
import { useAuth } from "../auth/useAuth";

interface SessionRecord {
  id?: number | string;
  fecha_sesion?: string;
  duracion_minutos?: number;
  nombre_dia?: string;
  musculos_fatiga?: Record<string, number> | any;
}

export const useProgressData = (limit = 20) => {
  const { session } = useAuth();
  const [sessions, setSessions] = useState<SessionRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      const load = async () => {
        setIsLoading(true);
        setError(null);
        try {
          const userId = session?.user?.id;
          if (!userId) {
            setSessions([]);
            return;
          }

          const res = await supabase
            .from("historial_sesiones")
            .select(
              "id, fecha_sesion, duracion_minutos, nombre_dia, musculos_fatiga"
            )
            .eq("user_id", userId)
            .order("fecha_sesion", { ascending: false })
            .limit(limit);

          if (res.error) throw res.error;

          const rows = (res.data || []) as SessionRecord[];

          if (!cancelled) setSessions(rows);
        } catch (e: any) {
          setError(e);
        } finally {
          if (!cancelled) setIsLoading(false);
        }
      };

      load();

      return () => {
        cancelled = true;
      };
    }, [session, limit])
  );

  // Derivar un array de valores promedio de fatiga por sesión
  const fatigueTrend = sessions
    .map((s) => {
      const mf = s.musculos_fatiga || {};
      if (typeof mf === "object") {
        const vals = Object.values(mf).map((v) => Number(v) || 0);
        const avg = vals.length
          ? vals.reduce((a, b) => a + b, 0) / vals.length
          : 0;
        return avg;
      }
      return 0;
    })
    .reverse();

  return { sessions, isLoading, error, fatigueTrend };
};

export default useProgressData;
