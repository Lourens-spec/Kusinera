import { TouchableOpacity, Text } from "./Themed";
import React from "react";
import { StyleSheet } from "react-native";

export default function AuthButton({ title, onPress }) {
  return (
    <TouchableOpacity accessibilityRole="button" style={styles.button} onPress={onPress}>
      <Text style={styles.buttonText}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: { backgroundColor: "#6D0808", borderRadius: 20, padding: 15, alignItems: "center", marginTop: 10 },
  buttonText: { color: "white", fontSize: 16, fontWeight: "bold" },
});
