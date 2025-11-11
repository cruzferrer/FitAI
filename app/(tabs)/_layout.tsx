import React from "react";
import { Tabs } from "expo-router";
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import { COLORS } from "@/constants/theme";

// Este componente define el navegador de pestañas inferiores para la app principal
const TabLayout: React.FC = () => {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: COLORS.accent,
        tabBarInactiveTintColor: COLORS.secondaryText,
        tabBarStyle: {
          backgroundColor: COLORS.background,
          borderTopColor: COLORS.separator,
        },
        headerShown: false,
      }}
    >
      {/*  Pestaña 1:  DASHBOARD */}
      <Tabs.Screen
        name="dashboard"
        options={{
          title: "Dashboard",
          tabBarIcon: ({ color }) => (
            <Ionicons name="trending-up-outline" size={24} color={color} />
          ),
        }}
      />

      {/* Pestaña 2: Inicio / Rutina Actual */}
      <Tabs.Screen
        name="index"
        options={{
          title: "Rutina",
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="dumbbell" size={24} color={color} />
          ),
        }}
      />

      {/* Pestaña 3: Historial / Progreso */}
      <Tabs.Screen
        name="progress"
        options={{
          title: "Progreso",
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="chart-bar" size={24} color={color} />
          ),
        }}
      />
      {/*  Pestaña 4:  NUTRICIÓN / PESO */}
      <Tabs.Screen
        name="nutrition"
        options={{
          title: "Nutrición",
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons
              name="scale-bathroom"
              size={24}
              color={color}
            />
          ),
        }}
      />

      {/* Pestaña 3: Chatbot  */}
      <Tabs.Screen
        name="chat"
        options={{
          title: "Chatbot",
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="robot" size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
};

export default TabLayout;
