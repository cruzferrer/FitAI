import React from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router'; // <-- Importar useRouter
import { MaterialCommunityIcons } from '@expo/vector-icons';
import {COLORS} from '@/constants/theme';
import HomeHeader from '@/components/Headers/HomeHeader';
import RoutineStartCard from '@/components/Cards/RoutineStartCard'; // <-- Nuevo componente
import { RUTINA_PERIODIZADA } from '@/data/RutinaData'; 

const HomeScreen: React.FC = () => {
    const router = useRouter(); // <-- Inicializar Router
    
    // Asumimos Semana 1 como la actual
    const semanaActual = RUTINA_PERIODIZADA[0];
    const diaActual = semanaActual.dias[0]; 
    const proximosDias = semanaActual.dias.slice(1); // Días 2, 3, 4...

    const handleSearch = () => Alert.alert("Búsqueda", "Funcionalidad de búsqueda pendiente.");
    const handleNotifications = () => Alert.alert("Notificaciones", "Mostrando notificaciones.");
    
   
    const handleStartWorkout = () => {
        // Corrección: Forzamos el tipo a 'any' en el argumento para evitar el error de tipado de la URL
        router.push(
            `/workout?day=${encodeURIComponent(diaActual.dia_entrenamiento)}` as any
        );
    };

    const handleViewNextWorkout = (diaName: string) => {
        Alert.alert("Vista Previa", `Navegar a la vista previa de: ${diaName}`);
        // router.push(`/workout-preview?day=${encodeURIComponent(diaName)}`);
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            
            <HomeHeader 
                onSearchPress={handleSearch} 
                onNotificationsPress={handleNotifications} 
            />
            
            <ScrollView 
                style={styles.scrollView}
                contentContainerStyle={styles.contentContainer}
            >
                {/* TARJETA DE INICIO DE LA RUTINA ACTUAL */}
                <RoutineStartCard
                    dia={diaActual.dia_entrenamiento}
                    fase={semanaActual.fase}
                    onPress={handleStartWorkout}
                />
                
                {/* PRÓXIMOS ENTRENAMIENTOS */}
                <Text style={styles.nextTitle}>— Tus Próximos Entrenamientos —</Text>
                
                <View style={styles.nextList}>
                    {proximosDias.map((dia, index) => (
                        <TouchableOpacity 
                            key={index} 
                            style={styles.nextDayCard}
                            onPress={() => handleViewNextWorkout(dia.dia_entrenamiento)}
                        >
                            <View style={{flexDirection: 'row', alignItems: 'center'}}>
                                <MaterialCommunityIcons name="weight-lifter" size={20} color={COLORS.secondaryText} style={{ marginRight: 10 }} />
                                <Text style={styles.nextDayText}>{dia.dia_entrenamiento}</Text>
                            </View>
                            <MaterialCommunityIcons name="chevron-right" size={20} color={COLORS.secondaryText} />
                        </TouchableOpacity>
                    ))}
                </View>
                
            </ScrollView>
            
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    scrollView: { 
        flex: 1, 
    },
    contentContainer: {
        paddingHorizontal: 20, 
        paddingBottom: 40,
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