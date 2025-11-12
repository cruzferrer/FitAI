import React from "react";
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

const CalorieLoggerScreen: React.FC = () => {
  // Consumimos el hook
  const { state, setNuevoConsumo, handleLogCalories, router } =
    useCalorieLogger();
  const { isLoading, isSaving, parametros, registroHoy, nuevoConsumo } = state;

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

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.headerTitle}>Registro Nutricional</Text>

        <CalorieWidget consumed={consumed} target={target} />

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
