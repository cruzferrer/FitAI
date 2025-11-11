import React, { useState } from "react";
import { Text, StyleSheet, ScrollView, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { supabase } from "../../constants/supabaseClient";
import { COLORS } from "../../constants/theme";
import AsyncStorage from "@react-native-async-storage/async-storage";
import OptionSelector from "../../components/Form/OptionSelector";
import PrimaryButton from "@/components/Buttons/PrimaryButton";

const OPTIONS = {
  objective: ["Fuerza", "Hipertrofia", "Mixto"],
  experience: ["Principiante", "Intermedio", "Avanzado"],
  days: [3, 4, 5, 6],
  equipment: ["Gimnasio completo", "Mancuernas y casa", "Solo peso corporal"],
  // --- AÑADIR ESTO ---
  notation: ["RPE / RIR (Moderno)", "Tradicional (Al Fallo)"],
};

const OnboardingScreen: React.FC = () => {
  const router = useRouter();
  const [objective, setObjective] = useState<string | null>(null);
  const [experience, setExperience] = useState<string | null>(null);
  const [days, setDays] = useState<number | null>(null);
  const [equipment, setEquipment] = useState<string | null>(null);
  const [notation, setNotation] = useState<string | null>(
    "Tradicional (Al Fallo)"
  );
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerateRoutine = async () => {
    // --- ACTUALIZAR VALIDACIÓN ---
    if (!objective || !experience || !days || !equipment || !notation) {
      Alert.alert("Faltan Datos", "Por favor, completa todas las selecciones.");
      return;
    }

    setIsLoading(true);

    try {
      const { data, error: invokeError } = await supabase.functions.invoke(
        "generar-rutina",
        {
          method: "POST",
          body: {
            user_objective: objective,
            user_experience: experience,
            available_days: days,
            user_equipment: equipment,
            user_notation: notation, // <-- ENVIAR LA NUEVA VARIABLE
          },
        }
      );

      if (invokeError) {
        throw new Error(invokeError.message);
      }

      if (data && data.error) {
        throw new Error(data.error);
      }

      const jsonOutput = data;

      // Guardar el JSON
      await AsyncStorage.setItem(
        "@FitAI_UserRoutine",
        JSON.stringify(jsonOutput)
      );

      // Inicializar el progreso (Semana 0, Día 0)
      await AsyncStorage.setItem(
        "@FitAI_WorkoutProgress",
        JSON.stringify({
          weekIndex: 0,
          dayIndex: 0,
          lastCompleted: null,
        })
      );

      Alert.alert(
        "¡IA Conectada!",
        "Rutina generada. Revisa la consola o guarda los datos."
      );
      console.log(JSON.stringify(jsonOutput, null, 2));

      router.replace("/(tabs)");
    } catch (error) {
      let errorMessage = "Error desconocido o de red.";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      Alert.alert(
        "Error de IA",
        `El servidor falló: ${errorMessage}. Revisa la clave ANON.`
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Función auxiliar para renderizar los botones de opción

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.header}>¡Hola! Configura FitAI 🤖</Text>
        <Text style={styles.subHeader}>
          Necesitamos estos datos para generar tu Mesociclo.
        </Text>

        {/* --- 3. USAR EL NUEVO COMPONENTE --- */}
        <Text style={styles.label}>1. ¿Cuál es tu objetivo principal?</Text>
        <OptionSelector
          options={OPTIONS.objective}
          selectedValue={objective}
          onSelect={(val) => setObjective(val as string)}
          disabled={isLoading}
        />

        <Text style={styles.label}>2. ¿Cuál es tu nivel de experiencia?</Text>
        <OptionSelector
          options={OPTIONS.experience}
          selectedValue={experience}
          onSelect={(val) => setExperience(val as string)}
          disabled={isLoading}
        />

        <Text style={styles.label}>3. Días disponibles a la semana:</Text>
        <OptionSelector
          options={OPTIONS.days}
          selectedValue={days}
          onSelect={(val) => setDays(val as number)}
          disabled={isLoading}
        />

        <Text style={styles.label}>4. Equipamiento Disponible:</Text>
        <OptionSelector
          options={OPTIONS.equipment}
          selectedValue={equipment}
          onSelect={(val) => setEquipment(val as string)}
          disabled={isLoading}
        />

        <Text style={styles.label}>5. Preferencia de Notación:</Text>
        <OptionSelector
          options={OPTIONS.notation}
          selectedValue={notation}
          onSelect={(val) => setNotation(val as string)}
          disabled={isLoading}
        />
      </ScrollView>
      <PrimaryButton
        title="Generar Rutina con IA"
        onPress={handleGenerateRoutine}
        isLoading={isLoading}
        disabled={!objective || !experience || !days || !equipment || !notation}
        // Opcional: Si el botón tiene un estilo diferente en el Onboarding (margen, etc.), puedes pasarlo
        style={{ marginTop: 40 }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  container: { padding: 20 },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.accent,
    marginBottom: 10,
  },
  subHeader: { fontSize: 16, color: COLORS.secondaryText, marginBottom: 30 },
  label: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.primaryText,
    marginTop: 20,
    marginBottom: 10,
  },
  buttonGroup: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 10,
  },
  optionButton: {
    backgroundColor: COLORS.inputBackground,
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.separator,
  },
  optionButtonActive: {
    backgroundColor: COLORS.accent,
    borderColor: COLORS.accent,
  },
  optionText: { color: COLORS.primaryText, fontWeight: "500" },
  optionTextActive: { color: COLORS.background, fontWeight: "bold" },
});

export default OnboardingScreen;
