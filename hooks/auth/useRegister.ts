import { useState } from "react";
import { Alert } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "./useAuth"; // Importamos el hook de autenticación

export const useRegister = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [fullName, setFullName] = useState<string>("");
  const [username, setUsername] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const router = useRouter();
  const { signUp } = useAuth(); // Obtenemos la función signUp del contexto

  const handleRegister = async () => {
    // 1. Validaciones del formulario
    if (!email || !password || !confirmPassword || !username) {
      Alert.alert("Error", "Por favor, completa todos los campos obligatorios.");
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert("Error", "Las contraseñas no coinciden.");
      return;
    }

    setIsLoading(true);

    // 2. Llamada a la API (manejada por useAuth)
    const { error } = await signUp(email, password, {
      full_name: fullName,
      username: username,
    });

    setIsLoading(false);

    if (error) {
      Alert.alert("Error de Registro", error.message);
    } else {
      // 3. Éxito
      Alert.alert(
        "Registro Exitoso",
        "¡Tu cuenta ha sido creada! Te estamos redirigiendo para configurar tu perfil."
      );
      // Redirigimos al Onboarding para la Fase 4
      router.replace("/(auth)/onboarding");
    }
  };

  return {
    email,
    setEmail,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    fullName,
    setFullName,
    username,
    setUsername,
    isLoading,
    handleRegister,
  };
};
