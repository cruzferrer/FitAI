import { Stack } from 'expo-router';
import React from 'react';
import COLORS from '../../constants/theme'; // Asegúrate de que la ruta sea correcta

const AuthLayout: React.FC = () => {
  return (
    <Stack
      screenOptions={{
        // Aseguramos que NO se muestre el encabezado en este stack
        headerShown: false, 
        
        // ¡Esta línea fuerza el fondo del contenedor del Stack!
        contentStyle: { 
          backgroundColor: COLORS.background, 
        },
        
        // Esta línea es la que fuerza el color de fondo del header (si se mostrara)
        headerStyle: {
          backgroundColor: COLORS.background, 
        },
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="register" options={{ headerShown: false }} />
      <Stack.Screen name="forgot-password" options={{ headerShown: false }} />
    </Stack>
  );
};

export default AuthLayout;