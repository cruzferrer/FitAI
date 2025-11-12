import { useState } from "react";
import { Alert } from "react-native";
import { useRouter } from "expo-router";
import { supabase } from "../../../constants/supabaseClient"; // Asegúrate que la ruta sea correcta

// Multiplicadores de Actividad
export const ACTIVITY_FACTORS = {
  Sedentario: 1.2, // Poco o ningún ejercicio
  Ligero: 1.375, // Ejercicio ligero 1-3 días
  Moderado: 1.55, // Ejercicio moderado 3-5 días
  Activo: 1.725, // Ejercicio fuerte 6-7 días
  Extremo: 1.9, // Ejercicio muy intenso / trabajo físico
};

export const useCalorieCalculator = () => {
  const router = useRouter();
  const [peso, setPeso] = useState("");
  const [altura, setAltura] = useState("");
  const [edad, setEdad] = useState("");
  const [sexo, setSexo] = useState<string | null>(null);
  const [actividad, setActividad] = useState<string | null>(null);
  const [objetivo, setObjetivo] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // --- Lógica de Cálculo ---
  const calculateKcal = (): number => {
    const P = parseFloat(peso);
    const A = parseFloat(altura);
    const E = parseInt(edad, 10);
    const factor = actividad
      ? ACTIVITY_FACTORS[actividad as keyof typeof ACTIVITY_FACTORS]
      : 1.2;

    if (isNaN(P) || isNaN(A) || isNaN(E) || !sexo) return 0;

    let tmb: number;
    if (sexo === "Masculino") {
      tmb = 10 * P + 6.25 * A - 5 * E + 5;
    } else {
      // Femenino
      tmb = 10 * P + 6.25 * A - 5 * E - 161;
    }

    let mantenimientoKcal = tmb * factor;

    if (objetivo === "Definición") {
      mantenimientoKcal -= 500;
    } else if (objetivo === "Volumen") {
      mantenimientoKcal += 300;
    }

    return Math.round(mantenimientoKcal);
  };

  // --- Lógica de API ---
  const handleSaveParameters = async () => {
    const kcalResult = calculateKcal();
    if (kcalResult <= 0) {
      Alert.alert(
        "Error",
        "Por favor, completa todos los campos con valores válidos."
      );
      return;
    }

    setIsLoading(true);
    try {
      // Usamos .getUser() para evitar el error de 'currentUser'
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id;
      if (!userId) throw new Error("Usuario no autenticado.");

      const { error } = await supabase.from("parametros_usuario").upsert(
        {
          user_id: userId,
          sexo: sexo!,
          peso: parseFloat(peso),
          altura: parseFloat(altura),
          edad: parseInt(edad, 10),
          nivel_actividad:
            ACTIVITY_FACTORS[actividad as keyof typeof ACTIVITY_FACTORS],
          kcal_mantenimiento: kcalResult,
          objetivo_calorico: objetivo!,
        } as any,
        { onConflict: "user_id" }
      );

      if (error) throw error;

      Alert.alert("Éxito", `Tu meta calórica diaria es ${kcalResult} kcal.`);
      router.replace("/(tabs)/nutrition"); // Vuelve al Log de Nutrición
    } catch (error: any) {
      Alert.alert("Error de DB", error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    state: { peso, altura, edad, sexo, actividad, objetivo, isLoading },
    setters: {
      setPeso,
      setAltura,
      setEdad,
      setSexo,
      setActividad,
      setObjetivo,
    },
    calculateKcal,
    handleSaveParameters,
  };
};
