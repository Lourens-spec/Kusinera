import sharedStyles from "../styles/sharedStyles";
import React, { useRef, useState } from "react";
import { Redirect, useRouter } from "expo-router";
import { Platform, StyleSheet } from "react-native";
import { Feather, Pressable, Switch, Text, TextInput, View } from "../components/Themed";
import ScreenContainer from "../components/ScreenContainer";
import ChoiceField from "../components/ChoiceField";
import { useAuth } from "../context/AuthContext";
import { usePromotions } from "../lib/promotions";
import { supabase } from "../lib/supabase";
import { isPromotionActive, preparePromotion, promotionSchedule } from "../utils/promotions";
import { glossyMenuTab, useMenuGlass } from "../styles/menuGlass";

export default function AdminPromosRoute() {
  const { currentUser } = useAuth();
  if (!currentUser) return <Redirect href="/login" />;
  if (currentUser.role !== "admin") return <Redirect href="/" />;
  return <PromoManager />;
}

function PromoManager() {
  const glass = useMenuGlass();
  const router = useRouter();
  const { promotions, promotionsLoading, promotionsError, reloadPromotions } = usePromotions();
  const [editing, setEditing] = useState(null);
  const [revision, setRevision] = useState(0);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState(null);
  const busy = useRef(false);
  async function toggle(promo) {
    if (busy.current) return;
    busy.current = true; setBusyId(promo.id); setError("");
    try {
      const { error } = await supabase.from("promotions").update({ active: !promo.active }).eq("id", promo.id).select("id").single();
      if (error) throw error;
      await reloadPromotions();
    } catch (failure) { setError(failure.message || "Couldn’t update this offer."); }
    finally { busy.current = false; setBusyId(null); }
  }
  return <ScreenContainer glassBackground keyboardShouldPersistTaps="handled">
    <View style={styles.header}><Pressable accessibilityRole="button" accessibilityLabel="Back to Admin" onPress={() => router.dismissTo("/admin")} style={styles.back}><Feather name="arrow-left" size={21} color="#6D0808" /></Pressable><View style={styles.flex}><Text style={styles.eyebrow}>KUSINERA · ADMIN</Text><Text accessibilityRole="header" style={styles.title}>Promos &amp; vouchers</Text></View></View>
    <Text style={styles.body}>Publish an announcement or a peso-discount voucher. Dates and times follow Philippine time.</Text>
    <PromoForm key={(editing?.id || "new") + revision} promo={editing} onCancel={() => setEditing(null)} onSaved={async () => { setEditing(null); setRevision(value => value + 1); setStatus("Offer saved. Customers will see it when active and within its schedule."); await reloadPromotions(); }} />
    {status ? <Text accessibilityLiveRegion="polite" style={styles.body}>{status}</Text> : null}
    <View style={styles.header}><Text style={styles.section}>Published &amp; scheduled offers</Text><Pressable accessibilityRole="button" onPress={reloadPromotions} style={styles.back}><Feather name="refresh-cw" size={18} color="#6D0808" /></Pressable></View>
    {promotionsLoading ? <Text style={styles.body}>Loading offers…</Text> : null}
    {promotionsError || error ? <Text accessibilityRole="alert" style={styles.error}>{error || promotionsError}</Text> : null}
    {!promotionsLoading && !promotionsError && !promotions.length ? <Text style={styles.body}>Your first offer will appear here.</Text> : null}
    {promotions.map(promo => <View key={promo.id} style={[styles.card, glass.surface]}><View style={styles.row}><View style={styles.flex}><Text style={styles.section}>{promo.title}</Text><Text style={styles.body}>{promo.code || "Promo announcement"} · {promo.active ? isPromotionActive(promo) ? "Live" : "Outside active schedule" : "Paused"}</Text></View><Switch accessibilityLabel={"Activate " + promo.title} disabled={busyId !== null} value={promo.active} onValueChange={() => toggle(promo)} /></View>
      {promo.code ? <Text style={styles.body}>₱{Number(promo.discount).toFixed(2)} off · minimum ₱{Number(promo.minimum).toFixed(2)}{promo.one_per_account ? " · Once per account" : " · Repeat use allowed"}</Text> : null}
      {promo.description ? <Text style={styles.body}>{promo.description}</Text> : null}
      <Text style={styles.body}>{promotionSchedule(promo)}</Text>
      <Pressable accessibilityRole="button" onPress={() => { setEditing(promo); setStatus(""); }} style={styles.secondary}><Feather name="edit-2" size={15} color="#6D0808" /><Text style={styles.accent}>Edit offer</Text></Pressable>
    </View>)}
  </ScreenContainer>;
}

