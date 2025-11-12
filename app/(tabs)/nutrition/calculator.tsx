import React from "react";
import { View, Text, StyleSheet, ScrollView, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS } from "../../../constants/theme";
import OptionSelector from "../../../components/Form/OptionSelector";
import PrimaryButton from "../../../components/Buttons/PrimaryButton";
import {
  useCalorieCalculator,
  ACTIVITY_FACTORS,
} from "../../../hooks/tabs/nutrition/useCalorieCalculator"; // <-- NUEVO HOOK

const NutritionCalculatorScreen: React.FC = () => {
  // Consumimos el hook
  const { state, setters, calculateKcal, handleSaveParameters } =
    useCalorieCalculator();
  const { peso, altura, edad, sexo, actividad, objetivo, isLoading } = state;
  const { setPeso, setAltura, setEdad, setSexo, setActividad, setObjetivo } =
    setters;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.headerTitle}>Calculadora de Kcal Diarias</Text>
        <Text style={styles.subHeader}>
          Usamos la fórmula de Mifflin-St Jeor para determinar tu TMB.
        </Text>

        <Text style={styles.label}>1. Sexo</Text>
        <OptionSelector
          options={["Masculino", "Femenino"]}
          selectedValue={sexo}
          onSelect={(val) => setSexo(val as string)}
        />

        <Text style={styles.label}>2. Datos Biométricos (kg/cm/años)</Text>
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder="Peso (kg)"
            keyboardType="numeric"
            value={peso}
            onChangeText={setPeso}
          />
          <TextInput
            style={styles.input}
            placeholder="Altura (cm)"
            keyboardType="numeric"
            value={altura}
            onChangeText={setAltura}
          />
          <TextInput
            style={styles.input}
            placeholder="Edad"
            keyboardType="numeric"
            value={edad}
            onChangeText={setEdad}
          />
        </View>

        <Text style={styles.label}>3. Nivel de Actividad</Text>
        <OptionSelector
          options={Object.keys(ACTIVITY_FACTORS)}
          selectedValue={actividad}
          onSelect={(val) => setActividad(val as string)}
        />

        <Text style={styles.label}>4. Objetivo</Text>
        <OptionSelector
          options={["Mantenimiento", "Volumen", "Definición"]}
          selectedValue={objetivo}
          onSelect={(val) => setObjetivo(val as string)}
        />

        <Text style={styles.resultText}>
          Kcal Estimadas: {calculateKcal() > 0 ? calculateKcal() : "..."}
        </Text>

        <PrimaryButton
          title={isLoading ? "Guardando..." : "Guardar Parámetros"}
          onPress={handleSaveParameters}
          isLoading={isLoading}
          disabled={
            !sexo || !actividad || !objetivo || !peso || !altura || !edad
          }
          style={{ marginTop: 30 }}
        />
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
    color: COLORS.accent,
    marginBottom: 10,
  },
  subHeader: { color: COLORS.secondaryText, fontSize: 14, marginBottom: 20 },
  label: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.primaryText,
    marginTop: 20,
    marginBottom: 10,
  },
  inputRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  input: {
    flex: 1,
    backgroundColor: COLORS.inputBackground,
    color: COLORS.primaryText,
    borderRadius: 8,
    padding: 12,
    marginHorizontal: 5,
    textAlign: "center",
    borderWidth: 1,
    borderColor: COLORS.separator,
  },
  resultText: {
    fontSize: 22,
    fontWeight: "bold",
    color: COLORS.primaryText,
    textAlign: "center",
    marginTop: 30,
    padding: 10,
    backgroundColor: COLORS.inputBackground,
    borderRadius: 10,
  },
});

export default NutritionCalculatorScreen;
