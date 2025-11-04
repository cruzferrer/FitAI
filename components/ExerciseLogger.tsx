import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { COLORS } from "../constants/theme"; // Asegúrate de que la ruta a 'theme' sea correcta

// --- TIPOS DE DATOS ---
// El ejercicio prescrito por la IA
interface EjercicioPrescrito {
  nombre: string;
  series: string;
  repeticiones: string;
  carga_notacion: string;
  nota?: string;
  descanso?: string;
}

// El estado de cada set que el usuario registra
interface SetRecord {
  prescribed_carga: string;
  prescribed_reps: string;
  actual_kg: string; // Input del usuario
  actual_reps: string; // Input del usuario
  completed: boolean; // Estado del checkbox
}

interface ExerciseLoggerProps {
  ejercicio: EjercicioPrescrito;
  grupoMuscular: string;
}

// --- SUB-COMPONENTE: FILA DE SERIE (AHORA INTERACTIVA) ---
const SetRow: React.FC<{
  set: SetRecord;
  setIndex: number;
  onUpdateSet: (
    index: number,
    key: keyof SetRecord,
    value: string | boolean
  ) => void;
}> = ({ set, setIndex, onUpdateSet }) => {
  const isCompleted = set.completed;

  const handleChange = (key: "actual_kg" | "actual_reps", value: string) => {
    onUpdateSet(setIndex, key, value);
  };

  const handleToggleComplete = () => {
    const newCompletedState = !isCompleted;
    // Autocompletar con los valores prescritos si los inputs están vacíos al marcar
    let newKg = set.actual_kg;
    let newReps = set.actual_reps;

    if (newCompletedState && !newKg) {
      newKg = set.prescribed_carga;
    }
    if (newCompletedState && !newReps) {
      // Extrae solo el primer número de las repeticiones (ej. "8-10" -> "8")
      newReps = set.prescribed_reps.split(/[^0-9]/)[0] || set.prescribed_reps;
    }

    onUpdateSet(setIndex, "completed", newCompletedState);
    onUpdateSet(setIndex, "actual_kg", newKg);
    onUpdateSet(setIndex, "actual_reps", newReps);
  };

  return (
    <View style={[setStyles.row, isCompleted && setStyles.rowCompleted]}>
      <Text style={setStyles.setNumber}>{setIndex + 1}</Text>

      {/* Columna PRESCRIBED (Referencia de la IA) */}
      <View style={setStyles.colPrevious}>
        <Text style={setStyles.previousText}>
          {set.prescribed_carga} x {set.prescribed_reps}
        </Text>
      </View>

      {/* Columna KG (Input del Usuario) */}
      <View style={[setStyles.col, { flex: 0.9 }]}>
        <TextInput
          style={[setStyles.input, isCompleted && setStyles.inputCompleted]}
          keyboardType="numeric"
          placeholder={set.prescribed_carga.includes("RPE") ? "RPE" : "Kg"}
          placeholderTextColor={COLORS.secondaryText}
          value={set.actual_kg}
          onChangeText={(value) => handleChange("actual_kg", value)}
          editable={!isCompleted}
        />
      </View>

      {/* Columna REPS (Input del Usuario) */}
      <View style={[setStyles.col, { flex: 0.7 }]}>
        <TextInput
          style={[setStyles.input, isCompleted && setStyles.inputCompleted]}
          keyboardType="numeric"
          placeholder={set.prescribed_reps.split(/[^0-9]/)[0]} // Muestra solo el primer número como pista
          placeholderTextColor={COLORS.secondaryText}
          value={set.actual_reps}
          onChangeText={(value) => handleChange("actual_reps", value)}
          editable={!isCompleted}
        />
      </View>

      {/* Columna Check */}
      <TouchableOpacity
        style={setStyles.colCheck}
        onPress={handleToggleComplete}
      >
        <MaterialCommunityIcons
          name={isCompleted ? "check-circle" : "check-circle-outline"}
          size={24}
          color={isCompleted ? COLORS.accent : COLORS.separator}
        />
      </TouchableOpacity>
    </View>
  );
};
// --- FIN DE SUB-COMPONENTE ---

