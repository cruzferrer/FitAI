import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { COLORS } from '../../constants/theme'; // Ajusta la ruta si es necesario

const RegisterScreen: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  const router = useRouter();

  const handleRegister = () => {
    if (!email || !password || !confirmPassword) {
      Alert.alert('Error', 'Por favor, completa todos los campos.');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Las contraseñas no coinciden.');
      return;
    }

    setIsLoading(true);
    // Lógica futura de Supabase Registration aquí
    setTimeout(() => {
      setIsLoading(false);
      Alert.alert('Éxito', 'Funcionalidad de Registro pendiente. Volviendo a Login.');
      router.back(); // Vuelve a la pantalla anterior (Login)
    }, 1500);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>Crear Cuenta</Text>
        <Text style={styles.subtitle}>Comienza tu entrenamiento inteligente con FitAI</Text>

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

          <TouchableOpacity
            style={styles.registerButton}
            onPress={handleRegister}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color={COLORS.primaryText} />
            ) : (
              <Text style={styles.buttonText}>Registrarse</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.backLink} onPress={() => router.back()}>
            <Text style={styles.linkText}>← Volver a Iniciar Sesión</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

// ... (Estilos de LoginScreen, puedes copiarlos aquí o importarlos)
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  container: { flex: 1, paddingHorizontal: 20, paddingTop: 50, alignItems: 'center' },
  title: { fontSize: 32, fontWeight: 'bold', color: COLORS.accent, marginBottom: 5 },
  subtitle: { fontSize: 16, color: COLORS.secondaryText, marginBottom: 40 },
  inputGroup: { width: '100%', marginBottom: 20 },
  input: {
    height: 50, backgroundColor: COLORS.inputBackground, borderRadius: 10,
    paddingHorizontal: 15, color: COLORS.primaryText, fontSize: 16, marginBottom: 15,
    borderWidth: 1, borderColor: COLORS.separator,
  },
  registerButton: {
    height: 50, backgroundColor: COLORS.accent, borderRadius: 10,
    justifyContent: 'center', alignItems: 'center', marginTop: 10,
  },
  buttonText: { color: COLORS.primaryText, fontSize: 18, fontWeight: 'bold' },
  backLink: { marginTop: 20, alignItems: 'center' },
  linkText: { color: COLORS.accent, fontSize: 14, textDecorationLine: 'underline' },
});

export default RegisterScreen;