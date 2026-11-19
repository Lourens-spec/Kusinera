import sharedStyles from "../styles/sharedStyles";
import React, { useEffect, useRef, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Keyboard, Platform, StyleSheet } from "react-native";
import { Feather, Pressable, Text, TextInput, View } from "../components/Themed";
import ScreenContainer from "../components/ScreenContainer";
import { glossyMenuTab, useMenuGlass } from "../styles/menuGlass";
import { useAuth } from "../context/AuthContext";
import { resendSignupCode, verifyCustomerEmail } from "../lib/emailVerification";

export default function VerifyEmailRoute() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const glass = useMenuGlass();
  const { setMessage } = useAuth();
  const [email, setEmail] = useState(typeof params.email === "string" ? params.email : "");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState("");
  const [cooldown, setCooldown] = useState(params.noCodeSent === "1" ? 0 : 60);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const lock = useRef(false);
  useEffect(() => { const timer = setInterval(() => setCooldown(value => Math.max(0, value - 1)), 1000); return () => clearInterval(timer); }, []);
  function goToLogin() {
    router.replace({ pathname: "/login", params: { dishId: params.dishId, fromCart: params.fromCart, fromProfile: params.fromProfile, fromFavorites: params.fromFavorites, fromTracking: params.fromTracking } });
  }
  async function submit() {
    if (lock.current) return;
    lock.current = true; setBusy("verify"); setError(""); setStatus(""); Keyboard.dismiss();
    try {
      await verifyCustomerEmail(email, code);
      setMessage("Email verified. You can now sign in with your username and password.");
      goToLogin();
    } catch (failure) { setError(failure.message || "Couldn’t verify your email."); }
    finally { lock.current = false; setBusy(""); }
  }
  async function resend() {
    if (lock.current || cooldown > 0) return;
    lock.current = true; setBusy("resend"); setError(""); setStatus("");
    try { await resendSignupCode(email); setCooldown(60); setStatus("If this address has an unconfirmed signup, a new code was requested. Check your inbox and spam folder."); }
    catch (failure) { setError(failure.message || "Couldn’t resend the code."); }
    finally { lock.current = false; setBusy(""); }
  }
  return <ScreenContainer glassBackground keyboardShouldPersistTaps="handled" contentStyle={styles.page}>
    <View style={styles.top}><Pressable accessibilityRole="button" accessibilityLabel="Back to login" disabled={Boolean(busy)} onPress={goToLogin} style={[styles.back, glass.surface]}><Feather name="arrow-left" size={20} color="#6D0808" /></Pressable><Text style={styles.brand}>KUSINERA</Text></View>
    <View style={styles.hero}><View style={[styles.envelope, glass.surface]}><Feather name="mail" size={30} color="#6D0808" /></View><Text style={styles.eyebrow}>A LITTLE CLOSER TO HOME</Text><Text accessibilityRole="header" style={styles.title}>Check your inbox.</Text><Text style={styles.intro}>Enter the verification code from your signup email to confirm your account.</Text></View>
    <View style={[styles.card, glass.surface]}>
      <Text style={styles.label}>Your signup email</Text><TextInput accessibilityLabel="Signup email address" value={email} editable={!busy} onChangeText={value => { setEmail(value); setCode(""); setCooldown(0); setError(""); setStatus(""); }} placeholder="you@example.com" placeholderTextColor="#9B8370" keyboardType="email-address" autoCapitalize="none" autoCorrect={false} maxLength={254} style={styles.input} />
      <Text style={styles.label}>Verification code</Text><TextInput accessibilityLabel="Email verification code" value={code} editable={!busy} onChangeText={value => { setCode(value.replace(/\D/g, "")); setError(""); }} keyboardType="number-pad" autoComplete="one-time-code" textContentType="oneTimeCode" placeholder="Enter your code" placeholderTextColor="#9B8370" maxLength={10} style={[styles.input, styles.code]} />
      <Text style={styles.hint}>Use the latest code. If it has expired, request another below.</Text>
      {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
      {status ? <Text accessibilityLiveRegion="polite" style={styles.hint}>{status}</Text> : null}
      <Pressable accessibilityRole="button" disabled={Boolean(busy)} onPress={submit} style={[styles.primary, glossyMenuTab]}><Text style={styles.white}>{busy === "verify" ? "Verifying…" : "Verify email"}</Text><Feather name="arrow-right" size={18} color="#FFFAF0" /></Pressable>
      <Pressable accessibilityRole="button" disabled={Boolean(busy) || cooldown > 0} onPress={resend} style={styles.resend}><Text style={[styles.resendLabel, (busy || cooldown > 0) && styles.dim]}>{busy === "resend" ? "Requesting code…" : cooldown > 0 ? "Resend code in " + cooldown + "s" : "Send a new code"}</Text></Pressable>
    </View>
    <Text style={styles.footer}>Your account becomes ready after email confirmation.</Text>
  </ScreenContainer>;
}
const styles = StyleSheet.create({
  page: { maxWidth: 430 }, top: { flexDirection: "row", alignItems: "center", gap: 14 },
  back: sharedStyles.glassBack,
  brand: { color: "#6D0808", fontSize: 16, fontWeight: "700", letterSpacing: 2 },
  hero: { alignItems: "center", paddingVertical: 28, gap: 12 },
  envelope: { width: 68, height: 68, borderRadius: 24, alignItems: "center", justifyContent: "center", marginBottom: 7 },
  eyebrow: { color: "#9B8370", fontSize: 9, letterSpacing: 1.5 },
  title: { color: "#6D0808", fontFamily: Platform.OS === "ios" ? "Georgia" : "serif", fontSize: 32, textAlign: "center" },
  intro: { color: "#625B5B", fontSize: 13, lineHeight: 21, textAlign: "center", maxWidth: 310 },
  card: { padding: 22, borderRadius: 24, gap: 12 }, label: { color: "#292323", fontSize: 13, fontWeight: "600" },
  input: { minHeight: 50, borderWidth: 1, borderColor: "#D9C9B8", borderRadius: 13, paddingHorizontal: 14, fontSize: 16, color: "#292323" },
  code: { textAlign: "center", fontSize: 19, letterSpacing: 2 }, hint: { color: "#625B5B", fontSize: 12, lineHeight: 19 },
  primary: { minHeight: 50, borderRadius: 15, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, paddingHorizontal: 14 },
  white: sharedStyles.formPrimaryLabel, resend: { minHeight: 44, alignItems: "center", justifyContent: "center" },
  resendLabel: sharedStyles.logoutLabel, dim: { opacity: 0.5 },
  error: { color: "#B42318", fontSize: 13, lineHeight: 20 }, footer: { color: "#9B8370", fontSize: 11, lineHeight: 18, textAlign: "center", marginTop: 18 },
});
