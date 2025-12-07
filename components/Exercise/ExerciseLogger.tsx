import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image,
  Pressable,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { COLORS } from "../../constants/theme";
import SetRow, { SetRecord } from "./SetRow"; // Importamos el SetRow
import { useRouter } from "expo-router";

// Tipos de datos que recibe este componente
interface EjercicioPrescrito {
  nombre: string;
  series: string;
  repeticiones: string;
  carga_notacion: string;
  nota?: string;
  descanso?: string;
  gif_url?: string;
}

interface ExerciseLoggerProps {
  ejercicio: EjercicioPrescrito;
  grupoMuscular: string;
  onLogUpdate: (exerciseName: string, sets: SetRecord[], notes: string) => void;
}

const ExerciseLogger: React.FC<ExerciseLoggerProps> = ({
  ejercicio,
  grupoMuscular,
  onLogUpdate,
}) => {
  const router = useRouter();
  const metricLabel: "RPE" | "RIR" = ejercicio.carga_notacion
    ?.toUpperCase()
    .includes("RPE")
    ? "RPE"
    : "RIR";

  // Inicializa el estado de las series con los datos prescritos por la IA
  const initialSets: SetRecord[] = Array.from({
    length: parseInt(ejercicio.series, 10) || 0,
  }).map(() => ({
    prescribed_carga: ejercicio.carga_notacion,
    prescribed_reps: ejercicio.repeticiones,
    actual_kg: "",
    actual_metric: "",
    actual_reps: "",
    completed: false,
  }));

  const [sets, setSets] = useState<SetRecord[]>(initialSets);
  const [userNotes, setUserNotes] = useState(ejercicio.nota || "");

  // Manejador para actualizar el estado de una serie específica
  const handleUpdateSet = (index: number, updatedSet: SetRecord) => {
    const newSets = [...sets];
    newSets[index] = updatedSet;
    setSets(newSets);
    onLogUpdate(ejercicio.nombre, newSets, userNotes); // Informa al padre del cambio
  };

  const handleUpdateNotes = (text: string) => {
    setUserNotes(text);
    onLogUpdate(ejercicio.nombre, sets, text); // Informa al padre
  };

  const addSet = () => {
    const newSet = {
      prescribed_carga: sets[0]?.prescribed_carga || "RPE 7",
      prescribed_reps: sets[0]?.prescribed_reps || "8-10",
      actual_kg: "",
      actual_metric: "",
      actual_reps: "",
      completed: false,
    };
    setSets((prev) => [...prev, newSet]);
    // Informar al padre que se añadió un set
    onLogUpdate(ejercicio.nombre, [...sets, newSet], userNotes);
  };

  const notePlaceholder =
    ejercicio.nota || ejercicio.descanso
      ? ejercicio.nota
        ? `${ejercicio.nota} (Descanso: ${ejercicio.descanso || "90s"})`
        : `Descanso: ${ejercicio.descanso}`
      : "Añadir notas aquí...";

  const openMetrics = () => {
    router.push("/(tabs)/metrics");
  };
  const gifValue = ejercicio.gif_url ?? (ejercicio as any).gifUrl;
  const gifSource = gifValue ? { uri: gifValue } : null;

  return (
    <View style={styles.exerciseBlock}>
      <Pressable style={styles.headerRowInfo} onPress={openMetrics}>
        {gifSource ? (
          <Image source={gifSource} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, styles.avatarPlaceholder]}>
            <MaterialCommunityIcons
              name="play-circle-outline"
              size={20}
              color={COLORS.secondaryText}
            />
          </View>
        )}
        <View style={{ flex: 1 }}>
          <Text style={styles.groupSubtitle}>
            {grupoMuscular.toUpperCase()}
          </Text>
          <Text style={styles.exerciseTitle}>{ejercicio.nombre}</Text>
        </View>
      </Pressable>

      {/* Caja de notas del usuario (Permite editar) */}
      <View style={styles.notesContainer}>
        <TextInput
          style={styles.notesInput}
          placeholder={notePlaceholder}
          placeholderTextColor={COLORS.secondaryText}
          multiline
          value={userNotes}
          onChangeText={handleUpdateNotes}
        />
      </View>

      {/* Fila de Encabezados */}
      <View style={styles.headerRow}>
        <Text style={styles.headerText}>SET</Text>
        <Text style={styles.headerText}>PRESC.</Text>
        <Text style={styles.headerText}>{metricLabel}</Text>
        <Text style={styles.headerText}>KG</Text>
        <Text style={styles.headerText}>REPS</Text>
        <View style={{ width: 30 }} />
      </View>

      {/* Filas de Series (Mapeo dinámico) */}
      {sets.map((set, setIndex) => (
        <SetRow
          key={setIndex}
          set={set}
          setIndex={setIndex}
          metricLabel={metricLabel}
          onUpdateSet={handleUpdateSet}
        />
      ))}

      {/* Botón Añadir Set */}
      <TouchableOpacity style={styles.addSetButton} onPress={addSet}>
        <MaterialCommunityIcons name="plus" size={16} color={COLORS.accent} />
        <Text style={styles.addSetText}>Add Set</Text>
      </TouchableOpacity>
    </View>
  );
};

// --- ESTILOS ---
const styles = StyleSheet.create({
  exerciseBlock: {
    backgroundColor: COLORS.inputBackground,
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: COLORS.separator,
  },
  groupSubtitle: {
    fontSize: 12,
    color: COLORS.accent,
    fontWeight: "bold",
    marginBottom: 5,
    textTransform: "uppercase",
  },
  exerciseTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: COLORS.primaryText,
    marginBottom: 2,
    textTransform: "capitalize",
  },
  headerRowInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 10,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.inputBackground,
    borderWidth: 1,
    borderColor: COLORS.separator,
  },
  avatarPlaceholder: {
    justifyContent: "center",
    alignItems: "center",
  },
  notesContainer: {
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.separator,
    paddingBottom: 10,
  },
  notesInput: {
    color: COLORS.primaryText,
    fontSize: 14,
    padding: 8,
    minHeight: 40,
    backgroundColor: COLORS.background,
    borderRadius: 5,
    textAlignVertical: "top",
    borderColor: COLORS.separator,
    borderWidth: 1,
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
});

export default ExerciseLogger;
