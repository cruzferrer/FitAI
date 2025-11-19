import React from "react";
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
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { COLORS } from "../../constants/theme";

// Componentes modulares
import ExerciseLogger from "../../components/Exercise/ExerciseLogger";
// Hooks de lógica
import { useWorkoutData } from "@/hooks/workout/useWorkoutData";
import { useWorkoutTimer } from "@/hooks/workout/useWorkoutTimer";
import { useWorkoutLogger } from "@/hooks/workout/useWorkoutLogger";

const WorkoutLogScreen: React.FC = () => {
  const router = useRouter();

  // --- 1. LÓGICA DE DATOS CONSUMIDA DESDE EL HOOK ---
  const {
    day,
    isLoading,
    diaActualData,
    workoutLog,
    handleUpdateSet,
    handleUpdateNotes,
  } = useWorkoutData();

  const { saveWorkoutLog, advanceProgress } = useWorkoutLogger();

  // --- 2. LÓGICA DE TIMER CONSUMIDA DESDE EL HOOK ---
  const { seconds, setIsActive, formatTime } = useWorkoutTimer();

  // --- 3. LÓGICA DE UI (MANEJADORES) ---
  const handleFinish = () => {
    setIsActive(false);

    Alert.alert(
      "Finalizar Rutina",
      `Entrenamiento completado en ${formatTime(seconds)}. ¿Deseas guardar?`,
      [
        { text: "Cancelar", style: "cancel", onPress: () => setIsActive(true) },
        {
          text: "Guardar y Salir",
          onPress: async () => {
            const saved = await saveWorkoutLog(Math.round(seconds / 60)); // Guarda el log
            if (saved) {
              // Avanzamos el progreso local y luego volvemos
              try {
                await advanceProgress();
              } catch (e) {
                console.warn("No se pudo avanzar progreso:", e);
              }
              router.back();
            }
          },
        },
      ]
    );
  };

  // --- 4. RENDERIZADO ---

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={COLORS.accent} />
          <Text style={styles.noteText}>Cargando entrenamiento...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!diaActualData || workoutLog.length === 0) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loaderContainer}>
          <Text style={styles.noteText}>
            error: No se pudieron cargar los ejercicios del día.
          </Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={{ color: COLORS.accent, marginTop: 20 }}>Volver</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const totalSets = workoutLog.reduce((acc, log) => acc + log.sets.length, 0);

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header y Timer */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.headerButton}
        >
          <MaterialCommunityIcons
            name="chevron-left"
            size={28}
            color={COLORS.primaryText}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{day}</Text>
        <View style={styles.timerGroup}>
          {/* (Regenerar moved to Dashboard) */}
          <Text style={styles.timerText}>{formatTime(seconds)}</Text>
          <TouchableOpacity onPress={handleFinish} style={styles.finishButton}>
            <Text style={styles.finishButtonText}>Finish</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.summaryBar}>
        <Text style={styles.summaryText}>Duration: {formatTime(seconds)}</Text>
        <Text style={styles.summaryText}>Sets: {totalSets}</Text>
        <Text style={styles.summaryText}>Volume: 0 kg</Text>
      </View>

      {/* Contenido de la Rutina (Mapeo de Ejercicio) */}
      <ScrollView contentContainerStyle={styles.contentContainer}>
        {workoutLog.map((log) => (
          <ExerciseLogger
            key={log.id}
            ejercicio={log.ejercicio}
            grupoMuscular={log.grupo}
            onLogUpdate={(exerciseName, sets, notes) => {
              // El estado se actualiza en el hook, pero pasamos los handlers
              handleUpdateSet(log.id, 0, sets[0]); // Esta parte necesita ajuste si onLogUpdate devuelve el set completo
              handleUpdateNotes(log.id, notes);
            }}
          />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

// --- ESTILOS ---
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  loaderContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.separator,
  },
  headerButton: { padding: 5 },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.primaryText,
    flex: 1,
    textAlign: "center",
  },
  timerGroup: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
  },
  timerText: { fontSize: 16, color: COLORS.primaryText, marginRight: 10 },
  finishButton: {
    backgroundColor: COLORS.accent,
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 10,
  },
  finishButtonText: { color: COLORS.primaryText, fontWeight: "bold" },
  summaryBar: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 8,
    backgroundColor: COLORS.inputBackground,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.separator,
  },
  summaryText: { color: COLORS.secondaryText, fontSize: 12 },
  contentContainer: { padding: 15 },
  noteText: {
    color: COLORS.secondaryText,
    fontSize: 12,
    marginTop: 10,
    fontStyle: "italic",
  },
});

export default WorkoutLogScreen;
