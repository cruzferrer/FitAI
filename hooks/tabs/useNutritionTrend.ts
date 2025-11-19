import { useState, useCallback } from "react";
import { useFocusEffect } from "expo-router";
import { supabase } from "../../constants/supabaseClient";
import { useAuth } from "../auth/useAuth";

interface NutritionPoint {
  fecha: string;
  value: number; // fat grams or kcal fallback
}

export const useNutritionTrend = (days = 14) => {
  const { session } = useAuth();
  const [data, setData] = useState<NutritionPoint[]>([]);
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

          const res = await supabase
            .from("registro_calorias")
            .select("fecha, kcal_consumidas")
            .eq("user_id", userId)
            .order("fecha", { ascending: false })
            .limit(days);

          if (res.error) throw res.error;

          const rows = res.data || [];
          // Map rows to numbers: use kcal_consumidas (calories per day)
          const points = rows
            .map((r: any) => ({
              fecha: r.fecha,
              value: Number(r.kcal_consumidas || 0),
            }))
            .reverse(); // ascending by date

          if (!cancelled) setData(points);
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
    }, [session, days])
  );

  return { data, isLoading, error };
};

export default useNutritionTrend;
