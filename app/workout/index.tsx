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
import COLORS from "../../constants/theme";
import AsyncStorage from "@react-native-async-storage/async-storage";

// --- Definición de Tipos (Basado en el JSON de la IA) ---
interface Ejercicio {
  nombre: string;
  series: string;
  repeticiones: string;
  carga_notacion: string;
  nota: string;
}

interface GrupoMuscular {
  grupo_muscular: string;
  ejercicios: Ejercicio[];
}

interface DiaEntrenamiento {
  dia_entrenamiento: string;
  grupos: GrupoMuscular[];
}

const SetRow = ({
  setNumber,
  carga,
  reps,
}: {
  setNumber: number;
  carga: string;
  reps: string;
}) => {
  return (
    <View style={setStyles.row}>
      <Text style={setStyles.setNumber}>{setNumber}</Text>

      {/* Columna PREVIOUS (del historial) - Vacía por ahora */}
      <View style={setStyles.colPrevious}>
        <Text style={setStyles.previousText}>—</Text>
      </View>

      {/* Columna KG (Prescripción de la IA) */}
      <View style={[setStyles.col, { flex: 0.9 }]}>
        <Text style={setStyles.inputPlaceholder}>{carga}</Text>
      </View>

      {/* Columna REPS (Prescripción de la IA) */}
      <View style={[setStyles.col, { flex: 0.7 }]}>
        <Text style={setStyles.inputPlaceholder}>{reps}</Text>
      </View>

      {/* Columna Check */}
      <TouchableOpacity style={setStyles.colCheck}>
        <MaterialCommunityIcons
          name="check-circle-outline"
          size={24}
          color={COLORS.secondaryText}
        />
      </TouchableOpacity>
    </View>
  );
};

const WorkoutLogScreen: React.FC = () => {
  const router = useRouter();
  const { day } = useLocalSearchParams(); // Obtiene el nombre del día de la URL

  const [diaActualData, setDiaActualData] = useState<DiaEntrenamiento | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);

  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    const loadWorkoutData = async () => {
      setIsLoading(true);
      const jsonString = await AsyncStorage.getItem("@FitAI_UserRoutine");

      if (jsonString) {
        const rutina = JSON.parse(jsonString);

        // Buscamos el día que coincida con el parámetro de la URL
        // Asumimos que la IA genera al menos una semana
        const semana = rutina.rutina_periodizada[0];
        const diaData = semana.dias.find(
          (d: DiaEntrenamiento) => d.dia_entrenamiento === day
        );

        if (diaData) {
          setDiaActualData(diaData);
        } else {
          Alert.alert("Error", "No se encontró el día de entrenamiento.");
        }
      }
      setIsLoading(false);
    };

    loadWorkoutData();
  }, [day]); // Se ejecuta cada vez que el parámetro 'day' cambie

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isActive) {
      interval = setInterval(() => {
        setSeconds((prevSeconds) => prevSeconds + 1);
      }, 1000) as unknown as NodeJS.Timeout;
    } else if (!isActive && seconds !== 0) {
      if (interval) clearInterval(interval);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, seconds]);

  const formatTime = (totalSeconds: number) => {
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return [m, s].map((val) => String(val).padStart(2, "0")).join(":");
  };

  const handleFinish = () => {
    setIsActive(false);
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
        <Text style={styles.headerTitle}>Log Workout</Text>

        <View style={styles.timerGroup}>
          <Text style={styles.timerText}>{formatTime(seconds)}</Text>
          <TouchableOpacity onPress={handleFinish} style={styles.finishButton}>
            <Text style={styles.finishButtonText}>Finish</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.summaryBar}>
        <Text style={styles.summaryText}>Duration: {formatTime(seconds)}</Text>
        <Text style={styles.summaryText}>
          Sets:{" "}
          {diaActualData.grupos.reduce(
            (acc, g) =>
              acc +
              g.ejercicios.reduce(
                (eAcc, e) => eAcc + parseInt(e.series, 10),
                0
              ),
            0
          )}
        </Text>
        <Text style={styles.summaryText}>Volume: 0 kg</Text>
      </View>

      {/* Contenido de la Rutina (Mapeo Real) */}
      <ScrollView contentContainerStyle={styles.contentContainer}>
        {diaActualData.grupos.map((grupo, gIndex) => (
          <View key={`group-${gIndex}`}>
            {grupo.ejercicios.map((ejercicio, eIndex) => (
              <View key={`ex-${eIndex}`} style={styles.exerciseBlock}>
                <Text style={styles.exerciseTitle}>{ejercicio.nombre}</Text>
                <Text style={styles.noteText}>
                  {ejercicio.nota || "Añadir notas aquí..."}
                </Text>

                {/* Fila de Encabezados */}
                <View style={setStyles.headerRow}>
                  <Text style={setStyles.headerText}>SET</Text>
                  <Text style={setStyles.headerText}>PREVIOUS</Text>
                  <Text style={setStyles.headerText}>CARGA (IA)</Text>
                  <Text style={setStyles.headerText}>REPS (IA)</Text>
                  <View style={{ width: 30 }} />
                </View>

                {/* Filas de Series (Generadas dinámicamente) */}
                {Array.from({ length: parseInt(ejercicio.series, 10) }).map(
                  (_, setIndex) => (
                    <SetRow
                      key={setIndex}
                      setNumber={setIndex + 1}
                      carga={ejercicio.carga_notacion}
                      reps={ejercicio.repeticiones}
                    />
                  )
                )}

                <TouchableOpacity style={styles.addSetButton}>
                  <MaterialCommunityIcons
                    name="plus"
                    size={16}
                    color={COLORS.accent}
                  />
                  <Text style={styles.addSetText}>Add Set</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

// Estilos específicos para las filas de series
const setStyles = StyleSheet.create({
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.separator,
    marginBottom: 5,
  },
  headerText: {
    color: COLORS.secondaryText,
    fontSize: 12,
    fontWeight: "bold",
    textAlign: "center",
    flex: 1,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.separator,
  },
  setNumber: {
    color: COLORS.primaryText,
    fontWeight: "bold",
    fontSize: 16,
    flex: 0.3,
    textAlign: "center",
  },
  colPrevious: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 5,
  },
  previousText: {
    color: COLORS.secondaryText,
    fontSize: 14,
  },
  col: {
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    paddingHorizontal: 5,
  },
  inputPlaceholder: {
    color: COLORS.primaryText,
    fontSize: 16,
    paddingHorizontal: 5,
    borderRadius: 5,
    minWidth: 40,
    textAlign: "center",
    fontWeight: "500",
  },
  unit: {
    color: COLORS.secondaryText,
    fontSize: 10,
    marginLeft: 2,
  },
  colCheck: {
    flex: 0.3,
    alignItems: "center",
  },
});

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
    color: COLORS.primaryText, // Cambiado a primario para mejor visibilidad
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
  exerciseBlock: {
    backgroundColor: COLORS.inputBackground,
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: COLORS.separator,
  },
  exerciseTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: COLORS.primaryText,
    marginBottom: 5,
  },
  noteText: {
    color: COLORS.secondaryText,
    fontSize: 12,
    marginBottom: 15,
    fontStyle: "italic",
  },
  addSetButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 15,
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.separator,
  },
  addSetText: {
    color: COLORS.accent,
    fontSize: 16,
    marginLeft: 5,
    fontWeight: "bold",
  },
});

export default WorkoutLogScreen;
