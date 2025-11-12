import { useState } from "react";
import { Alert } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "./useAuth";

export const useLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { signIn } = useAuth();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Por favor, ingresa tu correo y contraseña.");
      return;
    }
    setIsLoading(true);
    const { error } = await signIn(email, password);
    setIsLoading(false);

    if (error) {
      Alert.alert("Error de Login", error.message);
    } else {
      // Éxito: El hook 'useAuth' manejará la sesión,
      // el Root Redirector ('app/index.tsx') te enviará a '/(tabs)'
      // o a '/(auth)/onboarding' si es la primera vez (lógica que ya implementamos).
      router.replace("/(auth)/onboarding"); // Forzamos ir al onboarding por ahora
    }
  };

  return { email, setEmail, password, setPassword, isLoading, handleLogin };
};
