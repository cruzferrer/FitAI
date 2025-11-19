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
      // Éxito: El hook 'useAuth' manejará la sesión.
      // Tras un login normal no debemos forzar el onboarding. En su lugar
      // redirigimos al dashboard. El onboarding debe lanzarse solo tras
      // un registro nuevo o cuando falten datos del perfil.
      router.replace("/(tabs)/dashboard");
    }
  };

  return { email, setEmail, password, setPassword, isLoading, handleLogin };
};
