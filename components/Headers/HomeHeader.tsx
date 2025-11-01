import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons'; // Usamos iconos de Google/Apple
import { COLORS } from '../../constants/theme';

// Definimos las props (propiedades) que recibirá el componente
interface HomeHeaderProps {
  onSearchPress: () => void;
  onNotificationsPress: () => void;
  onLogoutPress: () => void; // <-- NUEVA PROP
}

const HomeHeader: React.FC<HomeHeaderProps> = ({ onSearchPress, onNotificationsPress, onLogoutPress }) => {
  return (
    <View style={styles.headerContainer}>
      {/* Título de la Aplicación */}
      <Text style={styles.logoText}>FitAI</Text>

      {/* Contenedor de Iconos de Acción */}
      <View style={styles.iconGroup}>
        
        {/* Icono de Búsqueda (Lupa) */}
        <TouchableOpacity onPress={onSearchPress} style={styles.iconButton}>
          <Feather name="search" size={24} color={COLORS.primaryText} />
        </TouchableOpacity>
        
        {/* Icono de Notificaciones */}
        <TouchableOpacity onPress={onNotificationsPress} style={styles.iconButton}>
          <Ionicons name="notifications-outline" size={24} color={COLORS.primaryText} />
          {/* Opcional: Indicador de Notificación (el punto rojo) */}
          <View style={styles.notificationBadge} />
        </TouchableOpacity>
        {/* BOTÓN DE CERRAR SESIÓN (NUEVO) */}
        <TouchableOpacity onPress={onLogoutPress} style={[styles.iconButton, { marginLeft: 20 }]}>
          <MaterialCommunityIcons name="logout" size={24} color={COLORS.secondaryText} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: COLORS.background, 
  },
  logoText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.accent,
  },
  iconGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    marginLeft: 18,
    position: 'relative',
    padding: 2, // Área táctil extra
  },
  notificationBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'red',
  },
});

export default HomeHeader;