import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { supabase } from "../../constants/supabaseClient";
import { COLORS } from "../../constants/theme";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Opciones predefinidas para el formulario (Datos clave para el motor de IA)
const OPTIONS = {
  objective: ["Fuerza", "Hipertrofia", "Mixto"],
  experience: ["Principiante", "Intermedio", "Avanzado"],
  days: [3, 4, 5, 6],
  equipment: ["Gimnasio completo", "Mancuernas y casa", "Solo peso corporal"],
};

const OnboardingScreen: React.FC = () => {
  const router = useRouter();

  // Estados para capturar las selecciones del usuario
  const [objective, setObjective] = useState<string | null>(null);
  const [experience, setExperience] = useState<string | null>(null);
  const [days, setDays] = useState<number | null>(null);
  const [equipment, setEquipment] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(false);

  const handleGenerateRoutine = async () => {
    if (!objective || !experience || !days || !equipment) {
      Alert.alert("Faltan Datos", "Por favor, completa todas las selecciones.");
      return;
    }

    setIsLoading(true);

    try {
      //El objeto de configuración va directamente en el segundo argumento
      const { data, error: invokeError } = await supabase.functions.invoke(
        "generar-rutina", // Primer argumento: nombre de la función
        {
          // Segundo argumento: objeto de configuración
          method: "POST",
          body: {
            user_objective: objective,
            user_experience: experience,
            available_days: days,
            user_equipment: equipment,
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

      await AsyncStorage.setItem(
        "@FitAI_UserRoutine",
        JSON.stringify(jsonOutput)
      );


      Alert.alert(
        "¡IA Conectada!",
        "Rutina generada. Revisa la consola o guarda los datos."
      );

      //Nos movemos a la pantalla principal
      router.replace("/(tabs)");
      
    } catch (error) {
      let errorMessage = "Error desconocido o de red.";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      // Este catch maneja el error de red o el error lanzado por invokeError.
      Alert.alert(
        "Error de IA",
        `El servidor falló: ${errorMessage}. Revisa la clave ANON.`
      );
    } finally {
      setIsLoading(false);
    }
  };
  // Función auxiliar para renderizar los botones de opción
  const renderOptionButtons = (
    key: keyof typeof OPTIONS,
    setValue: (v: any) => void,
    currentValue: any
  ) => (
    <View style={styles.buttonGroup}>
      {OPTIONS[key].map((item, index) => (
        <TouchableOpacity
          key={index}
          style={[
            styles.optionButton,
            currentValue === item && styles.optionButtonActive,
          ]}
          onPress={() => setValue(item)}
          disabled={isLoading}
        >
          <Text
            style={[
              styles.optionText,
              currentValue === item && styles.optionTextActive,
            ]}
          >
            {item}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.header}>¡Hola! Configura FitAI 🤖</Text>
        <Text style={styles.subHeader}>
          Necesitamos estos datos para generar tu Mesociclo de 6 semanas.
        </Text>

        {/* 1. Objetivo Principal */}
        <Text style={styles.label}>1. ¿Cuál es tu objetivo principal?</Text>
        {renderOptionButtons("objective", setObjective, objective)}

        {/* 2. Nivel de Experiencia */}
        <Text style={styles.label}>2. ¿Cuál es tu nivel de experiencia?</Text>
        {renderOptionButtons("experience", setExperience, experience)}

        {/* 3. Días de Entrenamiento */}
        <Text style={styles.label}>3. Días disponibles a la semana:</Text>
        {renderOptionButtons("days", setDays, days)}

        {/* 4. Equipamiento Disponible */}
        <Text style={styles.label}>4. Equipamiento Disponible:</Text>
        {renderOptionButtons("equipment", setEquipment, equipment)}

        {/* Botón de Generación */}
        <TouchableOpacity
          style={styles.generateButton}
          onPress={handleGenerateRoutine}
          disabled={
            isLoading || !objective || !experience || !days || !equipment
          }
        >
          {isLoading ? (
            <ActivityIndicator color={COLORS.background} />
          ) : (
            <Text style={styles.generateButtonText}>Generar Rutina con IA</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
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
  generateButton: {
    backgroundColor: COLORS.accent,
    padding: 15,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 40,
  },
  generateButtonText: {
    color: COLORS.background,
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default OnboardingScreen;
