import { useState } from "react";
import { supabase } from "../../constants/supabaseClient";
import { useRouter } from "expo-router";

const formatLocalDate = (d = new Date()) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

export const useWeightLogger = () => {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);

  const addWeight = async (weight: number) => {
    setIsSaving(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id;
      if (!userId) throw new Error("Usuario no autenticado.");

      const fecha = formatLocalDate();

      const { error } = await supabase.from("registros_peso").insert({
        user_id: userId,
        peso: weight,
        fecha,
      } as any);

      if (error) throw error;

      // simple refresh: navigate to same route to trigger focus hooks that reload data
      router.replace("/(tabs)/nutrition");
      return true;
    } catch (e: any) {
      console.error("Error guardando peso:", e.message || e);
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  return { addWeight, isSaving };
};

export default useWeightLogger;
