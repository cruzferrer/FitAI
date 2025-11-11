import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
  Dimensions,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect, useRouter } from "expo-router";
import { supabase } from "../../../constants/supabaseClient";
import { COLORS } from "@/constants/theme";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LineChart } from "react-native-chart-kit"; // Asegúrate de tener esto instalado
import PrimaryButton from "../../../components/Buttons/PrimaryButton";
import CalorieWidget from "../../../components/Dashboard/CalorieWidget";

const screenWidth = Dimensions.get("window").width;

interface Parametros {
  kcal_mantenimiento: number;
  objetivo_calorico: string;
}

interface RegistroKcal {
  kcal_consumidas: number;
}

interface RegistroPeso {
  id: string;
  peso: number;
  fecha: string;
}

const NutritionHubScreen: React.FC = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // --- ESTADOS CALORÍAS ---
  const [parametros, setParametros] = useState<Parametros | null>(null);
  const [registroKcalHoy, setRegistroKcalHoy] = useState<RegistroKcal | null>(
    null
  );
  const [nuevoConsumo, setNuevoConsumo] = useState("");

  // --- ESTADOS PESO ---
  const [pesos, setPesos] = useState<RegistroPeso[]>([]);
  const [nuevoPeso, setNuevoPeso] = useState("");

  // ---------------------------------------------------------
  // 1. CARGA DE DATOS (COMBINADA)
  // ---------------------------------------------------------
  const loadData = async () => {
    setIsLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const userId = user?.id;

      if (!userId) return;

      const today = new Date().toISOString().split("T")[0];

      // A. Cargar Parámetros y Kcal de Hoy
      const { data: paramData } = await supabase
        .from("parametros_usuario")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();
      if (paramData) setParametros(paramData);

      const { data: kcalData } = await supabase
        .from("registro_calorias")
        .select("kcal_consumidas")
        .eq("user_id", userId)
        .eq("fecha", today)
        .maybeSingle();
      if (kcalData) setRegistroKcalHoy(kcalData);
      else setRegistroKcalHoy(null);

      // B. Cargar Historial de Peso
      const { data: pesoData } = await supabase
        .from("registros_peso")
        .select("*")
        .order("fecha", { ascending: true });
      if (pesoData) setPesos(pesoData);
    } catch (e: any) {
      console.error("Error cargando datos de nutrición:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  // ---------------------------------------------------------
  // 2. HANDLERS (CALORÍAS Y PESO)
  // ---------------------------------------------------------
  const handleLogCalories = async () => {
    const kcalToAdd = parseInt(nuevoConsumo, 10);
    if (isNaN(kcalToAdd) || kcalToAdd <= 0) {
      Alert.alert("Error", "Ingresa una cantidad válida.");
      return;
    }
    setIsSaving(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const today = new Date().toISOString().split("T")[0];
      const currentTotal = registroKcalHoy?.kcal_consumidas || 0;
      const newTotal = currentTotal + kcalToAdd;

      const { error } = await supabase.from("registro_calorias").upsert(
        {
          user_id: user!.id,
          fecha: today,
          kcal_consumidas: newTotal,
        },
        { onConflict: "user_id, fecha" }
      );

      if (error) throw error;
      setNuevoConsumo("");
      await loadData();
      Alert.alert("Registrado", `${kcalToAdd} kcal añadidas.`);
    } catch (e: any) {
      Alert.alert("Error", e.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogWeight = async () => {
    const pesoNum = parseFloat(nuevoPeso.replace(",", "."));
    if (isNaN(pesoNum) || pesoNum <= 0) {
      Alert.alert("Error", "Ingresa un peso válido.");
      return;
    }
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("registros_peso")
        .insert([{ peso: pesoNum }]);
      if (error) throw error;
      setNuevoPeso("");
      await loadData();
      Alert.alert("Registrado", "Peso actualizado.");
    } catch (e: any) {
      Alert.alert("Error", e.message);
    } finally {
      setIsSaving(false);
    }
  };

  // ---------------------------------------------------------
  // 3. RENDERIZADO
  // ---------------------------------------------------------
  if (isLoading)
    return (
      <SafeAreaView style={[styles.safeArea, styles.center]}>
        <ActivityIndicator size="large" color={COLORS.accent} />
      </SafeAreaView>
    );

  // Configuración de la Gráfica de Peso
  const recentPesos = pesos.slice(-6); // Últimos 6 registros
  const chartData = {
    labels: recentPesos.map((p) =>
      new Date(p.fecha).toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "2-digit",
      })
    ),
    datasets: [
      { data: recentPesos.length > 0 ? recentPesos.map((p) => p.peso) : [0] },
    ],
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0} // Ajuste opcional para tab bar en iOS
      >
        <ScrollView
          contentContainerStyle={styles.container}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.headerTitle}>Hub de Salud</Text>

          {/* === SECCIÓN 1: CALORÍAS === */}
          <Text style={styles.sectionTitle}>Calorías Diarias</Text>
          {parametros ? (
            <>
              <CalorieWidget
                consumed={registroKcalHoy?.kcal_consumidas || 0}
                target={parametros.kcal_mantenimiento}
              />
              {/* Input Rápido de Calorías */}
              <View style={styles.inlineInputContainer}>
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  placeholder="+ Kcal (ej. 350)"
                  placeholderTextColor={COLORS.secondaryText}
                  keyboardType="numeric"
                  value={nuevoConsumo}
                  onChangeText={setNuevoConsumo}
                />
                <TouchableOpacity
                  style={styles.addButton}
                  onPress={handleLogCalories}
                  disabled={isSaving || !nuevoConsumo}
                >
                  {isSaving ? (
                    <ActivityIndicator color="#FFF" />
                  ) : (
                    <MaterialCommunityIcons
                      name="plus"
                      size={24}
                      color="#FFF"
                    />
                  )}
                </TouchableOpacity>
              </View>
              <TouchableOpacity
                onPress={() => router.push("/(tabs)/nutrition/calculator")}
              >
                <Text style={styles.linkText}>
                  Recalcular Meta ({parametros.kcal_mantenimiento} kcal)
                </Text>
              </TouchableOpacity>
            </>
          ) : (
            <PrimaryButton
              title="Configurar Meta de Calorías"
              onPress={() => router.push("/(tabs)/nutrition/calculator")}
            />
          )}

          <View style={styles.divider} />

          {/* === SECCIÓN 2: PESO CORPORAL === */}
          <Text style={styles.sectionTitle}>Progreso de Peso</Text>

          {/* Gráfica */}
          {pesos.length > 0 ? (
            <LineChart
              data={chartData}
              width={screenWidth - 40}
              height={200}
              chartConfig={{
                backgroundGradientFrom: COLORS.inputBackground,
                backgroundGradientTo: COLORS.inputBackground,
                decimalPlaces: 1,
                color: (opacity = 1) => COLORS.accent,
                labelColor: (opacity = 1) => COLORS.secondaryText,
                propsForDots: {
                  r: "4",
                  strokeWidth: "2",
                  stroke: COLORS.primaryText,
                },
              }}
              bezier
              style={styles.chart}
            />
          ) : (
            <Text style={styles.placeholderText}>
              Registra tu peso para ver tu progreso.
            </Text>
          )}

          {/* Input de Peso */}
          <View style={styles.inlineInputContainer}>
            <Text style={[styles.unitText, { marginRight: 10 }]}>
              Peso Hoy:
            </Text>
            <TextInput
              style={[styles.input, { width: 100, textAlign: "center" }]}
              placeholder="kg"
              placeholderTextColor={COLORS.secondaryText}
              keyboardType="numeric"
              value={nuevoPeso}
              onChangeText={setNuevoPeso}
            />
            <TouchableOpacity
              style={[styles.addButton, { marginLeft: 10 }]}
              onPress={handleLogWeight}
              disabled={isSaving || !nuevoPeso}
            >
              {isSaving ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <MaterialCommunityIcons name="check" size={24} color="#FFF" />
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  container: { padding: 20 },
  center: { justifyContent: "center", alignItems: "center" },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: COLORS.primaryText,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.primaryText,
    marginBottom: 15,
    marginTop: 10,
  },

  // Inputs en línea
  inlineInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 15,
  },
  input: {
    backgroundColor: COLORS.inputBackground,
    color: COLORS.primaryText,
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: COLORS.separator,
  },
  addButton: {
    backgroundColor: COLORS.accent,
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 15,
  },

  // Extras
  linkText: {
    color: COLORS.secondaryText,
    marginTop: 15,
    textAlign: "center",
    textDecorationLine: "underline",
  },
  divider: { height: 1, backgroundColor: COLORS.separator, marginVertical: 30 },
  chart: { borderRadius: 16, marginVertical: 15 },
  placeholderText: {
    color: COLORS.secondaryText,
    fontStyle: "italic",
    textAlign: "center",
    marginVertical: 30,
  },
  unitText: { color: COLORS.primaryText, fontSize: 16, fontWeight: "bold" },
});

export default NutritionHubScreen;
