import React, { useState, useEffect } from "react";
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
import { useLocalSearchParams, useRouter } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { COLORS } from "../../constants/theme";
import AsyncStorage from "@react-native-async-storage/async-storage";
// Importamos el nuevo componente interactivo
import ExerciseLogger from "../../components/ExerciseLogger";

// --- TIPOS DE DATOS (Basado en el JSON que SÍ funciona) ---
interface EjercicioPrescrito {
  nombre: string;
  series: string;
  repeticiones: string;
  carga_notacion: string;
  nota?: string;
  descanso?: string;
}

interface GrupoMuscular {
  grupo_muscular: string;
  ejercicios: EjercicioPrescrito[];
}

interface DiaEntrenamiento {
  dia: number;
  dia_entrenamiento: string; // La clave real (e.g., "Día 1 - Upper")
  grupos: GrupoMuscular[];
}

interface RutinaGenerada {
  rutina_periodizada:
    | {
        semanas: {
          numero: number;
          dias: DiaEntrenamiento[];
        }[];
      }
    | DiaEntrenamiento[];
}
// --- FIN DE TIPOS ---

const WorkoutLogScreen: React.FC = () => {
  const router = useRouter();
  const { day } = useLocalSearchParams(); // Contiene el 'dia_entrenamiento'

  const [diaActualData, setDiaActualData] = useState<DiaEntrenamiento | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(true);

  // Lógica del Timer (sin cambios)
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isActive) {
      interval = setInterval(
        () => setSeconds((prevSeconds) => prevSeconds + 1),
        1000
      ) as unknown as NodeJS.Timeout;
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, seconds]);

  // Lógica de carga de Datos (Usando la estructura de JSON que SÍ funciona)
  useEffect(() => {
    const loadWorkoutData = async () => {
      setIsLoading(true);
      const jsonString = await AsyncStorage.getItem("@FitAI_UserRoutine");

      try {
        if (jsonString && day && typeof day === "string") {
          const rutina = JSON.parse(jsonString);

          let targetDay: DiaEntrenamiento | undefined;

          // 1. Intentamos leer la estructura de ARRAY (la que te funcionó)
          if (Array.isArray(rutina.rutina_periodizada)) {
            const semana = rutina.rutina_periodizada[0]; // Semana 1
            if (semana && semana.dias) {
              targetDay = semana.dias.find(
                (d: any) => d.dia_entrenamiento === day
              );
            }
          }
          // 2. (Opcional) Si la IA cambia a la estructura de OBJETO, también funciona
          else if (
            rutina.rutina_periodizada &&
            rutina.rutina_periodizada.semanas
          ) {
            const semana = rutina.rutina_periodizada.semanas[0];
            targetDay = semana.dias.find(
              (d: any) => d.dia_entrenamiento === day
            );
          }

          if (targetDay) {
            setDiaActualData(targetDay);
          } else {
            Alert.alert(
              "Error",
              `No se encontró el día '${day}' en la rutina guardada.`
            );
          }
        }
      } catch (e) {
        console.error("Error al parsear la rutina en WorkoutLog:", e);
        Alert.alert("Error Crítico", "La rutina guardada está corrupta.");
      }

      setIsLoading(false);
    };

    loadWorkoutData();
  }, [day]);

  // --- Funciones de Header ---
  const formatTime = (totalSeconds: number) => {
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return [m, s].map((val) => String(val).padStart(2, "0")).join(":");
  };

  const handleFinish = () => {
    setIsActive(false);
    // TODO: Recopilar el estado del registro (workoutLog) y enviarlo al servidor
    Alert.alert(
      "Finalizar Rutina",
      `Entrenamiento completado en ${formatTime(seconds)}. ¿Deseas guardar?`,
      [
        { text: "Cancelar", style: "cancel", onPress: () => setIsActive(true) },
        { text: "Guardar y Salir", onPress: () => router.back() },
      ]
    );
  };

  // --- Renderizado ---
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

  if (!diaActualData) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loaderContainer}>
          <Text style={styles.noteText}>
            Error: No se pudieron cargar los datos del día.
          </Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={{ color: COLORS.accent, marginTop: 20 }}>Volver</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const totalSets = diaActualData.grupos.reduce(
    (acc, g) =>
      acc +
      g.ejercicios.reduce((eAcc, e) => eAcc + (parseInt(e.series, 10) || 0), 0),
    0
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header de Log (Simulando el diseño de la imagen) */}
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
        <Text style={styles.headerTitle}>
          {diaActualData.dia_entrenamiento}
        </Text>
        <View style={styles.timerGroup}>
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

      {/* Contenido de la Rutina (Mapeo por Grupos) */}
      <ScrollView contentContainerStyle={styles.contentContainer}>
        {diaActualData.grupos.map((grupo, gIndex) => (
          <View key={`group-${gIndex}`}>
            {grupo.ejercicios.map((ejercicio, eIndex) => (
              // Usamos el ExerciseLogger para cada ejercicio
              <ExerciseLogger
                key={`ex-${eIndex}`}
                ejercicio={ejercicio}
                exerciseIndex={eIndex}
                grupoMuscular={grupo.grupo_muscular}
              />
            ))}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

// --- ESTILOS ---
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.separator,
  },
  headerButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.primaryText,
  },
  timerGroup: {
    flexDirection: "row",
    alignItems: "center",
  },
  timerText: {
    fontSize: 16,
    color: COLORS.primaryText,
    marginRight: 10,
  },
  finishButton: {
    backgroundColor: COLORS.accent,
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 10,
  },
  finishButtonText: {
    color: COLORS.primaryText,
    fontWeight: "bold",
  },
  summaryBar: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 8,
    backgroundColor: COLORS.inputBackground,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.separator,
  },
  summaryText: {
    color: COLORS.secondaryText,
    fontSize: 12,
  },
  contentContainer: {
    padding: 15,
  },
  noteText: {
    color: COLORS.secondaryText,
    fontSize: 12,
    marginBottom: 15,
    fontStyle: "italic",
  },
});

export default WorkoutLogScreen;
