import { Pressable, Text, View } from "../components/Themed";
import sharedStyles from "../styles/sharedStyles";
import { authForm } from "../styles/menuGlass";
import React, { useState } from "react";
import { Platform, StyleSheet, useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AuthInput from "../components/authInput";
import AuthLayout, { AuthDivider, AuthSubmit } from "../components/AuthLayout";
import { useTheme } from "../context/ThemeContext";

export default function RegisterScreen({ accounts, goToLogin, onRegisterSuccess, goToWelcome }) {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { darkMode } = useTheme();

  const { height } = useWindowDimensions();
  const { top, bottom } = useSafeAreaInsets();
  const compact = height - top - bottom < 840;
  const layout = {
    ...styles,
    form: [styles.form, darkMode ? authForm.dark : authForm.light, compact && styles.compactForm],
    ...(compact && {
      header: [styles.header, styles.compactHeader],
      top: [styles.top, styles.compactTop],
      divider: [styles.divider, styles.compactDivider],
      footer: [styles.footer, styles.compactFooter],
    }),
  };

  async function handleRegister() {
    if (submitting) return;
    const cleanEmail = email.trim().toLowerCase();
    const cleanUsername = username.trim();

    if (!cleanEmail || !cleanUsername || !password || !confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setError("Please enter a valid email address.");
      return;
    }
    if (password.length < 8) {
      setError("Your password must have at least 8 characters.");
      return;
    }
    if (cleanUsername.length > 64) {
      setError("Your username must be 64 characters or fewer.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    const accountExists = accounts.some(
      (user) => user.email === cleanEmail
        || user.username.toLowerCase() === cleanUsername.toLowerCase()
    );
    if (accountExists) {
      setError("That email or username is already registered.");
      return;
    }

    setError("");
    setSubmitting(true);
    try {
      await onRegisterSuccess({ email: cleanEmail, username: cleanUsername, password });
    } catch (error) {
      setError(error.message || "Couldn’t register. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthLayout styles={layout} bounces={false} goToWelcome={goToWelcome} header={
      <>
        <Text style={styles.eyebrow}>A SEAT AT OUR TABLE</Text>
        <Text accessibilityRole="header" style={[styles.title, compact && styles.compactTitle]}>Let’s create{"\n"}<Text style={styles.italic}>your account.</Text></Text>
        <Text style={styles.subtitle}>A little closer to your favorite meals.</Text>
      </>
    }>
      <AuthDivider styles={layout} label="YOUR DETAILS" />
      <AuthInput compact={compact} label="Email address" icon="mail-outline" warm placeholder="you@example.com" value={email} onChangeText={setEmail} keyboardType="email-address" />
      <AuthInput compact={compact} label="Username" icon="person-outline" warm placeholder="Choose your username" value={username} onChangeText={setUsername} />
      <AuthInput compact={compact} label="Password" icon="lock-closed-outline" warm placeholder="At least 8 characters" value={password} onChangeText={setPassword} secureTextEntry />
      <AuthInput compact={compact} label="Confirm password" icon="lock-closed-outline" warm placeholder="Re-enter your password" value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry />
      <Text style={[styles.note, compact && styles.compactNote]}>Good food starts with a warm welcome.</Text>
      {!!error && <Text accessibilityRole="alert" style={styles.error}>{error}</Text>}
      <AuthSubmit styles={styles} onPress={handleRegister} label={submitting ? "Creating account…" : "Create account"} />
      <View style={[styles.loginRow, compact && styles.compactLoginRow]}>
        <Text style={styles.loginText}>Already part of the table?</Text>
        <Pressable accessibilityRole="button" onPress={goToLogin} style={styles.login}><Text style={styles.link}>Log in</Text></Pressable>
      </View>
    </AuthLayout>
  );
}

const serif = Platform.select({ android: "serif", ios: "Georgia", web: "Georgia, serif" });

const styles = StyleSheet.create({
  background: { flex: 1, backgroundColor: "#FFF8ED" },
  fill: { flex: 1 },
  scroll: { flexGrow: 1 },
  page: { width: "100%", maxWidth: 430, alignSelf: "center", flexGrow: 1 },
  header: { flexGrow: 0.55, justifyContent: "space-between", backgroundColor: "#6D0808", borderBottomRightRadius: 48, padding: 27, paddingBottom: 30 },
  top: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 22, gap: 10 },
  brand: sharedStyles.authBrand,
  close: sharedStyles.authClose,
  eyebrow: { color: "#EBC9B5", fontSize: 10, letterSpacing: 2 },
  title: { color: "#FFF8ED", fontFamily: serif, fontSize: 36, lineHeight: 41, letterSpacing: -0.6, marginTop: 12, marginBottom: 14 },
  italic: sharedStyles.authItalic,
  subtitle: { color: "#EED9CE", fontSize: 12, lineHeight: 19 },
  form: { flexGrow: 0.45, justifyContent: "space-between", padding: 27 },
  divider: sharedStyles.authDivider,
  line: sharedStyles.authLine,
  details: { color: "#967B65", fontSize: 10, letterSpacing: 1.6 },
  note: { color: "#8B7766", fontSize: 11, lineHeight: 18, marginBottom: 20 },
  error: { color: "#B42318", fontSize: 13, lineHeight: 20, marginBottom: 12 },
  submit: { minHeight: 48, padding: 14, borderRadius: 15, backgroundColor: "#6D0808", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 13 },
  submitLabel: sharedStyles.creamButtonLabel,
  loginRow: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center", alignItems: "center", marginTop: 12, gap: 4 },
  loginText: { color: "#76665F", fontSize: 12 },
  login: { minHeight: 44, justifyContent: "center", paddingHorizontal: 5 },
  link: { color: "#6D0808", fontWeight: "700", fontSize: 12, textDecorationLine: "underline" },
  footer: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 22 },
  footerLabel: sharedStyles.authFooterLabel,
  compactHeader: { paddingVertical: 14 },
  compactTop: { marginBottom: 7 },
  compactTitle: { fontSize: 28, lineHeight: 32, marginTop: 5, marginBottom: 6 },
  compactForm: { paddingVertical: 12 },
  compactDivider: { marginBottom: 10 },
  compactNote: { marginBottom: 7 },
  compactLoginRow: { marginTop: 3 },
  compactFooter: { marginTop: 5 },
});
