import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome5 } from '@expo/vector-icons'; 
import { useRouter } from 'expo-router';
import COLORS from '../../constants/theme'; // Importamos el objeto COLORS

const LoginScreen: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  const router = useRouter();

  const handleLogin = () => {
    if (!email || !password) {
      Alert.alert('Error', 'Por favor, ingresa tu correo y contraseña.');
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      // Aquí iría la lógica de redirección si el login fuera exitoso:
      // router.replace('/(tabs)'); 
      Alert.alert('Estado', 'Login con Supabase pendiente.');
    }, 1500);
  };

  const handleSocialLogin = (provider: 'Google' | 'Apple') => {
    Alert.alert('Pendiente', `Login con ${provider} pendiente.`);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>FitAI</Text>
        <Text style={styles.subtitle}>Tu Coach Inteligente</Text>

        <View style={styles.inputGroup}>
          <TextInput
            style={styles.input}
            placeholder="Correo electrónico"
            placeholderTextColor={COLORS.secondaryText}
            keyboardType="email-address"
            autoCapitalize="none"
            onChangeText={setEmail}
          />
          <TextInput
            style={styles.input}
            placeholder="Contraseña"
            placeholderTextColor={COLORS.secondaryText}
            secureTextEntry
            onChangeText={setPassword}
          />

          <TouchableOpacity
            style={styles.loginButton}
            onPress={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color={COLORS.primaryText} />
            ) : (
              <Text style={styles.buttonText}>Iniciar Sesión</Text>
            )}
          </TouchableOpacity>

          <View style={styles.linkContainer}>
            {/* ¡CORRECCIÓN DE TIPADO APLICADA! Usamos rutas sin el slash inicial. */}
            <TouchableOpacity onPress={() => router.push('forgot-password')}>
              <Text style={styles.linkText}>¿Olvidaste tu contraseña?</Text>
            </TouchableOpacity>
            
            <TouchableOpacity onPress={() => router.push('register')}>
              <Text style={styles.linkText}>¿No tienes cuenta? Regístrate</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.separatorContainer}>
          <View style={styles.separator} />
          <Text style={styles.orText}>O</Text>
          <View style={styles.separator} />
        </View>

        <View style={styles.socialButtonsContainer}>
          <TouchableOpacity style={styles.socialButton} onPress={() => handleSocialLogin('Google')}>
            <FontAwesome5 name="google" size={24} color={COLORS.primaryText} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.socialButton} onPress={() => handleSocialLogin('Apple')}>
            <FontAwesome5 name="apple" size={24} color={COLORS.primaryText} />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: COLORS.background },
    container: { flex: 1, paddingHorizontal: 20, paddingTop: 50, alignItems: 'center' },
    title: { fontSize: 32, fontWeight: 'bold', color: COLORS.accent, marginBottom: 5 },
    subtitle: { fontSize: 16, color: COLORS.secondaryText, marginBottom: 40 },
    inputGroup: { width: '100%', marginBottom: 20 },
    input: { height: 50, backgroundColor: COLORS.inputBackground, borderRadius: 10, paddingHorizontal: 15, color: COLORS.primaryText, fontSize: 16, marginBottom: 15, borderWidth: 1, borderColor: COLORS.separator },
    loginButton: { height: 50, backgroundColor: COLORS.accent, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginTop: 10 },
    buttonText: { color: COLORS.primaryText, fontSize: 18, fontWeight: 'bold' },
    linkContainer: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginTop: 15 },
    linkText: { color: COLORS.accent, fontSize: 14, textDecorationLine: 'underline' },
    separatorContainer: { flexDirection: 'row', alignItems: 'center', width: '100%', marginVertical: 30 },
    separator: { flex: 1, height: 1, backgroundColor: COLORS.separator },
    orText: { width: 30, textAlign: 'center', color: COLORS.secondaryText, fontSize: 14 },
    socialButtonsContainer: { flexDirection: 'row', justifyContent: 'space-around', width: '60%' },
    socialButton: { backgroundColor: COLORS.inputBackground, padding: 15, borderRadius: 50, borderWidth: 1, borderColor: COLORS.separator },
});

export default LoginScreen;