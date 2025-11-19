import React from "react";
import { Text, StyleSheet, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS } from "../../constants/theme";
import PrimaryButton from "../../components/Buttons/PrimaryButton";
import OptionSelector from "../../components/Form/OptionSelector";
// Importamos el nuevo hook
import { useOnboarding, OPTIONS } from "../../hooks/auth/useOnboarding";
import { useRouter } from "expo-router";

const OnboardingScreen: React.FC = () => {
  // Consumimos el hook
  const { state, setters, handleGenerateRoutine } = useOnboarding();
  const router = useRouter();
  const {
    objective,
    experience,
    days,
    equipment,
    notation,
    isLoading,
    isFormComplete,
  } = state;
  const { setObjective, setExperience, setDays, setEquipment, setNotation } =
    setters;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.header}>¡Hola! Configura FitAI 🤖</Text>
        <Text style={styles.subHeader}>
          Necesitamos estos datos para generar tu Mesociclo.
        </Text>

        <Text style={styles.label}>1. ¿Cuál es tu objetivo principal?</Text>
        <OptionSelector
          options={OPTIONS.objective}
          selectedValue={objective}
          onSelect={(val) => setObjective(val as string)}
          disabled={isLoading}
        />

        <Text style={styles.label}>2. ¿Cuál es tu nivel de experiencia?</Text>
        <OptionSelector
          options={OPTIONS.experience}
          selectedValue={experience}
          onSelect={(val) => setExperience(val as string)}
          disabled={isLoading}
        />

        <Text style={styles.label}>3. Días disponibles a la semana:</Text>
        <OptionSelector
          options={OPTIONS.days}
          selectedValue={days}
          onSelect={(val) => setDays(val as number)}
          disabled={isLoading}
        />

        <Text style={styles.label}>4. Equipamiento Disponible:</Text>
        <OptionSelector
          options={OPTIONS.equipment}
          selectedValue={equipment}
          onSelect={(val) => setEquipment(val as string)}
          disabled={isLoading}
        />

        <Text style={styles.label}>5. Preferencia de Notación:</Text>
        <OptionSelector
          options={OPTIONS.notation}
          selectedValue={notation}
          onSelect={(val) => setNotation(val as string)}
          disabled={isLoading}
        />

        <PrimaryButton
          title="Más preferencias"
          onPress={() => router.push("/ (auth)/onboarding_extra")}
          style={{ marginTop: 16, backgroundColor: COLORS.secondary }}
        />

        <PrimaryButton
          title="Generar Rutina con IA"
          onPress={handleGenerateRoutine}
          isLoading={isLoading}
          disabled={!isFormComplete}
          style={{ marginTop: 40 }}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  container: { padding: 20 },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.accent,
    marginBottom: 10,
  },
  subHeader: { fontSize: 16, color: COLORS.secondaryText, marginBottom: 30 },
  label: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.primaryText,
    marginTop: 20,
    marginBottom: 10,
  },
});

export default OnboardingScreen;
