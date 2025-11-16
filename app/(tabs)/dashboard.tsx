import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { COLORS } from "../../constants/theme";
import { useAuth } from "../../hooks/auth/useAuth";

import PlanCard from "../../components/Dashboard/PlanCard";
import CalorieWidget from "../../components/Dashboard/CalorieWidget";
import GradientCircleProgress from "../../components/Dashboard/GradientCircleProgress";
import { useDashboardData } from "../../hooks/tabs/useDashboardData"; // <-- NUEVO HOOK

const DashboardScreen: React.FC = () => {
  const router = useRouter();
  const { session } = useAuth();

  // --- ¡LÓGICA DE DATOS REFACTORIZADA! ---
  const { rutina, isLoading, progress, parametros, registroHoy } =
    useDashboardData();
  // ---

  // --- Lógica de UI (Cálculos) ---
  const targetKcal = parametros?.kcal_mantenimiento || 0;
  const consumedKcal = registroHoy?.kcal_consumidas || 0;

  const workoutDone =
    progress?.lastCompleted &&
    new Date(progress.lastCompleted).toISOString().split("T")[0] ===
      new Date().toISOString().split("T")[0]
      ? 1
      : 0;

  const nutritionProgress =
    targetKcal > 0 ? Math.min(consumedKcal / targetKcal, 1) : 0;
  const dailyTotalProgress = workoutDone * 0.5 + nutritionProgress * 0.5;

  const userName =
    session?.user?.user_metadata?.full_name ||
    session?.user?.email?.split("@")[0] ||
    "Atleta";

  // --- Lógica de Renderizado ---
  if (isLoading) {
    return (
      <SafeAreaView style={[styles.safeArea, styles.center]}>
        <ActivityIndicator size="large" color={COLORS.accent} />
      </SafeAreaView>
    );
  }

  // Redirigir si faltan parámetros de nutrición (para obligar al cálculo)
  if (!parametros && !isLoading) {
    Alert.alert(
      "Configuración Necesaria",
      "Calcula tus calorías antes de usar el Dashboard completo.",
      [
        {
          text: "Ir a Calculadora",
          onPress: () => router.replace("/(tabs)/nutrition/calculator"),
        },
      ]
    );
    return (
      <SafeAreaView style={[styles.safeArea, styles.center]}>
        <ActivityIndicator size="large" color={COLORS.accent} />
      </SafeAreaView>
    );
  }

  // --- Lógica de UI (Datos de Rutina) ---
  let currentDayWorkout = "Descanso / Sin Rutina";
  let isTodayFinished = workoutDone === 1;

  if (rutina && progress && Array.isArray(rutina.rutina_periodizada)) {
    const semanas = rutina.rutina_periodizada;
    const currentWeek = semanas[progress.weekIndex];
    if (currentWeek?.dias && currentWeek.dias[progress.dayIndex]) {
      const dayData = currentWeek.dias[progress.dayIndex];
      currentDayWorkout = dayData.dia_entrenamiento;
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* HEADER */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Good Morning,</Text>
            <Text style={styles.userName}>{userName}!</Text>
          </View>
          <GradientCircleProgress
            size={60}
            progress={dailyTotalProgress}
            textContent={`${Math.round(dailyTotalProgress * 100)}%`}
            textStyle={styles.progressText}
          />
        </View>

        {/* TODAY'S PLAN */}
        <Text style={styles.sectionTitle}>Today{"'"}s Plan</Text>
        <PlanCard
          type="workout"
          title="Workout"
          subtitle={currentDayWorkout}
          isCompleted={isTodayFinished}
          onPress={() => {
            if (
              !isTodayFinished &&
              currentDayWorkout !== "Descanso / Sin Rutina"
            ) {
              router.push(
                `/workout?day=${encodeURIComponent(currentDayWorkout)}` as any
              );
            } else {
              Alert.alert(
                "¡Hecho por hoy!",
                "Ya completaste tu entrenamiento. Vuelve mañana."
              );
            }
          }}
        />
        <PlanCard
          type="nutrition"
          title="Nutrition"
          subtitle={`Goal: ${parametros?.objetivo_calorico || "Calcular Meta"}`}
          onPress={() => router.push("/(tabs)/nutrition")}
        />

        {/* DAILY TARGETS */}
        <Text style={[styles.sectionTitle, { marginTop: 20 }]}>
          Daily Targets
        </Text>
        <CalorieWidget consumed={consumedKcal} target={targetKcal} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  center: { justifyContent: "center", alignItems: "center" },
  container: { padding: 20 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 30,
    marginTop: 10,
  },
  greeting: { color: COLORS.secondaryText, fontSize: 16, marginBottom: 5 },
  userName: { color: COLORS.primaryText, fontSize: 28, fontWeight: "bold" },
  sectionTitle: {
    color: COLORS.primaryText,
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
  },
  progressText: {
    // Estilo que faltaba en el código original
    fontSize: 14,
    fontWeight: "bold",
    color: COLORS.primaryText,
  },
});

export default DashboardScreen;
