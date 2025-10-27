import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { COLORS } from '../../constants/theme'; 

const ForgotPasswordScreen: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  const router = useRouter();

  const handleResetPassword = () => {
    if (!email) {
      Alert.alert('Error', 'Por favor, ingresa tu correo.');
      return;
    }

    setIsLoading(true);
    // Lógica futura de Supabase Password Reset aquí
    setTimeout(() => {
      setIsLoading(false);
      Alert.alert('Email Enviado', 'Se ha enviado un enlace de recuperación a tu correo. Volviendo a Login.');
      router.back(); 
    }, 2000);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>Recuperar Contraseña</Text>
        <Text style={styles.subtitle}>Ingresa tu correo para recibir un enlace de recuperación.</Text>

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

          <TouchableOpacity
            style={styles.resetButton}
            onPress={handleResetPassword}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color={COLORS.primaryText} />
            ) : (
              <Text style={styles.buttonText}>Enviar Enlace</Text>
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

// ... (Estilos, usando los mismos que en Register/Login)
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  container: { flex: 1, paddingHorizontal: 20, paddingTop: 50, alignItems: 'center' },
  title: { fontSize: 32, fontWeight: 'bold', color: COLORS.accent, marginBottom: 5 },
  subtitle: { fontSize: 16, color: COLORS.secondaryText, marginBottom: 40, textAlign: 'center' },
  inputGroup: { width: '100%', marginBottom: 20 },
  input: {
    height: 50, backgroundColor: COLORS.inputBackground, borderRadius: 10,
    paddingHorizontal: 15, color: COLORS.primaryText, fontSize: 16, marginBottom: 15,
    borderWidth: 1, borderColor: COLORS.separator,
  },
  resetButton: {
    height: 50, backgroundColor: COLORS.accent, borderRadius: 10,
    justifyContent: 'center', alignItems: 'center', marginTop: 10,
  },
  buttonText: { color: COLORS.primaryText, fontSize: 18, fontWeight: 'bold' },
  backLink: { marginTop: 20, alignItems: 'center' },
  linkText: { color: COLORS.accent, fontSize: 14, textDecorationLine: 'underline' },
});

export default ForgotPasswordScreen;