// --- COMPONENTE PRINCIPAL DEL LOGGER ---
const ExerciseLogger: React.FC<ExerciseLoggerProps> = ({
  ejercicio,
  grupoMuscular,
}) => {
  // Inicializa el estado de las series con los datos prescritos por la IA
  const initialSets: SetRecord[] = Array.from({
    length: parseInt(ejercicio.series, 10) || 0,
  }).map(() => ({
    prescribed_carga: ejercicio.carga_notacion,
    prescribed_reps: ejercicio.repeticiones,
    actual_kg: "",
    actual_reps: "",
    completed: false,
  }));

  const [sets, setSets] = useState<SetRecord[]>(initialSets);
  const [userNotes, setUserNotes] = useState(ejercicio.nota || ""); // Estado para notas del usuario

  // Manejador para actualizar el estado de una serie específica
  const handleUpdateSet = (
    index: number,
    key: keyof SetRecord,
    value: string | boolean
  ) => {
    setSets((prevSets) => {
      const newSets = [...prevSets];
      newSets[index] = {
        ...newSets[index],
        [key]: value,
      };
      // Si el usuario edita el peso/reps, desmarca el 'completed'
      if (key !== "completed" && newSets[index].completed) {
        newSets[index].completed = false;
      }
      return newSets;
    });
  };

  const addSet = () => {
    setSets((prev) => [
      ...prev,
      // Añade un set vacío (o copia el último)
      {
        prescribed_carga: sets[0]?.prescribed_carga || "RPE 7",
        prescribed_reps: sets[0]?.prescribed_reps || "8-10",
        actual_kg: "",
        actual_reps: "",
        completed: false,
      },
    ]);
  };

  const notePlaceholder =
    ejercicio.nota || ejercicio.descanso
      ? ejercicio.nota
        ? `${ejercicio.nota} (Descanso: ${ejercicio.descanso || "90s"})`
        : `Descanso: ${ejercicio.descanso}`
      : "Añadir notas aquí...";

  return (
    <View style={styles.exerciseBlock}>
      {/* Título y Grupo Muscular */}
      <Text style={styles.groupSubtitle}>{grupoMuscular.toUpperCase()}</Text>
      <Text style={styles.exerciseTitle}>{ejercicio.nombre}</Text>

      {/* Caja de notas del usuario (Permite editar) */}
      <View style={styles.notesContainer}>
        <TextInput
          style={styles.notesInput}
          placeholder={notePlaceholder}
          placeholderTextColor={COLORS.secondaryText}
          multiline
          value={userNotes}
          onChangeText={setUserNotes}
        />
      </View>

      {/* Fila de Encabezados */}
      <View style={setStyles.headerRow}>
        <Text style={setStyles.headerText}>SET</Text>
        <Text style={setStyles.headerText}>PRESC.</Text>
        <Text style={setStyles.headerText}>KG/RPE</Text>
        <Text style={setStyles.headerText}>REPS</Text>
        <View style={{ width: 30 }} />
      </View>

      {/* Filas de Series (Mapeo dinámico) */}
      {sets.map((set, setIndex) => (
        <SetRow
          key={setIndex}
          set={set}
          setIndex={setIndex}
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
  rowCompleted: {
    backgroundColor: `${COLORS.accent}15`, // Fondo con opacidad
  },
  setNumber: {
    color: COLORS.primaryText,
    fontWeight: "bold",
    fontSize: 16,
    flex: 0.3,
    textAlign: "center",
  },
  colPrevious: {
    flex: 1.2,
    alignItems: "center",
    paddingHorizontal: 5,
  },
  previousText: {
    color: COLORS.secondaryText,
    fontSize: 14,
    fontStyle: "italic",
  },
  col: {
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    paddingHorizontal: 5,
  },
  input: {
    color: COLORS.primaryText,
    backgroundColor: COLORS.background,
    fontSize: 16,
    paddingHorizontal: 5,
    borderRadius: 5,
    minWidth: 55,
    textAlign: "center",
    fontWeight: "bold",
    height: 35,
    borderWidth: 1,
    borderColor: COLORS.separator,
  },
  inputCompleted: {
    backgroundColor: COLORS.inputBackground,
    borderColor: COLORS.accent,
    color: COLORS.secondaryText, // Color atenuado
  },
  colCheck: {
    flex: 0.3,
    alignItems: "center",
  },
});

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
    marginBottom: 5,
    textTransform: "capitalize",
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
});

export default ExerciseLogger;
