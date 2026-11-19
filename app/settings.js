import sharedStyles from "../styles/sharedStyles";
import { Feather, Pressable, Switch, Text, View } from "../components/Themed";
import React from "react";
import { useRouter } from "expo-router";
import { StyleSheet } from "react-native";
import ScreenContainer from "../components/ScreenContainer";
import { useMenuGlass } from "../styles/menuGlass";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";

const helpLinks = [
  { label: "How to order", icon: "book-open", pathname: "/info", topic: "ordering" },
  { label: "Help & FAQs", icon: "help-circle", pathname: "/help" },
  { label: "Contact us", icon: "phone", pathname: "/contact" },
  { label: "Rate us", icon: "star", pathname: "/feedback", topic: "rating" },
  { label: "Send feedback", icon: "message-square", pathname: "/feedback" },
  { label: "About Kusinera", icon: "info", pathname: "/info", topic: "about" },
];

export default function SettingsRoute() {
  const glass = useMenuGlass();
  const router = useRouter();
  const { darkMode, setDarkMode } = useTheme();
  const { currentUser } = useAuth();

  function open({ pathname, topic }) {
    router.push({ pathname, params: { fromSettings: "1", ...(topic ? { topic } : {}) } });
  }

  return (
    <ScreenContainer glassBackground contentStyle={styles.page}>
      <View style={styles.header}>
        <Pressable accessibilityRole="button" accessibilityLabel="Back to menu" onPress={() => router.dismissTo("/")} style={styles.back}>
          <Feather name="arrow-left" size={21} color="#6D0808" />
        </Pressable>
        <Text accessibilityRole="header" style={styles.title}>Settings</Text>
      </View>

      <Text accessibilityRole="header" style={styles.sectionTitle}>Account</Text>
      <View style={[styles.card, glass.surface]}>
        <SettingsRow label="Edit profile" icon="user" onPress={() => open({ pathname: "/edit-profile" })} />
        {currentUser?.role === "customer" ? <SettingsRow label="Change password" icon="lock" divided onPress={() => open({ pathname: "/change-password" })} /> : null}
      </View>

      <Text accessibilityRole="header" style={styles.sectionTitle}>Preferences</Text>
      <View style={[styles.card, glass.surface]}>
        <View style={styles.row}>
          <Feather name="moon" size={18} color="#6D0808" />
          <Text style={[styles.label, styles.rowLabel]}>Dark mode</Text>
          <Switch accessibilityLabel="Dark mode" value={darkMode} onValueChange={setDarkMode} trackColor={{ false: "#DDD5D5", true: "#6D0808" }} thumbColor="#FFF8ED" />
        </View>
      </View>

      <Text accessibilityRole="header" style={styles.sectionTitle}>Help &amp; information</Text>
      <View style={[styles.card, glass.surface]}>
        {helpLinks.map((link, index) => (
          <SettingsRow key={link.label} label={link.label} icon={link.icon} divided={index > 0} onPress={() => open(link)} />
        ))}
      </View>
    </ScreenContainer>
  );
}

function SettingsRow({ label, icon, onPress, divided }) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={[styles.row, divided && styles.divided]}>
      <Feather name={icon} size={18} color="#6D0808" />
      <Text style={[styles.label, styles.rowLabel]}>{label}</Text>
      <Feather name="chevron-right" size={17} color="#6D0808" />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  page: { maxWidth: 430 },
  header: { flexDirection: "row", alignItems: "center", gap: 12, borderBottomWidth: 1, borderBottomColor: "#EADCCD", paddingBottom: 8 },
  back: sharedStyles.supportBack,
  title: { fontSize: 25, fontWeight: "700", color: "#6D0808" },
  sectionTitle: { marginTop: 18, marginBottom: 6, paddingHorizontal: 10, fontSize: 11, letterSpacing: 1, fontWeight: "600", textTransform: "uppercase", color: "#76665F" },
  card: { borderRadius: 12, overflow: "hidden" },
  row: { flexDirection: "row", alignItems: "center", gap: 11, minHeight: 46, padding: 11 },
  divided: { borderTopWidth: 1, borderTopColor: "#EADCCD" },
  label: { color: "#352925", fontSize: 14 },
  rowLabel: { flex: 1 },
});
