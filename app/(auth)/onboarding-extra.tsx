import React from "react";
import { View, Text, StyleSheet, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { COLORS } from "../../constants/theme";
import PrimaryButton from "../../components/Buttons/PrimaryButton";
import OptionSelector from "../../components/Form/OptionSelector";
import { useOnboarding, OPTIONS } from "../../hooks/auth/useOnboarding";

const OnboardingExtra: React.FC = () => {
  const router = useRouter();
  const { state, setters, handleGenerateRoutine } = useOnboarding();

  const {
    generationPreference,
    preferredExercises,
    injuries,
    timePerSession,
    comfortPreference,
    isLoading,
    isFormComplete,
  } = state as any;

  const {
    setGenerationPreference,
    setPreferredExercises,
    setInjuries,
    setTimePerSession,
    setComfortPreference,
  } = setters as any;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.header}>Más Preferencias</Text>

        <Text style={styles.label}>Generación preferida:</Text>
        <OptionSelector
          options={OPTIONS.generationPreference}
          selectedValue={generationPreference}
          onSelect={(val) => setGenerationPreference(val as string)}
          disabled={isLoading}
        />

        <Text style={styles.label}>Ejercicios preferidos (opcional):</Text>
        <TextInput
          style={styles.input}
          placeholder="Ej: bench press, deadlift, goblet squat"
          value={preferredExercises ?? ""}
          onChangeText={(t) => setPreferredExercises(t)}
        />

        <Text style={styles.label}>Lesiones o limitaciones (opcional):</Text>
        <TextInput
          style={styles.input}
          placeholder="Describe si tienes molestias"
          value={injuries ?? ""}
          onChangeText={(t) => setInjuries(t)}
        />

        <Text style={styles.label}>Tiempo por sesión (min):</Text>
        <OptionSelector
          options={OPTIONS.timePerSession}
          selectedValue={timePerSession}
          onSelect={(val) => setTimePerSession(val as number)}
          disabled={isLoading}
        />

        <Text style={styles.label}>Preferencia de comodidad:</Text>
        <OptionSelector
          options={OPTIONS.comfort}
          selectedValue={comfortPreference}
          onSelect={(val) => setComfortPreference(val as string)}
          disabled={isLoading}
        />

        <View style={{ marginTop: 20 }}>
          <PrimaryButton title="Volver" onPress={() => router.back()} />
          <PrimaryButton
            title="Generar Rutina con IA"
            onPress={handleGenerateRoutine}
            isLoading={isLoading}
            disabled={!isFormComplete}
            style={{ marginTop: 12 }}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  container: { padding: 20 },
  header: { fontSize: 22, fontWeight: "700", color: COLORS.accent },
  label: { marginTop: 16, fontSize: 16, color: COLORS.primaryText },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 10,
    borderRadius: 8,
    marginTop: 8,
    color: COLORS.primaryText,
  },
});

export default OnboardingExtra;
