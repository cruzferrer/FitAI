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
import { useForgotPassword } from "../../hooks/auth/useForgotPassword"; // <-- NUEVO HOOK

const ForgotPasswordScreen: React.FC = () => {
  const router = useRouter();
  const { email, setEmail, isLoading, handlePasswordReset } =
    useForgotPassword();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>Recuperar Contraseña</Text>
        <Text style={styles.subtitle}>
          Ingresa tu correo para recibir un enlace de recuperación.
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

          <PrimaryButton
            title="Enviar Enlace"
            onPress={handlePasswordReset}
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
  subtitle: {
    fontSize: 16,
    color: COLORS.secondaryText,
    marginBottom: 40,
    textAlign: "center",
  },
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

export default ForgotPasswordScreen;
