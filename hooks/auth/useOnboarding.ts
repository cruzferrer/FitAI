import { useState, useEffect } from "react";
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
  comfort: [
    "Priorizar comodidad (ejercicios sencillos)",
    "Priorizar máxima transferencia",
  ],
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
  const [generationPreference, setGenerationPreference] = useState<
    string | null
  >("Generado por IA");
  const [preferredExercises, setPreferredExercises] = useState<string | null>(
    null
  );
  const [injuries, setInjuries] = useState<string | null>(null);
  const [timePerSession, setTimePerSession] = useState<number | null>(60);
  const [comfortPreference, setComfortPreference] = useState<string | null>(
    "Priorizar comodidad (ejercicios sencillos)"
  );
  const [isLoading, setIsLoading] = useState(false);

  // Cargar preferencias guardadas al montar el componente
  useEffect(() => {
    const loadSavedPreferences = async () => {
      try {
        const saved = await AsyncStorage.getItem("@FitAI_UserPreferences");
        if (saved) {
          const prefs = JSON.parse(saved);
          setObjective(prefs.objective ?? null);
          setExperience(prefs.experience ?? null);
          setDays(prefs.days ?? null);
          setEquipment(prefs.equipment ?? null);
          setNotation(prefs.notation ?? "Tradicional (Al Fallo)");
          setGenerationPreference(
            prefs.generationPreference ?? "Generado por IA"
          );
          setPreferredExercises(prefs.preferredExercises ?? null);
          setInjuries(prefs.injuries ?? null);
          setTimePerSession(prefs.timePerSession ?? 60);
          setComfortPreference(
            prefs.comfortPreference ??
              "Priorizar comodidad (ejercicios sencillos)"
          );
        }
      } catch (error) {
        console.error("Error cargando preferencias:", error);
      }
    };
    loadSavedPreferences();
  }, []);

  // Guardar preferencias cada vez que cambien
  const savePreferences = async (prefs: any) => {
    try {
      await AsyncStorage.setItem(
        "@FitAI_UserPreferences",
        JSON.stringify(prefs)
      );
    } catch (error) {
      console.error("Error guardando preferencias:", error);
    }
  };

  // Actualizar setters para guardar automáticamente
  const wrappedSetObjective = (val: string | null) => {
    setObjective(val);
    savePreferences({
      objective: val,
      experience,
      days,
      equipment,
      notation,
      generationPreference,
      preferredExercises,
      injuries,
      timePerSession,
      comfortPreference,
    });
  };

  const wrappedSetExperience = (val: string | null) => {
    setExperience(val);
    savePreferences({
      objective,
      experience: val,
      days,
      equipment,
      notation,
      generationPreference,
      preferredExercises,
      injuries,
      timePerSession,
      comfortPreference,
    });
  };

  const wrappedSetDays = (val: number | null) => {
    setDays(val);
    savePreferences({
      objective,
      experience,
      days: val,
      equipment,
      notation,
      generationPreference,
      preferredExercises,
      injuries,
      timePerSession,
      comfortPreference,
    });
  };

  const wrappedSetEquipment = (val: string | null) => {
    setEquipment(val);
    savePreferences({
      objective,
      experience,
      days,
      equipment: val,
      notation,
      generationPreference,
      preferredExercises,
      injuries,
      timePerSession,
      comfortPreference,
    });
  };

  const wrappedSetNotation = (val: string | null) => {
    setNotation(val);
    savePreferences({
      objective,
      experience,
      days,
      equipment,
      notation: val,
      generationPreference,
      preferredExercises,
      injuries,
      timePerSession,
      comfortPreference,
    });
  };

  const wrappedSetGenerationPreference = (val: string | null) => {
    setGenerationPreference(val);
    savePreferences({
      objective,
      experience,
      days,
      equipment,
      notation,
      generationPreference: val,
      preferredExercises,
      injuries,
      timePerSession,
      comfortPreference,
    });
  };

  const wrappedSetPreferredExercises = (val: string | null) => {
    setPreferredExercises(val);
    savePreferences({
      objective,
      experience,
      days,
      equipment,
      notation,
      generationPreference,
      preferredExercises: val,
      injuries,
      timePerSession,
      comfortPreference,
    });
  };

  const wrappedSetInjuries = (val: string | null) => {
    setInjuries(val);
    savePreferences({
      objective,
      experience,
      days,
      equipment,
      notation,
      generationPreference,
      preferredExercises,
      injuries: val,
      timePerSession,
      comfortPreference,
    });
  };

  const wrappedSetTimePerSession = (val: number | null) => {
    setTimePerSession(val);
    savePreferences({
      objective,
      experience,
      days,
      equipment,
      notation,
      generationPreference,
      preferredExercises,
      injuries,
      timePerSession: val,
      comfortPreference,
    });
  };

  const wrappedSetComfortPreference = (val: string | null) => {
    setComfortPreference(val);
    savePreferences({
      objective,
      experience,
      days,
      equipment,
      notation,
      generationPreference,
      preferredExercises,
      injuries,
      timePerSession,
      comfortPreference: val,
    });
  };

  // Derivamos si el formulario está completo (solo campos requeridos)
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
      Alert.alert(
        "Faltan Datos",
        "Por favor, completa todas las selecciones requeridas."
      );
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
      setObjective: wrappedSetObjective,
      setExperience: wrappedSetExperience,
      setDays: wrappedSetDays,
      setEquipment: wrappedSetEquipment,
      setNotation: wrappedSetNotation,
      setGenerationPreference: wrappedSetGenerationPreference,
      setPreferredExercises: wrappedSetPreferredExercises,
      setInjuries: wrappedSetInjuries,
      setTimePerSession: wrappedSetTimePerSession,
      setComfortPreference: wrappedSetComfortPreference,
    },
    handleGenerateRoutine,
    OPTIONS, // Exportamos las opciones para que la UI las use
  };
};