function PromoForm({ promo, onSaved, onCancel }) {
  const glass = useMenuGlass();
  const [draft, setDraft] = useState({ kind: promo?.code ? "Voucher" : promo ? "Promo" : "Voucher", title: promo?.title || "", description: promo?.description || "", code: promo?.code || "", discount: String(promo?.discount || ""), minimum: String(promo?.minimum ?? 0), starts_on: promo?.starts_on || "", ends_on: promo?.ends_on || "", start_time: promo?.start_time?.slice(0, 5) || "", end_time: promo?.end_time?.slice(0, 5) || "", active: promo?.active ?? true, one_per_account: promo?.one_per_account ?? false });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const lock = useRef(false);
  const id = useRef(promo?.id || "offer-" + Date.now() + "-" + Math.random().toString(36).slice(2));
  function change(key, value) { setDraft(current => ({ ...current, [key]: value })); setError(""); }
  async function save() {
    if (lock.current) return;
    const result = preparePromotion(draft);
    if (result.error) { setError(result.error); return; }
    lock.current = true; setSaving(true); setError("");
    try {
      if (!supabase) throw new Error("Connect Supabase before publishing offers.");
      const { error } = await supabase.from("promotions").upsert({ id: id.current, ...result.promo }).select("id").single();
      if (error) throw error;
      await onSaved();
    } catch (failure) { setError(failure.code === "23505" ? "That voucher code already exists. Choose another code." : failure.message || "Couldn’t publish this offer."); }
    finally { lock.current = false; setSaving(false); }
  }
  function field(key, label, props = {}) {
    return <View style={styles.field}><Text style={styles.label}>{label}</Text><TextInput accessibilityLabel={label} editable={!saving} value={draft[key]} onChangeText={value => change(key, value)} style={[styles.input, props.multiline && styles.multiline]} placeholderTextColor="#625B5B" {...props} /></View>;
  }
  return <View style={[styles.card, glass.surface]}><Text style={styles.section}>{promo ? "Edit offer" : "Create an offer"}</Text>
    <ChoiceField label="Offer type" value={draft.kind} options={[{ value: "Voucher", label: "Voucher · peso discount" }, { value: "Promo", label: "Promo · announcement" }]} onChange={value => { if (!saving) change("kind", value); }} />
    {field("title", "Title", { maxLength: 80, placeholder: "A little comfort, for less" })}
    {field("description", "Description (optional)", { multiline: true, maxLength: 500, placeholder: "Tell customers about this offer" })}
    {draft.kind === "Voucher" ? <>
      {field("code", "Voucher code", { autoCapitalize: "characters", autoCorrect: false, maxLength: 20, placeholder: "WELCOME50" })}
      <View style={styles.row}><View style={styles.flex}>{field("discount", "Discount (₱)", { keyboardType: "decimal-pad", placeholder: "50" })}</View><View style={styles.flex}>{field("minimum", "Minimum food order (₱)", { keyboardType: "decimal-pad", placeholder: "300" })}</View></View>
    </> : null}
    {field("starts_on", "Start date (optional)", { placeholder: "YYYY-MM-DD", maxLength: 10 })}
    {field("start_time", "Start time (optional)", { placeholder: "HH:mm · e.g. 08:00", maxLength: 5, autoCorrect: false })}
    {field("ends_on", "End date (optional)", { placeholder: "YYYY-MM-DD", maxLength: 10 })}
    {field("end_time", "End time (optional)", { placeholder: "HH:mm · e.g. 20:00", maxLength: 5, autoCorrect: false })}
    <Text style={styles.body}>Use 24-hour Philippine time. Add a matching date for each time. Blank start time means midnight; blank end time includes the whole end date. An exact end time stops the offer at that time.</Text>
    {draft.kind === "Voucher" ? <View style={styles.field}><View style={styles.row}><Text style={[styles.label, styles.flex]}>One use per customer account</Text><Switch accessibilityLabel="One use per customer account" value={draft.one_per_account} disabled={saving} onValueChange={value => change("one_per_account", value)} /></View><Text style={styles.body}>On: each customer can use this voucher once across dine-in and delivery. It counts when an order is placed, including orders later cancelled. Off: repeat use is allowed.</Text></View> : null}
    <View style={styles.row}><Text style={[styles.label, styles.flex]}>Active</Text><Switch accessibilityLabel="Offer active" value={draft.active} disabled={saving} onValueChange={value => change("active", value)} /></View>
    {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
    <Pressable accessibilityRole="button" disabled={saving} onPress={save} style={[styles.primary, glossyMenuTab]}><Text style={styles.white}>{saving ? "Saving…" : promo ? "Save offer" : "Publish offer"}</Text></Pressable>
    {promo ? <Pressable accessibilityRole="button" disabled={saving} onPress={onCancel} style={styles.secondary}><Text style={styles.accent}>Cancel editing</Text></Pressable> : null}
  </View>;
}
const styles = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 14 },
  back: { minWidth: 44, minHeight: 44, alignItems: "center", justifyContent: "center" },
  eyebrow: { color: "#9B8370", fontSize: 10, letterSpacing: 1 },
  title: { color: "#6D0808", fontFamily: Platform.OS === "ios" ? "Georgia" : "serif", fontSize: 26, marginTop: 5 },
  section: { color: "#292323", fontSize: 16, fontWeight: "700", flexShrink: 1 },
  card: { borderRadius: 20, padding: 18, gap: 12, marginVertical: 12 },
  body: { color: "#625B5B", fontSize: 12, lineHeight: 19 },
  field: { gap: 6 }, label: { color: "#292323", fontSize: 13, fontWeight: "600" },
  input: { borderWidth: 1, borderColor: "#D9C9B8", borderRadius: 12, minHeight: 46, padding: 12, fontSize: 16, color: "#292323" },
  multiline: { minHeight: 90, textAlignVertical: "top" },
  flex: { flex: 1, minWidth: 0 }, row: { flexDirection: "row", alignItems: "center", gap: 10 },
  primary: { minHeight: 48, alignItems: "center", justifyContent: "center", borderRadius: 16 },
  white: { color: "#FFF8ED", fontSize: 14, fontWeight: "700" },
  secondary: { flexDirection: "row", gap: 7, minHeight: 44, alignItems: "center", justifyContent: "center" },
  accent: sharedStyles.logoutLabel,
  error: { color: "#B42318", fontSize: 13, lineHeight: 20 },
});
