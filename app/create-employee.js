import sharedStyles from "../styles/sharedStyles";
import React, { useRef, useState } from "react";
import { Redirect, useRouter } from "expo-router";
import { Keyboard, Platform, StyleSheet } from "react-native";
import { Feather, Pressable, Text, TextInput, View } from "../components/Themed";
import ScreenContainer from "../components/ScreenContainer";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";
import { employeeRoles, prepareEmployee } from "../utils/employees";
import { glossyMenuTab, useMenuGlass } from "../styles/menuGlass";

const empty = { displayName: "", username: "", email: "", password: "", confirmPassword: "", role: "staff" };
export default function CreateEmployeeRoute() {
  const { currentUser } = useAuth();
  if (!currentUser) return <Redirect href="/login" />;
  if (currentUser.role !== "admin") return <Redirect href="/" />;
  return <EmployeeForm />;
}

function EmployeeForm() {
  const { currentUser } = useAuth();
  const glass = useMenuGlass();
  const router = useRouter();
  const [draft, setDraft] = useState(empty);
  const [showPassword, setShowPassword] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [created, setCreated] = useState(null);
  const pending = useRef(false);
  function change(key, value) { setDraft(current => ({ ...current, [key]: value })); setError(""); }
  async function submit() {
    if (pending.current) return;
    Keyboard.dismiss();
    const result = prepareEmployee(draft);
    if (result.error) { setError(result.error); return; }
    pending.current = true; setSaving(true); setError("");
    try {
      if (!supabase) throw new Error("Connect Supabase before creating employee accounts.");
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      const session = sessionData.session;
      if (sessionError || !session) throw new Error("Your session expired. Sign out and sign in as Admin again.");
      const { data: identity, error: identityError } = await supabase.auth.getUser(session.access_token);
      if (identityError || !identity.user) throw new Error("Your session expired. Sign out and sign in as Admin again.");
      if (identity.user.id !== currentUser?.id) throw new Error("This browser is signed in to a different account. Sign out, then sign in as Admin in this tab.");
      const { data, error } = await supabase.functions.invoke("create-employee", {
        body: result.employee, headers: { Authorization: "Bearer " + session.access_token },
      });
      if (error) {
        let message = "Couldn’t reach the account service. Check that create-employee is deployed, then try again.";
        if (error.context?.json) {
          const details = await error.context.json().catch(() => null);
          if (details?.error) message = details.error;
        }
        throw new Error(message);
      }
      if (!data?.employee?.id) throw new Error("Account confirmation is missing. Refresh Accounts before retrying.");
      setCreated(data.employee); setDraft(empty); setShowPassword(false);
    } catch (failure) { setError(failure.message || "Couldn’t create this employee account."); }
    finally { pending.current = false; setSaving(false); }
  }
  function field(key, label, icon, props = {}) {
    const password = key === "password" || key === "confirmPassword";
    return <View style={styles.field}><Text style={styles.label}>{label}</Text><View style={styles.inputRow}>
      <Feather name={icon} size={17} color="#9B8370" />
      <TextInput accessibilityLabel={label} editable={!saving} value={draft[key]} onChangeText={value => change(key, value)} autoCorrect={false} autoCapitalize="none" placeholderTextColor="#9B8370" style={styles.input} secureTextEntry={password && !showPassword} {...props} />
      {password ? <Pressable accessibilityRole="button" accessibilityLabel={showPassword ? "Hide passwords" : "Show passwords"} disabled={saving} onPress={() => setShowPassword(value => !value)} style={styles.eye}><Feather name={showPassword ? "eye-off" : "eye"} size={18} color="#6D0808" /></Pressable> : null}
    </View></View>;
  }
  return <ScreenContainer glassBackground keyboardShouldPersistTaps="handled" contentStyle={styles.page}>
    <View style={styles.top}><Pressable accessibilityRole="button" accessibilityLabel="Back to Admin accounts" disabled={saving} onPress={() => router.dismissTo("/admin")} style={[styles.back, glass.surface]}><Feather name="arrow-left" size={20} color="#6D0808" /></Pressable><Text style={styles.brand}>KUSINERA · ADMIN</Text></View>
    {created ? <View style={[styles.success, glass.surface]}>
      <View style={styles.successIcon}><Feather name="check" size={30} color="#23543A" /></View><Text accessibilityRole="header" style={styles.title}>Welcome to the team.</Text><Text style={styles.body}>The employee account is ready.</Text>
      <View style={styles.summary}><Text style={styles.name}>{created.display_name}</Text><Text selectable style={styles.body}>Username · {created.username}</Text><Text style={styles.roleName}>{created.role}</Text></View>
      <Text style={styles.body}>They can sign in with this username and the initial password you entered. Share their login details directly with them.</Text>
      <Pressable accessibilityRole="button" onPress={() => router.dismissTo("/admin")} style={[styles.primary, glossyMenuTab]}><Text style={styles.white}>Back to accounts</Text></Pressable>
      <Pressable accessibilityRole="button" onPress={() => setCreated(null)} style={styles.secondary}><Text style={styles.accent}>Create another employee</Text></Pressable>
    </View> : <>
      <View style={styles.hero}><View style={[styles.heroIcon, glass.surface]}><Feather name="user-plus" size={26} color="#6D0808" /></View><Text style={styles.eyebrow}>BUILD YOUR KITCHEN TEAM</Text><Text accessibilityRole="header" style={styles.title}>Create employee</Text><Text style={styles.body}>Give your team the access they need.</Text></View>
      <Text style={styles.section}>Choose a role</Text>
      <View style={styles.roles}>{employeeRoles.map(role => <Pressable key={role.value} accessibilityRole="radio" accessibilityState={{ checked: draft.role === role.value }} disabled={saving} onPress={() => change("role", role.value)} style={[styles.role, glass.surface, draft.role === role.value && styles.roleSelected]}>
        <Feather name={role.icon} size={21} color="#6D0808" /><Text style={styles.roleLabel}>{role.label}</Text>{draft.role === role.value ? <Feather name="check-circle" size={14} color="#6D0808" /> : <View style={styles.checkSpace} />}
      </Pressable>)}</View>
      <Text style={styles.hint}>{employeeRoles.find(role => role.value === draft.role)?.detail}</Text>
      <View style={[styles.card, glass.surface]}><View style={styles.cardHeading}><Feather name="user" size={18} color="#6D0808" /><Text style={styles.section}>Employee details</Text></View>
        {field("displayName", "Display name", "user", { placeholder: "e.g. Maria Santos", maxLength: 40, autoCapitalize: "words", textContentType: "name" })}
        {field("username", "Username", "at-sign", { placeholder: "e.g. maria.staff", maxLength: 32, textContentType: "username" })}
        <Text style={styles.hint}>Used to sign in. Each employee needs a unique username.</Text>
        {field("email", "Email address", "mail", { placeholder: "employee@example.com", maxLength: 254, keyboardType: "email-address", textContentType: "emailAddress" })}
      </View>
      <View style={[styles.card, glass.surface]}><View style={styles.cardHeading}><Feather name="lock" size={18} color="#6D0808" /><Text style={styles.section}>Login details</Text></View>
        {field("password", "Initial password", "lock", { placeholder: "At least 12 characters", maxLength: 72, textContentType: "newPassword" })}
        {field("confirmPassword", "Confirm password", "shield", { placeholder: "Enter the password again", maxLength: 72, textContentType: "newPassword" })}
        <Text style={styles.hint}>Use 12–72 characters, including a letter and a number. The account can sign in immediately after creation.</Text>
      </View>
      {error ? <View style={[styles.errorBox, glass.surface]}><Feather name="alert-circle" size={18} color="#B42318" /><Text accessibilityRole="alert" style={styles.error}>{error}</Text></View> : null}
      <Pressable accessibilityRole="button" disabled={saving} onPress={submit} style={[styles.primary, glossyMenuTab, saving && styles.saving]}><Feather name="user-plus" size={18} color="#FFFAF0" /><Text style={styles.white}>{saving ? "Creating account…" : "Create employee account"}</Text></Pressable>
      <Text style={styles.footer}>Employee accounts are managed by Admin.</Text>
    </>}
  </ScreenContainer>;
}

