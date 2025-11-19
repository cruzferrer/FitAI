import { useState } from "react";
import { Alert } from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { supabase } from "../../constants/supabaseClient"; // Asegúrate que la ruta sea correcta

// Opciones del formulario
export const OPTIONS = {
  objective: ["Fuerza", "Hipertrofia", "Mixto"],
  experience: ["Principiante", "Intermedio", "Avanzado"],
  days: [2, 3, 4, 5, 6],
  equipment: ["Gimnasio completo", "Mancuernas y casa", "Solo peso corporal"],
  notation: ["RPE / RIR (Moderno)", "Tradicional (Al Fallo)"],
  generationPreference: ["Generado por IA", "Plantilla estándar", "Mixto"],
  timePerSession: [30, 45, 60],
  comfort: ["Priorizar comodidad (ejercicios sencillos)", "Priorizar máxima transferencia"]
};

// Hook
export const useOnboarding = () => {
  const router = useRouter();

  const [objective, setObjective] = useState<string | null>(null);
  const [experience, setExperience] = useState<string | null>(null);
  const [days, setDays] = useState<number | null>(null);
  const [equipment, setEquipment] = useState<string | null>(null);
  const [notation, setNotation] = useState<string | null>(
    "Tradicional (Al Fallo)"
  );
  const [generationPreference, setGenerationPreference] = useState<string | null>(
    "Generado por IA"
  );
  const [preferredExercises, setPreferredExercises] = useState<string | null>(
    null
  );
  const [injuries, setInjuries] = useState<string | null>(null);
  const [timePerSession, setTimePerSession] = useState<number | null>(60);
  const [comfortPreference, setComfortPreference] = useState<string | null>(
    "Priorizar comodidad (ejercicios sencillos)"
  );
  const [isLoading, setIsLoading] = useState(false);

  // Derivamos si el formulario está completo
  const isFormComplete = !!(
    objective &&
    experience &&
    days &&
    equipment &&
    notation &&
    generationPreference
  );

  // URL de tu Edge Function (Tu ID es necesario aquí)
  const EDGE_FUNCTION_URL = `https://bcehelazqipkgdhvwcqk.supabase.co/functions/v1/generar-rutina`;
  const SUPABASE_ANON_KEY = "TU_CLAVE_ANON_PUBLICA_AQUI"; // 🚨 RECUERDA PONER TU CLAVE

  const handleGenerateRoutine = async () => {
    if (!isFormComplete) {
      Alert.alert("Faltan Datos", "Por favor, completa todas las selecciones.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(EDGE_FUNCTION_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          user_objective: objective,
          user_experience: experience,
          available_days: days,
          user_equipment: equipment,
          user_notation: notation,
          generation_preference: generationPreference,
          preferred_exercises: preferredExercises,
          injuries: injuries,
          time_per_session: timePerSession,
          comfort_preference: comfortPreference,
        }),
      });

      const data = await response.json();
      if (!response.ok || data.error) {
        throw new Error(
          data.error || `Fallo de Edge Function: Status ${response.status}`
        );
      }

      await AsyncStorage.setItem("@FitAI_UserRoutine", JSON.stringify(data));
      await AsyncStorage.setItem(
        "@FitAI_WorkoutProgress",
        JSON.stringify({
          weekIndex: 0,
          dayIndex: 0,
          lastCompleted: null,
        })
      );

      Alert.alert("¡IA Conectada!", "Rutina generada exitosamente.");
      router.replace("/(tabs)/dashboard");
    } catch (error) {
      let errorMessage = "Error desconocido.";
      if (error instanceof Error) errorMessage = error.message;
      Alert.alert("Error de IA", errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    state: {
      objective,
      experience,
      days,
      equipment,
      notation,
      generationPreference,
      preferredExercises,
      injuries,
      timePerSession,
      comfortPreference,
      isLoading,
      isFormComplete,
    },
    setters: {
      setObjective,
      setExperience,
      setDays,
      setEquipment,
      setNotation,
      setGenerationPreference,
      setPreferredExercises,
      setInjuries,
      setTimePerSession,
      setComfortPreference,
    },
    handleGenerateRoutine,
    OPTIONS, // Exportamos las opciones para que la UI las use
  };
};
