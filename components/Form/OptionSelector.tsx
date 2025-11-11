import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { COLORS } from "../../constants/theme"; // Ajusta la ruta a tu theme

interface OptionSelectorProps {
  options: (string | number)[];
  selectedValue: string | number | null;
  onSelect: (value: string | number) => void;
  disabled?: boolean;
}

const OptionSelector: React.FC<OptionSelectorProps> = ({
  options,
  selectedValue,
  onSelect,
  disabled = false,
}) => {
  return (
    <View style={styles.buttonGroup}>
      {options.map((item, index) => (
        <TouchableOpacity
          key={index}
          style={[
            styles.optionButton,
            selectedValue === item && styles.optionButtonActive,
          ]}
          onPress={() => onSelect(item)}
          disabled={disabled}
        >
          <Text
            style={[
              styles.optionText,
              selectedValue === item && styles.optionTextActive,
            ]}
          >
            {item}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  buttonGroup: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 10,
  },
  optionButton: {
    backgroundColor: COLORS.inputBackground,
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.separator,
  },
  optionButtonActive: {
    backgroundColor: COLORS.accent,
    borderColor: COLORS.accent,
  },
  optionText: {
    color: COLORS.primaryText,
    fontWeight: "500",
  },
  optionTextActive: {
    color: COLORS.background, // O COLORS.primaryText si prefieres texto blanco
    fontWeight: "bold",
  },
});

export default OptionSelector;