const serif = Platform.select({ ios: "Georgia", web: "Georgia", default: "serif" });
const styles = StyleSheet.create({
  page: { maxWidth: 480 },
  top: { flexDirection: "row", alignItems: "center", gap: 13 },
  back: sharedStyles.glassBack,
  brand: { color: "#6D0808", fontSize: 11, fontWeight: "700", letterSpacing: 1.4 },
  hero: { alignItems: "center", gap: 10, paddingVertical: 26 },
  heroIcon: { width: 62, height: 62, borderRadius: 22, alignItems: "center", justifyContent: "center", marginBottom: 6 },
  eyebrow: { color: "#9B8370", fontSize: 9, letterSpacing: 1.6 },
  title: { color: "#6D0808", fontFamily: serif, fontSize: 30, textAlign: "center" },
  body: { color: "#625B5B", fontSize: 13, lineHeight: 21 },
  section: { color: "#292323", fontSize: 15, fontWeight: "700" },
  roles: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 12 },
  role: { flex: 1, minWidth: 85, minHeight: 104, alignItems: "center", justifyContent: "center", gap: 8, borderRadius: 18, padding: 12 },
  roleSelected: { backgroundColor: "#F8ECE8", borderColor: "#6D08084D", borderWidth: 1.5 },
  roleLabel: { color: "#6D0808", fontSize: 12, fontWeight: "700" },
  checkSpace: { height: 14 },
  hint: { color: "#625B5B", fontSize: 11, lineHeight: 18, marginTop: 5 },
  card: { borderRadius: 22, padding: 18, gap: 12, marginTop: 16 },
  cardHeading: { flexDirection: "row", alignItems: "center", gap: 9, marginBottom: 3 },
  field: { gap: 7 }, label: { color: "#292323", fontSize: 12, fontWeight: "600" },
  inputRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 12, borderRadius: 13, borderWidth: 1, borderColor: "#D9C9B8", minHeight: 48 },
  input: { flex: 1, minWidth: 0, fontSize: 16, color: "#292323", paddingVertical: 12 },
  eye: { minWidth: 32, minHeight: 44, alignItems: "center", justifyContent: "center" },
  primary: { minHeight: 50, borderRadius: 17, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 9, marginTop: 20, paddingHorizontal: 15 },
  white: sharedStyles.formPrimaryLabel,
  saving: { opacity: 0.65 },
  footer: { color: "#9B8370", fontSize: 11, textAlign: "center", marginTop: 14 },
  errorBox: { flexDirection: "row", alignItems: "flex-start", gap: 9, padding: 14, borderRadius: 14, marginTop: 16 },
  error: { color: "#B42318", fontSize: 13, lineHeight: 20, flex: 1 },
  success: { borderRadius: 24, padding: 22, marginTop: 28, gap: 14 },
  successIcon: { width: 62, height: 62, borderRadius: 31, alignSelf: "center", backgroundColor: "#E4F4E8", alignItems: "center", justifyContent: "center" },
  summary: { borderTopWidth: StyleSheet.hairlineWidth, borderBottomWidth: StyleSheet.hairlineWidth, borderColor: "#D9C9B8", paddingVertical: 16, gap: 6 },
  name: { color: "#292323", fontSize: 18, fontWeight: "700" },
  roleName: { color: "#6D0808", fontSize: 12, textTransform: "capitalize" },
  secondary: { minHeight: 44, alignItems: "center", justifyContent: "center" },
  accent: { color: "#6D0808", fontSize: 13, fontWeight: "700" },
});
