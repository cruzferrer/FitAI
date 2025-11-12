import React from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { COLORS } from "../../constants/theme";
import PrimaryButton from "../../components/Buttons/PrimaryButton";
import { useRegister } from "../../hooks/auth/useRegister"; // <-- NUEVO HOOK

const RegisterScreen: React.FC = () => {
  const router = useRouter();

  // Consumimos el hook que maneja toda la lógica
  const {
    email,
    setEmail,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    isLoading,
    handleRegister,
  } = useRegister();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>Crear Cuenta</Text>
        <Text style={styles.subtitle}>
          Comienza tu entrenamiento inteligente con FitAI
        </Text>

        <View style={styles.inputGroup}>
          <TextInput
            style={styles.input}
            placeholder="Correo electrónico"
            placeholderTextColor={COLORS.secondaryText}
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />
          <TextInput
            style={styles.input}
            placeholder="Contraseña"
            placeholderTextColor={COLORS.secondaryText}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
          <TextInput
            style={styles.input}
            placeholder="Confirmar Contraseña"
            placeholderTextColor={COLORS.secondaryText}
            secureTextEntry
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />

          <PrimaryButton
            title="Registrarse"
            onPress={handleRegister}
            isLoading={isLoading}
            style={{ marginTop: 10 }}
          />

          <TouchableOpacity
            style={styles.backLink}
            onPress={() => router.back()}
          >
            <Text style={styles.linkText}>← Volver a Iniciar Sesión</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 50,
    alignItems: "center",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: COLORS.accent,
    marginBottom: 5,
  },
  subtitle: { fontSize: 16, color: COLORS.secondaryText, marginBottom: 40 },
  inputGroup: { width: "100%", marginBottom: 20 },
  input: {
    height: 50,
    backgroundColor: COLORS.inputBackground,
    borderRadius: 10,
    paddingHorizontal: 15,
    color: COLORS.primaryText,
    fontSize: 16,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: COLORS.separator,
  },
  backLink: { marginTop: 20, alignItems: "center" },
  linkText: {
    color: COLORS.accent,
    fontSize: 14,
    textDecorationLine: "underline",
  },
});

export default RegisterScreen;
