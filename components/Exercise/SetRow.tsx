import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { COLORS } from "../../constants/theme"; // Ajusta la ruta a tu theme
import * as Haptics from "expo-haptics";

// Tipo de set que el usuario registra
export interface SetRecord {
  prescribed_carga: string;
  prescribed_reps: string;
  actual_kg: string; // Peso registrado
  actual_reps: string; // Reps registradas
  actual_metric?: string; // RPE o RIR registrados
  completed: boolean;
}

interface SetRowProps {
  set: SetRecord;
  setIndex: number;
  metricLabel: "RPE" | "RIR";
  onUpdateSet: (index: number, updatedSet: SetRecord) => void;
}

const SetRow: React.FC<SetRowProps> = ({
  set,
  setIndex,
  metricLabel,
  onUpdateSet,
}) => {
  const isCompleted = set.completed;

  const handleChange = (
    key: "actual_kg" | "actual_reps" | "actual_metric",
    value: string
  ) => {
    onUpdateSet(setIndex, { ...set, [key]: value, completed: false });
  };

  const handleToggleComplete = () => {
    const newCompletedState = !isCompleted;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    let newKg = set.actual_kg;
    let newReps = set.actual_reps;
    let newMetric = set.actual_metric;

    // Autocompletar si está vacío
    if (newCompletedState && !newReps) {
      newReps = set.prescribed_reps.split(/[^0-9]/)[0] || set.prescribed_reps;
    }
    if (newCompletedState && !newMetric && set.prescribed_carga) {
      newMetric = set.prescribed_carga;
    }

    onUpdateSet(setIndex, {
      ...set,
      completed: newCompletedState,
      actual_kg: newKg,
      actual_metric: newMetric,
      actual_reps: newReps,
    });
  };

  return (
    <View style={[setStyles.row, isCompleted && setStyles.rowCompleted]}>
      <Text style={setStyles.setNumber}>{setIndex + 1}</Text>

      <View style={setStyles.colPrevious}>
        <Text style={setStyles.previousText}>
          {set.prescribed_carga} x {set.prescribed_reps}
        </Text>
      </View>

      <View style={[setStyles.col, { flex: 0.8 }]}>
        <TextInput
          style={[setStyles.input, isCompleted && setStyles.inputCompleted]}
          keyboardType="numeric"
          placeholder={metricLabel}
          placeholderTextColor={COLORS.secondaryText}
          value={set.actual_metric || ""}
          onChangeText={(value) => handleChange("actual_metric", value)}
          editable={!isCompleted}
        />
      </View>

      <View style={[setStyles.col, { flex: 0.8 }]}>
        <TextInput
          style={[setStyles.input, isCompleted && setStyles.inputCompleted]}
          keyboardType="numeric"
          placeholder="Kg"
          placeholderTextColor={COLORS.secondaryText}
          value={set.actual_kg}
          onChangeText={(value) => handleChange("actual_kg", value)}
          editable={!isCompleted}
        />
      </View>

      <View style={[setStyles.col, { flex: 0.7 }]}>
        <TextInput
          style={[setStyles.input, isCompleted && setStyles.inputCompleted]}
          keyboardType="numeric"
          placeholder={set.prescribed_reps.split(/[^0-9]/)[0]}
          placeholderTextColor={COLORS.secondaryText}
          value={set.actual_reps}
          onChangeText={(value) => handleChange("actual_reps", value)}
          editable={!isCompleted}
        />
      </View>

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

const setStyles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.separator,
  },
  rowCompleted: {
    backgroundColor: `${COLORS.accent}20`,
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
    color: COLORS.secondaryText,
  },
  colCheck: {
    flex: 0.3,
    alignItems: "center",
  },
});

export default SetRow;
