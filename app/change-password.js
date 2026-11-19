import sharedStyles from "../styles/sharedStyles";
import React, { useEffect, useRef, useState } from "react";
import { Redirect, useLocalSearchParams, useRouter } from "expo-router";
import { Keyboard, Platform, StyleSheet } from "react-native";
import { Feather, Pressable, Text, TextInput, View } from "../components/Themed";
import ScreenContainer from "../components/ScreenContainer";
import { useAuth } from "../context/AuthContext";
import { changeCustomerPassword } from "../lib/passwords";
import { glossyMenuTab, useMenuGlass } from "../styles/menuGlass";

export default function ChangePasswordRoute() {
  const { currentUser } = useAuth();
  if (!currentUser) return <Redirect href="/login" />;
  if (currentUser.role !== "customer") return <Redirect href={currentUser.role === "admin" ? "/admin" : currentUser.role === "rider" ? "/rider" : "/kitchen"} />;
  return <PasswordForm key={currentUser.id || currentUser.username} account={currentUser} />;
}

function PasswordForm({ account }) {
  const glass = useMenuGlass();
  const router = useRouter();
  const { fromSettings } = useLocalSearchParams();
  const [draft, setDraft] = useState({ current: "", password: "", confirmation: "" });
  const [visible, setVisible] = useState({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const pending = useRef(false);
  const scrollView = useRef(null);
  const focusedField = useRef(null);
  const [keyboardOpen, setKeyboardOpen] = useState(false);
  function revealField() {
    if (focusedField.current === "current") scrollView.current?.scrollTo({ y: 0, animated: true });
    else if (focusedField.current) scrollView.current?.scrollToEnd({ animated: true });
  }
  useEffect(() => {
    const show = Keyboard.addListener("keyboardDidShow", () => { setKeyboardOpen(true); requestAnimationFrame(revealField); });
    const hide = Keyboard.addListener("keyboardDidHide", () => setKeyboardOpen(false));
    return () => { show.remove(); hide.remove(); };
  }, []);
  function back() { router.dismissTo(fromSettings === "1" ? "/settings" : "/profile"); }
  async function save() {
    if (pending.current) return;
    pending.current = true; setSaving(true); setError(""); Keyboard.dismiss();
    try {
      await changeCustomerPassword(account.id, draft.current, draft.password, draft.confirmation);
      setDraft({ current: "", password: "", confirmation: "" }); setVisible({}); setSuccess(true);
    } catch (failure) { setError(failure.message || "Couldn’t change your password."); }
    finally { pending.current = false; setSaving(false); }
  }
  function field(key, label, placeholder) {
    return <View style={styles.field}><Text style={styles.label}>{label}</Text><View style={styles.inputRow}>
      <Feather name="lock" size={17} color="#9B8370" />
      <TextInput onFocus={() => { focusedField.current = key; requestAnimationFrame(revealField); }} returnKeyType={key === "confirmation" ? "done" : "next"} onSubmitEditing={key === "confirmation" ? Keyboard.dismiss : undefined} accessibilityLabel={label} value={draft[key]} editable={!saving} onChangeText={value => { setDraft(current => ({ ...current, [key]: value })); setError(""); }} secureTextEntry={!visible[key]} autoCorrect={false} autoCapitalize="none" autoComplete={key === "current" ? "current-password" : "new-password"} textContentType={key === "current" ? "password" : "newPassword"} placeholder={placeholder} placeholderTextColor="#9B8370" maxLength={key === "current" ? 256 : 72} style={styles.input} />
      <Pressable accessibilityRole="button" accessibilityLabel={(visible[key] ? "Hide " : "Show ") + label.toLowerCase()} disabled={saving} onPress={() => setVisible(current => ({ ...current, [key]: !current[key] }))} style={styles.eye}><Feather name={visible[key] ? "eye-off" : "eye"} size={18} color="#6D0808" /></Pressable>
    </View></View>;
  }
  return <ScreenContainer glassBackground keyboardAvoiding scrollViewRef={scrollView} onScrollLayout={() => { if (keyboardOpen) requestAnimationFrame(revealField); }} keyboardShouldPersistTaps="handled" contentStyle={styles.page}>
    <View style={styles.top}><Pressable accessibilityRole="button" accessibilityLabel="Back to account" disabled={saving} onPress={back} style={[styles.back, glass.surface]}><Feather name="arrow-left" size={20} color="#6D0808" /></Pressable><Text style={styles.brand}>KUSINERA · YOUR ACCOUNT</Text></View>
    <View style={[styles.hero, keyboardOpen && styles.compactHero]}>{!keyboardOpen ? <View style={[styles.heroIcon, glass.surface]}><Feather name={success ? "check" : "shield"} size={28} color={success ? "#23543A" : "#6D0808"} /></View> : null}<Text accessibilityRole="header" style={styles.title}>{success ? "Password updated." : "Change password"}</Text>{!keyboardOpen ? <Text style={styles.intro}>{success ? "Use your new password the next time you sign in." : "Keep your account personal and protected."}</Text> : null}</View>
    {success ? <Pressable accessibilityRole="button" onPress={back} style={[styles.primary, glossyMenuTab]}><Text style={styles.white}>{fromSettings === "1" ? "Back to Settings" : "Back to profile"}</Text></Pressable> : <>
      <View style={[styles.card, glass.surface]}>
        {field("current", "Current password", "Enter your current password")}
        <View style={styles.divider} />
        {field("password", "New password", "Choose a new password")}
        {field("confirmation", "Confirm new password", "Enter the new password again")}
        <Text style={styles.hint}>Use 8–72 characters. Choose one different from your current password.</Text>
      </View>
      {error ? <View style={[styles.errorBox, glass.surface]}><Feather name="alert-circle" size={18} color="#B42318" /><Text accessibilityRole="alert" style={styles.error}>{error}</Text></View> : null}
      <Pressable accessibilityRole="button" disabled={saving} onPress={save} style={[styles.primary, glossyMenuTab, saving && styles.disabled]}><Feather name="lock" size={17} color="#FFFAF0" /><Text style={styles.white}>{saving ? "Updating password…" : "Update password"}</Text></Pressable>
      <Pressable accessibilityRole="button" disabled={saving} onPress={back} style={styles.cancel}><Text style={styles.cancelText}>Cancel</Text></Pressable>
    </>}
  </ScreenContainer>;
}
const styles = StyleSheet.create({
  page: { maxWidth: 450 }, top: { flexDirection: "row", alignItems: "center", gap: 12 },
  back: sharedStyles.glassBack,
  brand: { color: "#6D0808", fontSize: 10, fontWeight: "700", letterSpacing: 1.4 },
  hero: { alignItems: "center", paddingVertical: 28, gap: 12 },
  compactHero: { paddingVertical: 12, gap: 0 },
  heroIcon: { width: 66, height: 66, borderRadius: 23, alignItems: "center", justifyContent: "center", marginBottom: 5 },
  title: { color: "#6D0808", fontFamily: Platform.OS === "ios" ? "Georgia" : "serif", fontSize: 30, textAlign: "center" },
  intro: { color: "#625B5B", fontSize: 13, lineHeight: 21, textAlign: "center" },
  card: { padding: 20, borderRadius: 23, gap: 17 }, field: { gap: 7 },
  label: { color: "#292323", fontSize: 12, fontWeight: "600" },
  inputRow: { flexDirection: "row", alignItems: "center", gap: 9, borderWidth: 1, borderColor: "#D9C9B8", borderRadius: 13, minHeight: 50, paddingHorizontal: 12 },
  input: { flex: 1, minWidth: 0, paddingVertical: 12, color: "#292323", fontSize: 16 },
  eye: { minWidth: 32, minHeight: 44, alignItems: "center", justifyContent: "center" },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: "#D9C9B8" }, hint: { color: "#625B5B", fontSize: 11, lineHeight: 18 },
  primary: { minHeight: 50, borderRadius: 16, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 9, paddingHorizontal: 16, marginTop: 20 },
  white: sharedStyles.formPrimaryLabel, disabled: { opacity: 0.6 },
  cancel: { minHeight: 44, alignItems: "center", justifyContent: "center", marginTop: 8 }, cancelText: sharedStyles.logoutLabel,
  errorBox: { flexDirection: "row", alignItems: "flex-start", gap: 9, borderRadius: 14, padding: 14, marginTop: 14 }, error: { color: "#B42318", fontSize: 13, lineHeight: 20, flex: 1 },
});
