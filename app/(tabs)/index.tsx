import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router'; // <-- Importar useRouter
import {COLORS} from '@/constants/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import HomeHeader from '@/components/Headers/HomeHeader';
import RoutineStartCard from '@/components/Cards/RoutineStartCard'; // <-- Nuevo componente
import { useAuth } from '../../hooks/useAuth'; // <-- Importar useAuth

// Definimos la estructura del JSON que esperamos (simplificado)
interface RutinaGenerada {
  rutina_periodizada: {
    semana: number;
    fase: string;
    dias: {
      dia_entrenamiento: string;
    }[];
  }[];
}

const HomeScreen: React.FC = () => {
  const router = useRouter();
  const { signOut } = useAuth();

  const [isLoading, setIsLoading] = useState(true);
  const [rutina, setRutina] = useState<RutinaGenerada | null>(null);

  // 1. Hook para cargar la rutina guardada cuando la pantalla se monta
  useEffect(() => {
    const loadRoutine = async () => {
      setIsLoading(true);
      const jsonString = await AsyncStorage.getItem('@FitAI_UserRoutine');
      
      if (jsonString) {
        setRutina(JSON.parse(jsonString));
      }
      setIsLoading(false);
    };

    loadRoutine();
  }, []); // El array vacío asegura que solo se ejecute una vez al cargar

  const handleSearch = () => Alert.alert("Búsqueda", "Pendiente.");
  const handleNotifications = () => Alert.alert("Notificaciones", "Pendiente.");
  
  const handleLogout = async () => {
    await signOut();
    router.replace('/(auth)');
  };
  
  const handleStartWorkout = (dia_entrenamiento: string) => {
    router.push(`/workout?day=${encodeURIComponent(dia_entrenamiento)}` as any);
  };

  // ---------------- RENDERIZADO ----------------

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <HomeHeader onSearchPress={handleSearch} onNotificationsPress={handleNotifications} onLogoutPress={handleLogout} />
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={COLORS.accent} />
          <Text style={styles.subtitle}>Cargando tu rutina...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!rutina || !rutina.rutina_periodizada || rutina.rutina_periodizada.length === 0) {
    // Si no hay rutina guardada, mostrar un mensaje para ir a generarla
    return (
      <SafeAreaView style={styles.safeArea}>
        <HomeHeader onSearchPress={handleSearch} onNotificationsPress={handleNotifications} onLogoutPress={handleLogout} />
        <View style={styles.loaderContainer}>
          <Text style={styles.title}>No hay rutina activa</Text>
          <Text style={styles.subtitle}>Ve a tu perfil para generar una nueva rutina.</Text>
          {/* Aquí podrías poner un botón que navegue a Onboarding */}
        </View>
      </SafeAreaView>
    );
  }

  // 2. Extraemos los datos de la rutina real generada por la IA
  const semanaActual = rutina.rutina_periodizada[0]; // (Semana 1)
  const diaActual = semanaActual.dias[0]; 
  const proximosDias = semanaActual.dias.slice(1);

  return (
    <SafeAreaView style={styles.safeArea}>
      <HomeHeader 
        onSearchPress={handleSearch} 
        onNotificationsPress={handleNotifications} 
        onLogoutPress={handleLogout} 
      />
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
      >
        {/* TARJETA DE INICIO (Datos reales de la IA) */}
        <RoutineStartCard
          dia={diaActual.dia_entrenamiento}
          fase={semanaActual.fase}
          onPress={() => handleStartWorkout(diaActual.dia_entrenamiento)}
        />
        
        {/* PRÓXIMOS ENTRENAMIENTOS (Datos reales de la IA) */}
        <Text style={styles.nextTitle}>— Próximos Entrenamientos (Semana {semanaActual.semana}) —</Text>
        
        <View style={styles.nextList}>
          {proximosDias.map((dia, index) => (
            <View key={index} style={styles.nextDayCard}>
              <Text style={styles.nextDayText}>{dia.dia_entrenamiento}</Text>
            </View>
          ))}
        </View>
        
      </ScrollView>
    </SafeAreaView>
  );
};

// ... (Añade los estilos de HomeScreen, incluidos los nuevos 'loaderContainer')
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: { 
    flex: 1, 
  },
  contentContainer: {
    paddingHorizontal: 20, 
    paddingBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.primaryText,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.secondaryText,
    marginTop: 20,
  },
  nextTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.secondaryText,
    marginBottom: 15,
    textAlign: 'center',
  },
  nextList: {
    width: '100%',
  },
  nextDayCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.inputBackground,
    padding: 15,
    borderRadius: 10,
    marginBottom: 8,
  },
  nextDayText: {
    fontSize: 16,
    color: COLORS.primaryText,
    fontWeight: '500',
  },
});

export default HomeScreen;