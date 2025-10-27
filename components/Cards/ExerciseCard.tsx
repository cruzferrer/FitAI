import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';

interface ExerciseCardProps {
  ejercicio: any; // Usaremos 'any' por simplicidad, pero debería ser 'Ejercicio'
  index: number;
}

const ExerciseCard: React.FC<ExerciseCardProps> = ({ ejercicio, index }) => {
  return (
    <View style={styles.card}>
      <Text style={styles.exerciseIndex}>{index + 1}</Text>
      <View style={styles.content}>
        <Text style={styles.exerciseName}>{ejercicio.nombre}</Text>
        
        {/* Detalles de la Serie / Repetición / Carga */}
        <View style={styles.detailRow}>
          <Text style={styles.detailText}>
            Sets: <Text style={styles.detailValue}>{ejercicio.series}</Text>
          </Text>
          <Text style={styles.detailText}>
            Reps: <Text style={styles.detailValue}>{ejercicio.repeticiones}</Text>
          </Text>
          <Text style={styles.detailText}>
            Carga: <Text style={styles.detailValue}>{ejercicio.carga_notacion}</Text>
          </Text>
        </View>

        {/* Nota del Entrenador/IA */}
        {ejercicio.nota ? (
          <View style={styles.noteContainer}>
            <Feather name="info" size={14} color={COLORS.secondaryText} style={{ marginRight: 5 }} />
            <Text style={styles.noteText}>{ejercicio.nota}</Text>
          </View>
        ) : null}
      </View>
      
      {/* Opcional: Icono de Checkbox para marcar como completado */}
      <View style={styles.checkPlaceholder} /> 
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: COLORS.inputBackground,
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    alignItems: 'flex-start',
    borderLeftWidth: 4,
    borderLeftColor: COLORS.accent,
  },
  exerciseIndex: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.accent,
    marginRight: 10,
  },
  content: {
    flex: 1,
  },
  exerciseName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.primaryText,
    marginBottom: 8,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  detailText: {
    color: COLORS.secondaryText,
    fontSize: 14,
    marginRight: 15,
  },
  detailValue: {
    color: COLORS.primaryText,
    fontWeight: 'bold',
  },
  noteContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 5,
    borderTopWidth: 1,
    borderTopColor: COLORS.separator,
  },
  noteText: {
    color: COLORS.secondaryText,
    fontSize: 12,
    flex: 1,
  },
  checkPlaceholder: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: COLORS.secondaryText,
    marginLeft: 10,
  },
});

export default ExerciseCard;