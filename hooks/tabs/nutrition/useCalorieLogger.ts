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

      const today = new Date().toISOString().split("T")[0];
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

      const currentConsumed = registroHoy?.kcal_consumidas || 0;
      const newTotal = currentConsumed + kcalToAdd;
      const today = new Date().toISOString().split("T")[0];

      const { error } = await supabase.from("registro_calorias").upsert(
        {
          user_id: userId,
          fecha: today,
          kcal_consumidas: newTotal,
        } as any,
        { onConflict: "user_id, fecha" }
      );

      if (error) throw error;

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
