import { useState, useCallback } from "react";
import { useFocusEffect } from "expo-router";
import { supabase } from "../../constants/supabaseClient";
import { useAuth } from "../auth/useAuth";

interface WeightPoint {
  id?: number;
  fecha: string;
  peso: number;
}

export const useWeightHistory = (days = 30) => {
  const { session } = useAuth();
  const [data, setData] = useState<WeightPoint[]>([]);
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
            setData([]);
            return;
          }

          // Read from the actual table in your DB: registros_peso
          const res = await supabase
            .from("registros_peso")
            .select("id, fecha, peso")
            .eq("user_id", userId)
            .order("fecha", { ascending: false })
            .limit(days);

          if (res.error) {
            // If the table doesn't exist or another DB error occurs, log and return empty set
            console.warn("weight history query error:", res.error.message);
            setData([]);
            return;
          }

          const rows = res.data || [];
          const points = (rows as any[])
            .map((r) => ({
              fecha: r.fecha,
              peso: Number(r.peso || 0),
              id: r.id,
            }))
            .reverse(); // ascending

          if (!cancelled) setData(points);
        } catch (e: any) {
          if (!cancelled) setError(e);
        } finally {
          if (!cancelled) setIsLoading(false);
        }
      };

      load();
      return () => {
        cancelled = true;
      };
    }, [session, days])
  );

  return { data, isLoading, error };
};

export default useWeightHistory;
