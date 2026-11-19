import sharedStyles from "../styles/sharedStyles";
import React, { useState } from "react";
import { Linking, Platform, StyleSheet } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Feather, Pressable, Text, View } from "../components/Themed";
import ScreenContainer from "../components/ScreenContainer";
import { glossyMenuTab, useMenuGlass } from "../styles/menuGlass";
import { restaurantContact } from "../data/restaurantContact";

export default function ContactRoute() {
  const glass = useMenuGlass();
  const router = useRouter();
  const { fromSettings } = useLocalSearchParams();
  const [error, setError] = useState("");
  function back() { router.dismissTo(fromSettings === "1" ? "/settings" : "/"); }
  async function open(url, kind) {
    setError("");
    try { await Linking.openURL(url); }
    catch { setError("Couldn’t open your " + kind + " app. Please use the contact details shown below."); }
  }
  return <ScreenContainer glassBackground scrollStyle={styles.scroll} contentStyle={styles.content}>
    <View style={styles.topbar}>
      <Pressable accessibilityRole="button" accessibilityLabel={fromSettings === "1" ? "Back to Settings" : "Back to menu"} onPress={back} style={[styles.back, glass.surface]}><Feather name="arrow-left" size={20} color="#6D0808" /></Pressable>
      <Text style={styles.wordmark}>KUSINERA</Text><View style={styles.topSpacer} />
    </View>
    <View style={styles.hero}><View style={[styles.heroIcon, glass.surface]}><Feather name="message-circle" size={28} color="#6D0808" /></View>
      <Text style={styles.eyebrow}>FROM OUR KITCHEN, WITH CARE</Text>
      <Text accessibilityRole="header" style={styles.title}>Let’s stay in touch.</Text>
      <Text style={styles.intro}>Questions about your order?{ "\n" }We’re here to help.</Text>
    </View>
    <View style={[styles.quickActions, glass.surface]}>
      <Text style={styles.sectionTitle}>Contact us</Text>
      <Text style={styles.muted}>Choose what works best for you.</Text>
      <View style={styles.buttons}>
        <Pressable accessibilityRole="button" accessibilityLabel="Call Kusinera" onPress={() => open("tel:" + restaurantContact.phone, "phone")} style={[styles.button, glossyMenuTab]}><Feather name="phone" size={17} color="#FFFAF0" /><Text style={styles.buttonText}>Call us</Text></Pressable>
        <Pressable accessibilityRole="button" accessibilityLabel="Email Kusinera" onPress={() => open("mailto:" + restaurantContact.email, "email")} style={[styles.button, styles.emailButton]}><Feather name="mail" size={17} color="#6D0808" /><Text style={styles.emailButtonText}>Email us</Text></Pressable>
      </View>
    </View>
    <View style={[styles.details, glass.surface]}>
      <ContactRow icon="phone" label="PHONE" value={restaurantContact.phone} hint="Tap to call" onPress={() => open("tel:" + restaurantContact.phone, "phone")} />
      <ContactRow icon="mail" label="EMAIL" value={restaurantContact.email} hint="Tap to compose an email" onPress={() => open("mailto:" + restaurantContact.email, "email")} />
      <ContactRow icon="clock" label="OPENING HOURS" value={restaurantContact.hours} />
      <ContactRow icon="map-pin" label="DELIVERY AREA" value="Cagayan de Oro City" hint="Choose your barangay in Tray at checkout." last />
    </View>
    {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
    <View style={styles.footer}><Feather name="heart" size={14} color="#9B8370" /><Text style={styles.footerText}>Good food. A little closer to home.</Text></View>
  </ScreenContainer>;
}

function ContactRow({ icon, label, value, hint, onPress, last }) {
  const content = <>
    <View style={styles.icon}><Feather name={icon} size={19} color="#6D0808" /></View>
    <View style={styles.copy}><Text style={styles.label}>{label}</Text><Text style={styles.value}>{value}</Text>{hint ? <Text style={styles.hint}>{hint}</Text> : null}</View>
    {onPress ? <Feather name="chevron-right" size={16} color="#9B8370" /> : null}
  </>;
  const rowStyle = [styles.row, !last && styles.divider];
  return onPress ? <Pressable accessibilityRole="button" accessibilityLabel={label + ": " + value} accessibilityHint={hint} onPress={onPress} style={({ pressed }) => [rowStyle, pressed && styles.pressed]}>{content}</Pressable>
    : <View style={rowStyle}>{content}</View>;
}

const serif = Platform.select({ ios: "Georgia", web: "Georgia", default: "serif" });
const styles = StyleSheet.create({
  scroll: { padding: 22, paddingBottom: 28 },
  content: { maxWidth: 480 },
  topbar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  back: sharedStyles.glassBack,
  topSpacer: { width: 44 },
  wordmark: { fontFamily: serif, color: "#6D0808", fontSize: 18, fontWeight: "700", letterSpacing: 2 },
  hero: { alignItems: "center", paddingTop: 28, paddingBottom: 26, gap: 12 },
  heroIcon: { width: 64, height: 64, borderRadius: 23, alignItems: "center", justifyContent: "center", marginBottom: 5 },
  eyebrow: { color: "#9B8370", fontSize: 9, letterSpacing: 1.6, textAlign: "center" },
  title: { color: "#6D0808", fontFamily: serif, fontSize: 31, lineHeight: 38, textAlign: "center" },
  intro: { color: "#625B5B", fontSize: 13, lineHeight: 21, textAlign: "center" },
  quickActions: { borderRadius: 22, padding: 20, gap: 5, marginBottom: 16 },
  sectionTitle: { color: "#292323", fontSize: 16, fontWeight: "700" },
  muted: { color: "#625B5B", fontSize: 12, lineHeight: 19 },
  buttons: { flexDirection: "row", gap: 10, marginTop: 12, flexWrap: "wrap" },
  button: { flex: 1, minWidth: 110, minHeight: 48, borderRadius: 15, paddingHorizontal: 12, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 9 },
  buttonText: { color: "#FFFAF0", fontSize: 13, fontWeight: "700" },
  emailButton: { borderWidth: 1, borderColor: "#6D080829", backgroundColor: "#FFFFFF45" },
  emailButtonText: { color: "#6D0808", fontSize: 13, fontWeight: "700" },
  details: { borderRadius: 22, paddingHorizontal: 18 },
  row: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 18, minHeight: 80 },
  divider: { borderBottomWidth: StyleSheet.hairlineWidth, borderColor: "#D9C9B8" },
  pressed: { opacity: 0.65 },
  icon: { width: 38, height: 38, borderRadius: 13, backgroundColor: "#F8ECE8", alignItems: "center", justifyContent: "center" },
  copy: { flex: 1, minWidth: 0, gap: 5 },
  label: { color: "#9B8370", fontSize: 9, letterSpacing: 1.3 },
  value: { color: "#292323", fontSize: 13, lineHeight: 20, flexShrink: 1 },
  hint: { color: "#625B5B", fontSize: 11, lineHeight: 17 },
  footer: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 7, marginTop: 25, paddingHorizontal: 5 },
  footerText: { color: "#9B8370", fontSize: 11, flexShrink: 1 },
  error: { color: "#B42318", fontSize: 13, lineHeight: 20, marginTop: 14 },
});
