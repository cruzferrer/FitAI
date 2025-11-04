import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';

interface SetRecord {
  prescribed_carga: string;
  prescribed_reps: string;
  actual_kg: string;
  actual_reps: string;
  completed: boolean;
}

interface SetRowProps {
  setIndex: number;
  set: SetRecord;
  onUpdateSet: (index: number, updatedSet: SetRecord) => void;
}

const SetRow: React.FC<SetRowProps> = ({ set, setIndex, onUpdateSet }) => {
  const isCompleted = set.completed;
  
  // Función para manejar cambios en los inputs
  const handleChange = (key: 'actual_kg' | 'actual_reps', value: string) => {
    const updatedSet = { ...set, [key]: value };
    onUpdateSet(setIndex, updatedSet);
  };
  
  // Función para manejar el checkbox
  const handleToggle = () => {
    const updatedSet = { 
      ...set, 
      completed: !isCompleted,
      // Opcional: Si se completa, autocompleta los campos si están vacíos con la prescripción
      actual_kg: set.actual_kg || set.prescribed_carga,
      actual_reps: set.actual_reps || set.prescribed_reps,
    };
    onUpdateSet(setIndex, updatedSet);
  };

  return (
    <View style={setStyles.row}>
      <Text style={setStyles.setNumber}>{setIndex + 1}</Text>
      
      {/* Columna PRESCRIBIDA (Referencia) */}
      <View style={setStyles.colPrevious}>
        <Text style={setStyles.previousText}>{set.prescribed_carga} x {set.prescribed_reps}</Text>
      </View>

      {/* Columna KG (Input del Usuario) */}
      <View style={[setStyles.col, { flex: 0.9 }]}>
        <TextInput
          style={[setStyles.input, isCompleted && setStyles.inputCompleted]}
          keyboardType="numeric"
          placeholder={set.prescribed_carga.includes('RPE') ? 'RPE' : 'Kg'}
          placeholderTextColor={COLORS.secondaryText}
          value={set.actual_kg}
          onChangeText={(value) => handleChange('actual_kg', value)}
          editable={!isCompleted}
        />
      </View>

      {/* Columna REPS (Input del Usuario) */}
      <View style={[setStyles.col, { flex: 0.7 }]}>
        <TextInput
          style={[setStyles.input, isCompleted && setStyles.inputCompleted]}
          keyboardType="numeric"
          placeholder={set.prescribed_reps}
          placeholderTextColor={COLORS.secondaryText}
          value={set.actual_reps}
          onChangeText={(value) => handleChange('actual_reps', value)}
          editable={!isCompleted}
        />
      </View>

      {/* Columna Check */}
      <TouchableOpacity 
        style={setStyles.colCheck} 
        onPress={handleToggle}
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

// --- ESTILOS ---
const setStyles = StyleSheet.create({
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
        flex: 1.2,
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
    input: {
        color: COLORS.primaryText,
        backgroundColor: COLORS.background, 
        fontSize: 16,
        paddingHorizontal: 5,
        borderRadius: 5,
        minWidth: 55,
        textAlign: "center",
        fontWeight: "500",
        height: 30,
        borderWidth: 1,
        borderColor: COLORS.separator,
    },
    inputCompleted: {
        backgroundColor: COLORS.inputBackground,
        borderColor: COLORS.accent,
        opacity: 0.6,
    },
    colCheck: {
        flex: 0.3,
        alignItems: "center",
    },
});

export default SetRow;