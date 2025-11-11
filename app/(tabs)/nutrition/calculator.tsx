import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { supabase } from "../../../constants/supabaseClient";
import { COLORS } from "@/constants/theme";
import OptionSelector from "../../../components/Form/OptionSelector";
import PrimaryButton from "../../../components/Buttons/PrimaryButton";

// Multiplicadores de Actividad para Kcal de Mantenimiento
const ACTIVITY_FACTORS = {
  Sedentario: 1.2, // Poco o ningún ejercicio
  Ligero: 1.375, // Ejercicio ligero 1-3 días a la semana
  Moderado: 1.55, // Ejercicio moderado 3-5 días a la semana
  Activo: 1.725, // Ejercicio fuerte 6-7 días a la semana
  Extremo: 1.9, // Ejercicio muy intenso / trabajo físico
};

const NutritionCalculatorScreen: React.FC = () => {
  const router = useRouter();
  const [peso, setPeso] = useState("");
  const [altura, setAltura] = useState("");
  const [edad, setEdad] = useState("");
  const [sexo, setSexo] = useState<string | null>(null);
  const [actividad, setActividad] = useState<string | null>(null);
  const [objetivo, setObjetivo] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // --- FUNCIÓN DE CÁLCULO DE CALORÍAS (Mifflin-St Jeor) ---
  const calculateKcal = (): number => {
    const P = parseFloat(peso);
    const A = parseFloat(altura);
    const E = parseInt(edad, 10);
    const factor = actividad
      ? ACTIVITY_FACTORS[actividad as keyof typeof ACTIVITY_FACTORS]
      : 1.2;

    if (isNaN(P) || isNaN(A) || isNaN(E) || !sexo) return 0;

    // Fórmula de Mifflin-St Jeor (la más precisa)
    let tmb: number;
    if (sexo === "Masculino") {
      tmb = 10 * P + 6.25 * A - 5 * E + 5;
    } else {
      // Femenino
      tmb = 10 * P + 6.25 * A - 5 * E - 161;
    }

    // Kcal de Mantenimiento (TMB * Factor de Actividad)
    let mantenimientoKcal = tmb * factor;

    // Aplicar Objetivo Calórico (el LLM puede usar esto como un principio)
    if (objetivo === "Definición") {
      mantenimientoKcal -= 500; // Déficit de 500
    } else if (objetivo === "Volumen") {
      mantenimientoKcal += 300; // Superávit de 300
    }

    return Math.round(mantenimientoKcal);
  };

  // --- GUARDAR PARÁMETROS ---
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
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id;
      if (!userId) throw new Error("Usuario no autenticado.");

      // Guardar en Supabase y sobrescribir si existe (UPSERT)
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
      ); // Usamos 'user_id' como la clave de conflicto para actualizar

      if (error) throw error;

      Alert.alert("Éxito", `Tu meta calórica diaria es ${kcalResult} kcal.`);
      router.replace("/(tabs)/nutrition"); // Vuelve al Log de Nutrición
    } catch (error: any) {
      Alert.alert("Error de DB", error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.headerTitle}>Calculadora de Kcal Diarias</Text>
        <Text style={styles.subHeader}>
          Usamos la fórmula de Mifflin-St Jeor para determinar tu TMB y
          requerimiento calórico.
        </Text>

        {/* Sexo */}
        <Text style={styles.label}>1. Sexo</Text>
        <OptionSelector
          options={["Masculino", "Femenino"]}
          selectedValue={sexo}
          onSelect={(val) => setSexo(val as string)}
        />

        {/* Datos Biométricos */}
        <Text style={styles.label}>2. Datos Biométricos (kg/cm/años)</Text>
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder="Peso (kg)"
            keyboardType="numeric"
            value={peso}
            onChangeText={setPeso}
          />
          <TextInput
            style={styles.input}
            placeholder="Altura (cm)"
            keyboardType="numeric"
            value={altura}
            onChangeText={setAltura}
          />
          <TextInput
            style={styles.input}
            placeholder="Edad"
            keyboardType="numeric"
            value={edad}
            onChangeText={setEdad}
          />
        </View>

        {/* Nivel de Actividad */}
        <Text style={styles.label}>3. Nivel de Actividad</Text>
        <OptionSelector
          options={Object.keys(ACTIVITY_FACTORS)}
          selectedValue={actividad}
          onSelect={(val) => setActividad(val as string)}
        />

        {/* Objetivo Calórico */}
        <Text style={styles.label}>4. Objetivo</Text>
        <OptionSelector
          options={["Salud", "Volumen", "Definición"]}
          selectedValue={objetivo}
          onSelect={(val) => setObjetivo(val as string)}
        />

        {/* Resultado */}
        <Text style={styles.resultText}>
          Kcal Estimadas: {calculateKcal() > 0 ? calculateKcal() : "..."}
        </Text>

        <PrimaryButton
          title={isLoading ? "Guardando..." : "Guardar Parámetros"}
          onPress={handleSaveParameters}
          isLoading={isLoading}
          disabled={
            !sexo || !actividad || !objetivo || !peso || !altura || !edad
          }
          style={{ marginTop: 30 }}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  container: { padding: 20 },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.accent,
    marginBottom: 10,
  },
  subHeader: { color: COLORS.secondaryText, fontSize: 14, marginBottom: 20 },
  label: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.primaryText,
    marginTop: 20,
    marginBottom: 10,
  },
  inputRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  input: {
    flex: 1,
    backgroundColor: COLORS.inputBackground,
    color: COLORS.primaryText,
    borderRadius: 8,
    padding: 12,
    marginHorizontal: 5,
    textAlign: "center",
    borderWidth: 1,
    borderColor: COLORS.separator,
  },
  resultText: {
    fontSize: 22,
    fontWeight: "bold",
    color: COLORS.primaryText,
    textAlign: "center",
    marginTop: 30,
    padding: 10,
    backgroundColor: COLORS.inputBackground,
    borderRadius: 10,
  },
});

export default NutritionCalculatorScreen;
