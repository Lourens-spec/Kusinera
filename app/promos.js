import React, { useState } from "react";
import { useRouter } from "expo-router";
import { Clipboard, StyleSheet } from "react-native";
import { Feather, Pressable, Text, View } from "../components/Themed";
import ScreenContainer from "../components/ScreenContainer";
import { useMenuGlass } from "../styles/menuGlass";
import { SAMPLE_VOUCHER } from "../utils/mealOptions";

export default function PromosRoute() {
  const glass = useMenuGlass();
  const router = useRouter();
  const [status, setStatus] = useState("");
  const { code, minimum, discount } = SAMPLE_VOUCHER;

  async function copyCode() {
    try {
      const copied = await Clipboard.setString(code);
      setStatus(copied === false ? "Press and hold the code to copy it." : code + " copied. Paste it into Tray.");
    } catch {
      setStatus("Press and hold the code to copy it.");
    }
  }

  return (
    <ScreenContainer glassBackground contentStyle={styles.page}>
      <View style={styles.header}>
        <Pressable accessibilityRole="button" accessibilityLabel="Back to menu" onPress={() => router.dismissTo("/")} style={styles.back}>
          <Feather name="arrow-left" size={21} color="#6D0808" />
        </Pressable>
        <Text accessibilityRole="header" style={styles.title}>Promos &amp; vouchers</Text>
      </View>

      <Text accessibilityRole="header" style={styles.section}>Available voucher</Text>
      <View style={[styles.ticket, glass.surface]}>
        <View style={styles.offer}>
          <View style={styles.offerCopy}>
            <Text style={styles.discount}>₱{discount} off</Text>
            <Text style={styles.body}>On food orders of ₱{minimum} or more</Text>
          </View>
          <View style={styles.back}><Feather name="tag" size={22} color="#6D0808" /></View>
        </View>
        <View style={styles.codeRow}>
          <View>
            <Text style={styles.body}>Voucher code</Text>
            <Text selectable style={styles.code}>{code}</Text>
          </View>
          <Pressable accessibilityRole="button" onPress={copyCode} style={styles.copyButton}>
            <Feather name="copy" size={16} color="#FFF8ED" />
            <Text style={styles.copyLabel}>Copy code</Text>
          </Pressable>
        </View>
      </View>
      {!!status && <Text accessibilityLiveRegion="polite" style={styles.status}>{status}</Text>}

      <View style={[styles.instructions, glass.surface]}>
        <Text accessibilityRole="header" style={styles.instructionsTitle}>How to use it</Text>
        <Text style={styles.body}>1. Add at least ₱{minimum} in food to your Tray.</Text>
        <Text style={styles.body}>2. Enter {code} in the Voucher field.</Text>
        <Text style={styles.body}>3. Tap Apply voucher to see ₱{discount} deducted.</Text>
        <Text style={styles.body}>Delivery fees don’t count toward the ₱{minimum} minimum.</Text>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  page: { maxWidth: 430 },
  header: { flexDirection: "row", alignItems: "center", gap: 12, paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: "#EADCCD" },
  back: { width: 44, height: 44, borderRadius: 22, backgroundColor: "#FFFDF9", alignItems: "center", justifyContent: "center" },
  title: { flex: 1, color: "#6D0808", fontSize: 25, fontWeight: "700" },
  section: { color: "#352925", fontSize: 20, fontWeight: "700", marginTop: 18, marginBottom: 10 },
  ticket: { borderRadius: 18, overflow: "hidden" },
  offer: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: "#FFF1DA", padding: 16 },
  offerCopy: { flex: 1, gap: 4 },
  discount: { color: "#6D0808", fontSize: 32, fontWeight: "700" },
  codeRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10, padding: 14, borderTopWidth: 1, borderTopColor: "#D9C9B8" },
  code: { color: "#6D0808", fontSize: 19, fontWeight: "700", letterSpacing: 1, marginTop: 3 },
  copyButton: { flexDirection: "row", alignItems: "center", gap: 8, minHeight: 44, paddingHorizontal: 12, borderRadius: 10, backgroundColor: "#6D0808" },
  copyLabel: { color: "#FFF8ED", fontWeight: "600" },
  status: { marginTop: 10, color: "#6D0808" },
  instructions: { padding: 14, gap: 9, marginTop: 18, borderRadius: 14 },
  instructionsTitle: { color: "#352925", fontSize: 18, fontWeight: "700" },
  body: { color: "#76665F", lineHeight: 19 },
});
