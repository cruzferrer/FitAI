import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router'; // Para obtener el parámetro 'day'
import { MaterialCommunityIcons } from '@expo/vector-icons';
import {COLORS} from '../../constants/theme';
import { RUTINA_PERIODIZADA } from '../../data/RutinaData'; 

// Componente simple para mostrar una serie (inspirado en la imagen)
const SetRow = ({ setNumber, prevKg, prevReps }: { setNumber: number | string, prevKg: number | string, prevReps: number | string }) => {
    // Aquí iría el estado real de KG y REPS
    return (
        <View style={setStyles.row}>
            <Text style={setStyles.setNumber}>{setNumber}</Text>
            
            {/* Columna PREVIOUS (del historial) */}
            <View style={setStyles.colPrevious}>
                <Text style={setStyles.previousText}>{prevKg} kg x {prevReps}</Text>
            </View>

            {/* Columna KG (Input) */}
            <View style={[setStyles.col, { flex: 0.9 }]}>
                <Text style={setStyles.inputPlaceholder}>80</Text> 
                <Text style={setStyles.unit}>KG</Text>
            </View>

            {/* Columna REPS (Input) */}
            <View style={[setStyles.col, { flex: 0.7 }]}>
                <Text style={setStyles.inputPlaceholder}>5</Text>
            </View>
            
            {/* Columna Check */}
            <TouchableOpacity style={setStyles.colCheck}>
                <MaterialCommunityIcons name="check-circle-outline" size={24} color={COLORS.accent} />
            </TouchableOpacity>
        </View>
    );
};

const WorkoutLogScreen: React.FC = () => {
    const router = useRouter();
    // Obtener el nombre del día pasado por la URL (si existe)
    const { day } = useLocalSearchParams();
    const [seconds, setSeconds] = useState(0);
    const [isActive, setIsActive] = useState(true); // El workout inicia activo

    const diaActualData = RUTINA_PERIODIZADA[0].dias.find(d => d.dia_entrenamiento === day) || RUTINA_PERIODIZADA[0].dias[0];

    useEffect(() => {
        // Mantenemos la variable 'interval' con el tipo correcto (NodeJS.Timeout o null)
        let interval: NodeJS.Timeout | null = null; 
        
        if (isActive) {
            // CORRECCIÓN CLAVE: Usamos 'as unknown as NodeJS.Timeout' para resolver la ambigüedad de tipos.
            // Esto le dice a TypeScript que el valor devuelto por setInterval debe tratarse como NodeJS.Timeout.
            interval = setInterval(() => { 
                setSeconds(prevSeconds => prevSeconds + 1);
            }, 1000) as unknown as NodeJS.Timeout; 
            
        } else if (!isActive && seconds !== 0) {
            if (interval) clearInterval(interval);
        }
        
        return () => {
            if (interval) clearInterval(interval);
        };
        
    }, [isActive, seconds]);



    const formatTime = (totalSeconds: number) => {
        const h = Math.floor(totalSeconds / 3600);
        const m = Math.floor((totalSeconds % 3600) / 60);
        const s = totalSeconds % 60;
        return [h > 0 ? h : null, m, s]
            .filter(val => val !== null || h > 0)
            .map(val => (val !== null ? String(val).padStart(2, '0') : ''))
            .join(':');
    };
    
    const handleFinish = () => {
        setIsActive(false);
        Alert.alert(
            "Finalizar Rutina", 
            `Entrenamiento completado en ${formatTime(seconds)}. ¿Deseas guardar?`,
            [
                { text: "Cancelar", style: "cancel" },
                { text: "Guardar y Salir", onPress: () => router.back() } // Volver a la Home
            ]
        );
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            {/* Header de Log (Simulando el diseño de la imagen) */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
                    <MaterialCommunityIcons name="chevron-left" size={28} color={COLORS.primaryText} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Log Workout</Text>
                
                <View style={styles.timerGroup}>
                    <Text style={styles.timerText}>{formatTime(seconds)}</Text>
                    <TouchableOpacity onPress={handleFinish} style={styles.finishButton}>
                        <Text style={styles.finishButtonText}>Finish</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.summaryBar}>
                <Text style={styles.summaryText}>Duration: {formatTime(seconds)}</Text>
                <Text style={styles.summaryText}>Sets: {diaActualData.grupos.reduce((acc, g) => acc + g.ejercicios.length * 3, 0)}</Text> 
                <Text style={styles.summaryText}>Volume: 0 kg</Text>
            </View>
            



            {/* Contenido de la Rutina */}
            <ScrollView contentContainerStyle={styles.contentContainer}>
                {diaActualData.grupos.flatMap(( grupo, groupIndex) => 
                    grupo.ejercicios.map((ejercicio, exerciseIndex) => (
                        <View key={`${groupIndex}-${exerciseIndex}`} style={styles.exerciseBlock}>
                            <Text style={styles.exerciseTitle}>{ejercicio.nombre}</Text>
                            <Text style={styles.noteText}>{ejercicio.nota || 'Añadir notas aquí...'}</Text>
                            
                            {/* Fila de Encabezados */}
                            <View style={setStyles.headerRow}>
                                <Text style={setStyles.headerText}>SET</Text>
                                <Text style={setStyles.headerText}>PREVIOUS</Text>
                                <Text style={setStyles.headerText}>KG</Text>
                                <Text style={setStyles.headerText}>REPS</Text>
                                <View style={{ width: 30 }}/> 
                            </View>
                            
                            {/* Filas de Series (Mapeo de Series del JSON no implementado aquí por simplicidad) */}
                            <SetRow setNumber={1} prevKg={70} prevReps={5} />
                            <SetRow setNumber={2} prevKg={70} prevReps={5} />
                            <SetRow setNumber={3} prevKg={70} prevReps={5} />

                            <TouchableOpacity style={styles.addSetButton}>
                                <MaterialCommunityIcons name="plus" size={16} color={COLORS.accent} />
                                <Text style={styles.addSetText}>Add Set</Text>
                            </TouchableOpacity>
                        </View>
                    ))
                )}
            </ScrollView>


        </SafeAreaView>
    );
};

