import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useFocusEffect } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { COLORS } from "../../constants/theme";
import { useAuth } from "../../hooks/useAuth";
import { supabase } from "../../constants/supabaseClient";

import PlanCard from "../../components/Dashboard/PlanCard";
import CalorieWidget from "@/components/Dashboard/CalorieWidget";
import GradientCircularProgress from "@/components/Dashboard/GradientCircularProgress";

interface WorkoutProgress {
  weekIndex: number;
  dayIndex: number;
  lastCompleted: string | null;
}

interface Parametros {
  kcal_mantenimiento: number;
  objetivo_calorico: string;
}

interface Registro {
  kcal_consumidas: number;
}

const DashboardScreen: React.FC = () => {
  const router = useRouter();
  const { session } = useAuth();
  const [rutina, setRutina] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState<WorkoutProgress | null>(null);
  const [parametros, setParametros] = useState<Parametros | null>(null);
  const [registroHoy, setRegistroHoy] = useState<Registro | null>(null);

  let targetKcal = parametros?.kcal_mantenimiento || 0;
  let consumedKcal = registroHoy?.kcal_consumidas || 0;

  const workoutDone =
    progress?.lastCompleted &&
    new Date(progress.lastCompleted).toISOString().split("T")[0] ===
      new Date().toISOString().split("T")[0]
      ? 1
      : 0;

  const nutritionProgress =
    targetKcal > 0 ? Math.min(consumedKcal / targetKcal, 1) : 0;

  const dailyTotalProgress = workoutDone * 0.5 + nutritionProgress * 0.5;

  useFocusEffect(
    useCallback(() => {
      const loadData = async () => {
        setIsLoading(true);
        const { data: userData } = await supabase.auth.getUser();
        const userId = userData.user?.id;

        try {
          // Cargar Rutina y Progreso desde AsyncStorage
          const routineString = await AsyncStorage.getItem(
            "@FitAI_UserRoutine"
          );
          if (routineString) setRutina(JSON.parse(routineString));

          const progressString = await AsyncStorage.getItem(
            "@FitAI_WorkoutProgress"
          );
          if (progressString) {
            setProgress(JSON.parse(progressString));
          } else {
            setProgress({ weekIndex: 0, dayIndex: 0, lastCompleted: null });
          }

          // Cargar Datos de Nutrición desde Supabase
          if (userId) {
            const { data: paramData } = await supabase
              .from("parametros_usuario")
              .select("kcal_mantenimiento, objetivo_calorico")
              .eq("user_id", userId)
              .maybeSingle();

            if (paramData) setParametros(paramData as Parametros);

            const today = new Date().toISOString().split("T")[0];
            const { data: regData } = await supabase
              .from("registro_calorias")
              .select("kcal_consumidas")
              .eq("user_id", userId)
              .eq("fecha", today)
              .maybeSingle();

            if (regData) setRegistroHoy(regData as Registro);
            else setRegistroHoy(null);
          }
        } catch (e) {
          console.error("Error cargando datos del dashboard:", e);
        } finally {
          setIsLoading(false);
        }
      };
      loadData();
    }, [])
  );

  const userName =
    session?.user?.user_metadata?.full_name ||
    session?.user?.email?.split("@")[0] ||
    "Atleta";

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

  // Verificación si el usuario no tiene parámetros
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

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.safeArea, styles.center]}>
        <ActivityIndicator size="large" color={COLORS.accent} />
      </SafeAreaView>
    );
  }

  targetKcal = parametros?.kcal_mantenimiento || 0;
  consumedKcal = registroHoy?.kcal_consumidas || 0;

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
          <GradientCircularProgress
            progress={Math.round(dailyTotalProgress * 100)}
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
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  center: {
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    padding: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 30,
    marginTop: 10,
  },
  greeting: {
    color: COLORS.secondaryText,
    fontSize: 16,
    marginBottom: 5,
  },
  userName: {
    color: COLORS.primaryText,
    fontSize: 28,
    fontWeight: "bold",
  },
  sectionTitle: {
    color: COLORS.primaryText,
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
  },
});

export default DashboardScreen;
