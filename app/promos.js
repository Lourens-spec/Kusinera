import sharedStyles from "../styles/sharedStyles";
import React, { useState } from "react";
import { useRouter } from "expo-router";
import { Clipboard, StyleSheet } from "react-native";
import { Feather, Pressable, Text, View } from "../components/Themed";
import ScreenContainer from "../components/ScreenContainer";
import AuthButton from "../components/authButton";
import { useMenuGlass } from "../styles/menuGlass";
import { usePromotions } from "../lib/promotions";
import { promotionSchedule } from "../utils/promotions";

export default function PromosRoute() {
  const glass = useMenuGlass();
  const router = useRouter();
  const [status, setStatus] = useState("");
  const { activePromotions, promotionsLoading, promotionsError, reloadPromotions } = usePromotions();
  async function copyCode(code) {
    try {
      const copied = await Clipboard.setString(code);
      setStatus(copied === false ? "Press and hold the code to copy it." : code + " copied. Paste it into Tray.");
    } catch { setStatus("Press and hold the code to copy it."); }
  }
  return <ScreenContainer glassBackground contentStyle={styles.page}>
    <View style={styles.header}><Pressable accessibilityRole="button" accessibilityLabel="Back to menu" onPress={() => router.dismissTo("/")} style={styles.back}><Feather name="arrow-left" size={21} color="#6D0808" /></Pressable>
      <Text accessibilityRole="header" style={styles.title}>Promos &amp; vouchers</Text></View>
    <Text style={styles.section}>Offers from our kitchen</Text>
    {promotionsLoading && !activePromotions.length ? <Text style={styles.body}>Loading offers…</Text> : null}
    {promotionsError ? <><Text accessibilityRole="alert" style={styles.body}>{promotionsError}</Text><AuthButton title="Try again" onPress={reloadPromotions} /></> : null}
    {!promotionsLoading && !promotionsError && !activePromotions.length ? <Text style={styles.body}>No active promos yet. Check back soon.</Text> : null}
    {activePromotions.map(promo => <View key={promo.id} style={[styles.ticket, glass.surface]}>
      <View style={styles.offer}><View style={styles.offerCopy}><Text style={styles.discount}>{promo.code ? "₱" + Number(promo.discount).toFixed(2) + " off" : promo.title}</Text>
        {promo.code ? <Text style={styles.instructionsTitle}>{promo.title}</Text> : null}
        {promo.description ? <Text style={styles.body}>{promo.description}</Text> : null}
        {promo.code ? <Text style={styles.body}>Minimum food order ₱{Number(promo.minimum).toFixed(2)}</Text> : null}
        {promo.code && promo.one_per_account ? <Text style={styles.body}>One use per customer account · Dine-in or delivery</Text> : null}
        {promo.starts_on || promo.ends_on ? <Text style={styles.body}>{promotionSchedule(promo)}</Text> : null}
      </View><Feather name={promo.code ? "tag" : "gift"} size={23} color="#6D0808" /></View>
      {promo.code ? <View style={styles.codeRow}><View><Text style={styles.body}>Voucher code</Text><Text selectable style={styles.code}>{promo.code}</Text></View>
        <Pressable accessibilityRole="button" accessibilityLabel={"Copy " + promo.code} onPress={() => copyCode(promo.code)} style={styles.copyButton}><Feather name="copy" size={16} color="#FFF8ED" /><Text style={styles.copyLabel}>Copy code</Text></Pressable></View> : null}
    </View>)}
    {status ? <Text accessibilityLiveRegion="polite" style={styles.status}>{status}</Text> : null}
    <View style={[styles.instructions, glass.surface]}><Text style={styles.instructionsTitle}>How to use a voucher</Text><Text style={styles.body}>Add dishes to Tray, enter your code, then tap Apply voucher. One voucher applies to the food subtotal; delivery fees are excluded. Checkout confirms the offer is still valid.</Text></View>
  </ScreenContainer>;
}

const styles = StyleSheet.create({
  page: { maxWidth: 430 },
  header: sharedStyles.supportHeader,
  back: sharedStyles.supportBack,
  title: sharedStyles.supportTitle,
  section: { color: "#352925", fontSize: 20, fontWeight: "700", marginTop: 18, marginBottom: 10 },
  ticket: { borderRadius: 18, overflow: "hidden", marginBottom: 16 },
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
