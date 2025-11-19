import { useState, useCallback } from "react";
import { useFocusEffect, useRouter } from "expo-router";
import { Alert } from "react-native";
import { supabase } from "../../../constants/supabaseClient";

// Tipos
interface Parametros {
  kcal_mantenimiento: number;
  objetivo_calorico: string;
}
interface Registro {
  id: number;
  kcal_consumidas: number;
  fecha: string;
}

export const useCalorieLogger = () => {
  const router = useRouter();
  const [parametros, setParametros] = useState<Parametros | null>(null);
  const [registroHoy, setRegistroHoy] = useState<Registro | null>(null);
  const [nuevoConsumo, setNuevoConsumo] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // --- Lógica de Carga de Datos ---
  const loadData = async () => {
    setIsLoading(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id;
      if (!userId) {
        // Si no hay usuario, no cargues nada
        setIsLoading(false);
        return;
      }

      const { data: paramData } = await supabase
        .from("parametros_usuario")
        .select("kcal_mantenimiento, objetivo_calorico")
        .eq("user_id", userId)
        .maybeSingle();

      if (paramData) setParametros(paramData as Parametros);

      // Use local date (YYYY-MM-DD) to avoid UTC-related off-by-one days
      const formatLocalDate = (d = new Date()) => {
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, "0");
        const day = String(d.getDate()).padStart(2, "0");
        return `${y}-${m}-${day}`;
      };
      const today = formatLocalDate();
      const { data: regData } = await supabase
        .from("registro_calorias")
        .select("*")
        .eq("user_id", userId)
        .eq("fecha", today)
        .maybeSingle();

      if (regData) setRegistroHoy(regData as Registro);
      else setRegistroHoy(null);
    } catch (e: any) {
      console.error("Error al cargar datos nutricionales:", e.message);
    } finally {
      setIsLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  // --- Lógica de API (Registro) ---
  const handleLogCalories = async () => {
    const kcalToAdd = parseInt(nuevoConsumo, 10);
    if (isNaN(kcalToAdd) || kcalToAdd <= 0) {
      Alert.alert("Error", "Ingresa una cantidad válida.");
      return;
    }
    setIsSaving(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id;
      if (!userId) throw new Error("Usuario no autenticado.");

      const formatLocalDate = (d = new Date()) => {
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, "0");
        const day = String(d.getDate()).padStart(2, "0");
        return `${y}-${m}-${day}`;
      };
      const today = formatLocalDate();

      // Busca registro existente del día
      const { data: existing, error: selErr } = await supabase
        .from("registro_calorias")
        .select("id, kcal_consumidas")
        .eq("user_id", userId)
        .eq("fecha", today)
        .maybeSingle();

      if (selErr) throw selErr;

      const currentConsumed = existing
        ? Number(existing.kcal_consumidas || 0)
        : 0;
      const newTotal = currentConsumed + kcalToAdd;

      if (existing && existing.id) {
        const { error: updErr } = await supabase
          .from("registro_calorias")
          .update({ kcal_consumidas: newTotal })
          .eq("id", existing.id as any);
        if (updErr) throw updErr;
      } else {
        const { error: insErr } = await supabase
          .from("registro_calorias")
          .insert({
            user_id: userId,
            fecha: today,
            kcal_consumidas: newTotal,
          } as any);
        if (insErr) throw insErr;
      }

      setNuevoConsumo("");
      await loadData(); // Recarga los datos
      Alert.alert(
        "Registrado",
        `${kcalToAdd} kcal añadidas. Total: ${newTotal}`
      );
    } catch (e: any) {
      Alert.alert("Error", e.message);
    } finally {
      setIsSaving(false);
    }
  };

  return {
    state: { isLoading, isSaving, parametros, registroHoy, nuevoConsumo },
    setNuevoConsumo,
    handleLogCalories,
    router,
  };
};
