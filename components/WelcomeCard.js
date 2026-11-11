import { MaterialCommunityIcons, Text, View } from "./Themed";
import React from "react";
import { Platform, StyleSheet } from "react-native";

export default function WelcomeCard({ username }) {
  return (
    <View style={styles.card}>
      <View style={styles.copy}>
        <Text style={styles.eyebrow}>From our kitchen</Text>
        <Text accessibilityRole="header" style={styles.title}>{username ? `Kumusta, ${username}!` : "Kumusta!"}</Text>
        <Text style={styles.subtitle}>What are you craving today?</Text>
      </View>
      <View style={styles.stamp} accessible={false} importantForAccessibility="no-hide-descendants">
        <MaterialCommunityIcons name="pot-steam-outline" color="#702329" size={23} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { flexDirection: "row", alignItems: "center", gap: 10, marginTop: 4, marginBottom: 16, padding: 16, borderRadius: 15, backgroundColor: "#FFF1DA" },
  copy: { flex: 1, gap: 4 },
  eyebrow: { color: "#702329", fontSize: 11, fontWeight: "700", letterSpacing: 1, textTransform: "uppercase" },
  title: { color: "#702329", fontFamily: Platform.select({ android: "serif", ios: "Georgia", web: "Georgia, serif" }), fontSize: 27, fontWeight: "700" },
  subtitle: { color: "#702329", fontSize: 14 },
  stamp: { width: 44, height: 44, borderRadius: 22, borderWidth: 1, borderStyle: "dashed", borderColor: "#702329", alignItems: "center", justifyContent: "center", transform: [{ rotate: "-12deg" }] },
});