// Estilos específicos para las filas de series
const setStyles = StyleSheet.create({
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 5,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.separator,
        marginBottom: 5,
    },
    headerText: {
        color: COLORS.secondaryText,
        fontSize: 12,
        fontWeight: 'bold',
        textAlign: 'center',
        flex: 1,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.separator,
    },
    setNumber: {
        color: COLORS.primaryText,
        fontWeight: 'bold',
        fontSize: 16,
        flex: 0.3,
        textAlign: 'center',
    },
    colPrevious: {
        flex: 1,
        alignItems: 'center',
        paddingHorizontal: 5,
    },
    previousText: {
        color: COLORS.secondaryText,
        fontSize: 14,
    },
    col: {
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        paddingHorizontal: 5,
    },
    inputPlaceholder: {
        backgroundColor: COLORS.inputBackground,
        color: COLORS.primaryText,
        fontSize: 16,
        paddingHorizontal: 5,
        borderRadius: 5,
        minWidth: 40,
        textAlign: 'center',
    },
    unit: {
        color: COLORS.secondaryText,
        fontSize: 10,
        marginLeft: 2,
    },
    colCheck: {
        flex: 0.3,
        alignItems: 'center',
    }
});


const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.separator,
    },
    headerButton: {
        padding: 5,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.primaryText,
    },
    timerGroup: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    timerText: {
        fontSize: 16,
        color: COLORS.secondaryText,
        marginRight: 10,
    },
    finishButton: {
        backgroundColor: COLORS.accent,
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 10,
    },
    finishButtonText: {
        color: COLORS.primaryText,
        fontWeight: 'bold',
    },
    summaryBar: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingVertical: 8,
        backgroundColor: COLORS.inputBackground,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.separator,
    },
    summaryText: {
        color: COLORS.secondaryText,
        fontSize: 12,
    },
    contentContainer: {
        padding: 15,
    },
    exerciseBlock: {
        backgroundColor: COLORS.inputBackground,
        borderRadius: 10,
        padding: 15,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: COLORS.separator,
    },
    exerciseTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: COLORS.primaryText,
        marginBottom: 5,
    },
    noteText: {
        color: COLORS.secondaryText,
        fontSize: 12,
        marginBottom: 15,
    },
    addSetButton: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 15,
        padding: 10,
        borderTopWidth: 1,
        borderTopColor: COLORS.separator,
    },
    addSetText: {
        color: COLORS.accent,
        fontSize: 16,
        marginLeft: 5,
        fontWeight: 'bold',
    }
});

export default WorkoutLogScreen;