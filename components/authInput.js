import { View, Text, TextInput, TouchableOpacity, Ionicons } from "./Themed";
import React, { useState } from "react";
import { StyleSheet } from "react-native";

export default function AuthInput({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  keyboardType,
  icon,
  warm = false,
  compact = false,
}) {
  const [showPassword, setShowPassword] = useState(false);
  const isPasswordField = secureTextEntry === true;

  return (
    <View style={[styles.wrapper, compact && styles.compactWrapper]}>
      <Text style={[styles.label, warm && styles.warmLabel]}>{label}</Text>
      <View style={[styles.field, warm && styles.warmField]}>
        {icon && (
          <Ionicons
            name={icon}
            size={17}
            color="#9A7E6D"
            style={styles.leadingIcon}
          />
        )}
        <TextInput
          accessibilityLabel={label}
          style={[
            styles.input,
            warm && styles.warmInput,
            icon && styles.withIcon,
          ]}
          placeholder={placeholder}
          placeholderTextColor="#808080"
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={isPasswordField && !showPassword}
          keyboardType={keyboardType}
          autoCapitalize="none"
          autoCorrect={false}
        />

        {isPasswordField && (
          <TouchableOpacity
            style={styles.icon}
            accessibilityRole="button"
            accessibilityLabel={
              showPassword ? "Hide password" : "Show password"
            }
            onPress={() => setShowPassword(!showPassword)}
          >
            <Ionicons
              name={showPassword ? "eye" : "eye-off"}
              size={22}
              color="#666"
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  warmLabel: { color: "#76665F", fontSize: 12, fontWeight: "400" },
  warmField: {
    backgroundColor: "#FFFDF9",
    borderWidth: 1,
    borderColor: "#D9C9B8",
    borderRadius: 14,
  },
  warmInput: { borderWidth: 0, borderRadius: 14 },
  leadingIcon: { position: "absolute", left: 13 },
  withIcon: { paddingLeft: 40 },
  wrapper: { marginBottom: 15 },
  compactWrapper: { marginBottom: 8 },
  label: { color: "#403838", fontSize: 14, fontWeight: "600", marginBottom: 7 },
  field: { position: "relative", justifyContent: "center" },
  input: {
    borderWidth: 1,
    borderColor: "#999",
    borderRadius: 20,
    padding: 12,
    paddingRight: 45,
    fontSize: 16,
    color: "#292323",
    minHeight: 48,
  },
  icon: { position: "absolute", right: 15 },
});
