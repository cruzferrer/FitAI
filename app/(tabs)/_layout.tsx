import React from 'react';
import { Tabs } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import COLORS from '../../constants/theme'; // Importamos el objeto COLORS

// Este componente define el navegador de pestañas inferiores para la app principal
const TabLayout: React.FC = () => {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: COLORS.accent, // Color activo del ícono
        tabBarInactiveTintColor: COLORS.secondaryText, // Color inactivo
        tabBarStyle: {
          backgroundColor: COLORS.background, // Fondo de la barra
          borderTopColor: COLORS.separator, // Línea divisoria superior
        },
        headerShown: false, // Ocultamos el header por defecto para controlarlo a nivel de pantalla
      }}
    >
      {/* Pestaña 1: Inicio / Rutina Actual */}
      <Tabs.Screen
        name="index" // Corresponde al archivo app/(tabs)/index.tsx
        options={{
          title: 'Rutina',
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="dumbbell" size={24} color={color} />
          ),
        }}
      />
      
      {/* Pestaña 2: Historial / Progreso */}
      <Tabs.Screen
        name="progress" // Tendrás que crear app/(tabs)/progress.tsx
        options={{
          title: 'Progreso',
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="chart-bar" size={24} color={color} />
          ),
        }}
      />

      {/* Pestaña 3: Chatbot / Perfil */}
      <Tabs.Screen
        name="chat" // Tendrás que crear app/(tabs)/chat.tsx
        options={{
          title: 'Chatbot',
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="robot" size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
};

export default TabLayout;