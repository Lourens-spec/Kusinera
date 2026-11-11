import { Pressable, Text, View, Feather, MaterialCommunityIcons } from "../components/Themed";
import sharedStyles from "../styles/sharedStyles";
import { authForm } from "../styles/menuGlass";
import React, { useState } from "react";
import { Platform, StyleSheet, useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AuthInput from "../components/authInput";
import AuthLayout, { AuthDivider, AuthSubmit } from "../components/AuthLayout";
import { useTheme } from "../context/ThemeContext";

export default function LoginScreen({ accounts, message, goToRegister, onLoginSuccess, goToHome, goToWelcome }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { darkMode } = useTheme();

  const { height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const compact = height - insets.top - insets.bottom < 880;
  const layout = {
    ...styles,
    form: [styles.form, darkMode ? authForm.dark : authForm.light, compact && styles.compactForm],
    ...(compact && {
      header: [styles.header, styles.compactHeader],
      submit: [styles.submit, styles.compactSubmit],
      divider: [styles.divider, styles.compactDivider],
      footer: [styles.footer, styles.compactFooter],
    }),
  };

  function handleLogin() {
    if (!username.trim() || !password) {
      setError("Please enter your username and password.");
      return;
    }

    const account = accounts.find(
      (user) => user.username.toLowerCase() === username.trim().toLowerCase()
        && user.password === password
    );
    if (!account) {
      setError("Incorrect username or password.");
      return;
    }

    setError("");
    onLoginSuccess(account);
  }

  return (
    <AuthLayout styles={layout} bounces={false} goToWelcome={goToWelcome} header={
      <>
        <View style={[styles.art, compact && styles.compactArt]} accessible={false} importantForAccessibility="no-hide-descendants">
          <View style={[styles.ring, compact && styles.compactRing]}><MaterialCommunityIcons name="pot-steam-outline" size={compact ? 53 : 70} color="#6D0808" /></View>
          <View style={[styles.token, styles.leaf]}><Feather name="feather" size={17} color="#6D0808" /></View>
          <View style={[styles.token, styles.heart]}><Feather name="heart" size={17} color="#6D0808" /></View>
        </View>
        <Text style={styles.eyebrow}>THE FILIPINO TABLE</Text>
        <Text accessibilityRole="header" style={[styles.title, compact && styles.compactTitle]}>Welcome <Text style={styles.italic}>home.</Text></Text>
        <Text style={styles.subtitle}>Your favorite flavors are waiting.</Text>
      </>
    }>
      <AuthDivider styles={layout} label="LOG IN TO KUSINERA" />
      {!!message && <Text accessibilityLiveRegion="polite" style={styles.success}>{message}</Text>}
      <AuthInput compact={compact} label="Username" icon="person-outline" warm placeholder="Enter your username" value={username} onChangeText={setUsername} />
      <AuthInput compact={compact} label="Password" icon="lock-closed-outline" warm placeholder="Enter your password" value={password} onChangeText={setPassword} secureTextEntry />
      {!!error && <Text accessibilityRole="alert" style={styles.error}>{error}</Text>}
      <AuthSubmit styles={layout} onPress={handleLogin} label="Log in" />
      <AuthDivider styles={layout} label="NEW TO OUR TABLE?" style={[styles.newHere, compact && styles.compactNewHere]} />
      <Pressable accessibilityRole="button" onPress={goToRegister} style={[styles.register, compact && styles.compactRegister]}><Text style={styles.link}>Create an account</Text></Pressable>
      <Pressable accessibilityRole="button" onPress={goToHome} style={[styles.browse, compact && styles.compactBrowse]}><Text style={styles.browseLabel}>Browse the menu first</Text></Pressable>
    </AuthLayout>
  );
}

const serif = Platform.select({ android: "serif", ios: "Georgia", web: "Georgia, serif" });

const styles = StyleSheet.create({
  background: { flex: 1, backgroundColor: "#6D0808" },
  fill: { flex: 1 },
  scroll: { flexGrow: 1, backgroundColor: "#FFF8ED" },
  page: { width: "100%", maxWidth: 430, alignSelf: "center", backgroundColor: "#6D0808", flexGrow: 1 },
  header: { flexGrow: 0.55, justifyContent: "space-between", padding: 27, paddingTop: 23, alignItems: "center" },
  top: { width: "100%", flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 10 },
  brand: sharedStyles.authBrand,
  close: sharedStyles.authClose,
  art: { width: 156, height: 156, marginTop: 10, marginBottom: 22, alignItems: "center", justifyContent: "center" },
  ring: { width: 140, height: 140, borderRadius: 70, borderWidth: 6, borderColor: "#EBCFA5", backgroundColor: "#F5DFBA", alignItems: "center", justifyContent: "center" },
  token: { position: "absolute", width: 35, height: 35, borderRadius: 18, backgroundColor: "#FFF1DA", alignItems: "center", justifyContent: "center" },
  leaf: { right: 0, top: 9, transform: [{ rotate: "22deg" }] },
  heart: { left: 0, bottom: 9, transform: [{ rotate: "-18deg" }] },
  eyebrow: { color: "#EBC9B5", fontSize: 10, letterSpacing: 2.2, textAlign: "center" },
  title: { color: "#FFF8ED", fontFamily: serif, fontSize: 34, textAlign: "center", marginVertical: 10 },
  italic: sharedStyles.authItalic,
  subtitle: { color: "#EED9CE", fontSize: 12, lineHeight: 19, textAlign: "center" },
  form: { borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 27, paddingTop: 28, flexGrow: 0.45, justifyContent: "space-between" },
  divider: sharedStyles.authDivider,
  line: sharedStyles.authLine,
  details: { color: "#967B65", fontSize: 10, letterSpacing: 1 },
  error: sharedStyles.authError,
  success: { color: "#27613B", marginBottom: 16, lineHeight: 20 },
  submit: { minHeight: 48, padding: 14, borderRadius: 15, backgroundColor: "#6D0808", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 13, marginTop: 7 },
  submitLabel: sharedStyles.creamButtonLabel,
  newHere: { marginTop: 23, marginBottom: 17 },
  register: { minHeight: 48, borderRadius: 15, borderWidth: 1, borderColor: "#6D08082E", backgroundColor: "#E0E6F8", padding: 14, alignItems: "center", justifyContent: "center" },
  link: sharedStyles.price,
  browse: { minHeight: 44, marginTop: 8, alignItems: "center", justifyContent: "center" },
  browseLabel: sharedStyles.guestLink,
  footer: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 14 },
  footerLabel: sharedStyles.authFooterLabel,
  compactHeader: { paddingTop: 8, paddingBottom: 13 },
  compactForm: { paddingTop: 16, paddingBottom: 8 },
  compactArt: { width: 118, height: 118, marginTop: 5, marginBottom: 9 },
  compactRing: { width: 105, height: 105, borderRadius: 53, borderWidth: 4 },
  compactDivider: { marginBottom: 10 },
  compactNewHere: { marginTop: 10, marginBottom: 7 },
  compactFooter: { marginTop: 5 },
  compactTitle: { fontSize: 27, marginVertical: 4 },
  compactSubmit: { marginTop: 2 },
  compactRegister: { marginTop: 8 },
  compactBrowse: { marginTop: 0 },
});
