import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS } from "../../../constants/theme";
import PrimaryButton from "../../../components/Buttons/PrimaryButton";
import CalorieWidget from "../../../components/Dashboard/CalorieWidget";
import { useCalorieLogger } from "../../../hooks/tabs/nutrition/useCalorieLogger"; // <-- NUEVO HOOK
import Sparkline from "../../../components/Dashboard/Sparkline";
import { useNutritionTrend } from "../../../hooks/tabs/useNutritionTrend";
import { useWeightHistory } from "../../../hooks/tabs/useWeightHistory";
import { useWeightLogger } from "../../../hooks/tabs/useWeightLogger";

const CalorieLoggerScreen: React.FC = () => {
  // Consumimos el hook
  const { state, setNuevoConsumo, handleLogCalories, router } =
    useCalorieLogger();
  const { isLoading, isSaving, parametros, registroHoy, nuevoConsumo } = state;

  // Hook de tendencia (llamamos siempre, antes de returns tempranos)
  const { data: trendData, isLoading: trendLoading } = useNutritionTrend(14);
  const sparkValues = (trendData || []).map((p) => p.value);
  const trendLabels = (trendData || []).map((p) => {
    // format YYYY-MM-DD -> DD/MM or MM-DD for compact axis
    try {
      const d = p.fecha;
      const parts = String(d).split("-");
      return parts.length >= 3 ? `${parts[2]}/${parts[1]}` : d;
    } catch {
      return String(p.fecha || "");
    }
  });
  // Peso historico
  const { data: weightData, isLoading: weightLoading } = useWeightHistory(30);
  const weightValues = (weightData || []).map((p) => p.peso);
  const weightLabels = (weightData || []).map((p) => {
    const d = p.fecha;
    const parts = String(d).split("-");
    return parts.length >= 3 ? `${parts[2]}/${parts[1]}` : d;
  });
  // Weight logger (inline)
  const { addWeight, isSaving: isSavingWeight } = useWeightLogger();
  const [pesoInput, setPesoInput] = useState("");

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.safeArea, styles.center]}>
        <ActivityIndicator size="large" color={COLORS.accent} />
      </SafeAreaView>
    );
  }

  // Si faltan parámetros, forzamos al usuario a la calculadora
  if (!parametros) {
    return (
      <SafeAreaView style={[styles.safeArea, styles.container]}>
        <Text style={styles.headerTitle}>Configuración de Nutrición</Text>
        <Text style={styles.subHeader}>
          Calcula tu meta calórica antes de registrar.
        </Text>
        <PrimaryButton
          title="Ir a Calculadora"
          onPress={() => router.push("/(tabs)/nutrition/calculator")}
          style={{ marginTop: 30 }}
        />
      </SafeAreaView>
    );
  }

  const consumed = registroHoy?.kcal_consumidas || 0;
  const target = parametros.kcal_mantenimiento;

  // (hook ya declarado arriba)

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.headerTitle}>Registro Nutricional</Text>

        <CalorieWidget consumed={consumed} target={target} />

        <Text style={[styles.historyTitle, { marginTop: 20 }]}>
          Trend (Fat / kcal)
        </Text>
        {trendLoading ? (
          <ActivityIndicator size="small" color={COLORS.accent} />
        ) : sparkValues.length > 0 ? (
          <View style={{ marginTop: 10 }}>
            <Sparkline
              data={sparkValues}
              labels={trendLabels}
              width={300}
              height={80}
              stroke="#FF6B6B"
            />
          </View>
        ) : (
          <Text style={{ color: COLORS.secondaryText, marginTop: 8 }}>
            No hay datos suficientes para mostrar la tendencia.
          </Text>
        )}

        <View style={styles.logContainer}>
          <Text style={styles.logTitle}>Añadir Consumo de Hoy</Text>
          <TextInput
            style={styles.input}
            placeholder="Ej: 350 (kcal)"
            placeholderTextColor={COLORS.secondaryText}
            keyboardType="numeric"
            value={nuevoConsumo}
            onChangeText={setNuevoConsumo}
          />
          <PrimaryButton
            title="Añadir Comida"
            onPress={handleLogCalories}
            isLoading={isSaving}
            disabled={!nuevoConsumo}
            style={{ marginTop: 20 }}
          />
        </View>
        <Text style={[styles.historyTitle, { marginTop: 20 }]}>
          Peso Histórico
        </Text>
        {weightLoading ? (
          <ActivityIndicator size="small" color={COLORS.accent} />
        ) : (
          <View style={{ marginTop: 10 }}>
            {/* inline weight form */}
            <View style={{ marginBottom: 12 }}>
              <Text
                style={{
                  color: COLORS.primaryText,
                  fontWeight: "600",
                  marginBottom: 6,
                }}
              >
                Registrar Peso
              </Text>
              <TextInput
                style={styles.input}
                placeholder="Ej: 79.5 (kg)"
                placeholderTextColor={COLORS.secondaryText}
                keyboardType="numeric"
                value={pesoInput}
                onChangeText={setPesoInput}
              />
              <PrimaryButton
                title="Guardar Peso"
                onPress={async () => {
                  const val = parseFloat(pesoInput.replace(",", "."));
                  if (isNaN(val) || val <= 0) return;
                  await addWeight(val);
                }}
                isLoading={isSavingWeight}
                disabled={!pesoInput}
                style={{ marginTop: 10 }}
              />
            </View>

            {weightValues.length > 0 ? (
              <Sparkline
                data={weightValues}
                labels={weightLabels}
                height={140}
                stroke="#4CC9F0"
              />
            ) : (
              <Text style={{ color: COLORS.secondaryText, marginTop: 8 }}>
                Aún no hay registros de peso. Puedes añadir tu peso arriba.
              </Text>
            )}
          </View>
        )}

        <Text style={styles.historyTitle}>
          Meta: {parametros.objetivo_calorico} ({target} kcal)
        </Text>
        <TouchableOpacity
          onPress={() => router.push("/(tabs)/nutrition/calculator")}
        >
          <Text style={styles.linkText}>Recalcular Parámetros</Text>
        </TouchableOpacity>
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
    color: COLORS.primaryText,
    marginBottom: 10,
  },
  subHeader: { color: COLORS.secondaryText, fontSize: 16, marginBottom: 20 },
  logContainer: {
    backgroundColor: COLORS.inputBackground,
    padding: 20,
    borderRadius: 16,
    marginTop: 20,
  },
  logTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.primaryText,
    marginBottom: 10,
  },
  input: {
    backgroundColor: COLORS.background,
    color: COLORS.primaryText,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: COLORS.separator,
  },
  historyTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.primaryText,
    marginTop: 30,
  },
  linkText: {
    color: COLORS.accent,
    marginTop: 5,
    fontSize: 14,
    textDecorationLine: "underline",
  },
  center: { justifyContent: "center", alignItems: "center" },
});

export default CalorieLoggerScreen;
