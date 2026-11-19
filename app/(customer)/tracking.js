import sharedStyles from "../../styles/sharedStyles";
import { Feather, Pressable, Text, View } from "../../components/Themed";
import React, { useState } from "react";
import { Redirect, useRouter } from "expo-router";
import { Alert, StyleSheet } from "react-native";
import AuthButton from "../../components/authButton";
import OrderTracking from "../../components/cart/OrderTracking";
import styles from "../../components/cart/styles";
import ScreenContainer from "../../components/ScreenContainer";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import { useOrderHistory, canHideOrder } from "../../lib/orderHistory";
import { useMenuGlass } from "../../styles/menuGlass";

export default function TrackingRoute() {
  const router = useRouter();
  const { currentUser } = useAuth();
  const { customerOrders, syncError } = useCart();
  if (currentUser && currentUser.role !== "customer") return <Redirect href={currentUser.role === "admin" ? "/admin" : currentUser.role === "rider" ? "/rider" : "/kitchen"} />;
  return <ScreenContainer tabScreen backgroundColor="#FFF8ED">
    <Text style={styles.brand}>KUSINERA</Text><Text accessibilityRole="header" style={styles.title}>My orders</Text>
    {syncError ? <Text accessibilityRole="alert" style={styles.accent}>{syncError}</Text> : null}
    {currentUser ? <OrderHistory key={currentUser.id || currentUser.username} account={currentUser} orders={customerOrders} /> : <>
      <Text style={styles.description}>Log in to view your orders and payment status.</Text>
      <AuthButton title="Log in" onPress={() => router.push({ pathname: "/login", params: { fromTracking: "1" } })} />
    </>}
  </ScreenContainer>;
}

function OrderHistory({ account, orders }) {
  const glass = useMenuGlass();
  const history = useOrderHistory(account);
  const [hidden, setHidden] = useState(false);
  const visible = orders.filter(order => history.isHidden(order) === hidden);
  const finished = orders.filter(order => canHideOrder(order) && !history.isHidden(order));
  const hiddenCount = orders.filter(history.isHidden).length;
  function hideFinished() {
    if (!finished.length || history.saving) return;
    Alert.alert("Hide finished orders?", "Hide " + finished.length + " paid or cancelled orders from your list? You can restore them from Hidden.", [
      { text: "Cancel", style: "cancel" }, { text: "Hide orders", onPress: () => history.saveHidden(finished, true) },
    ]);
  }
  if (history.loading) return <Text style={styles.description}>Loading order history…</Text>;
  if (history.error) return <><Text accessibilityRole="alert" style={styles.description}>{history.error}</Text><AuthButton title="Try again" onPress={history.retry} /><OrderTracking orders={orders} /></>;
  return <>
    <View style={[historyStyles.tabs, glass.surface]}>{[false, true].map(value => <Pressable key={String(value)} accessibilityRole="tab" accessibilityState={{ selected: hidden === value }} onPress={() => setHidden(value)} style={[historyStyles.tab, hidden === value && historyStyles.selected]}>
      <Feather name={value ? "archive" : "list"} size={16} color={hidden === value ? "#FFFAF0" : "#6D0808"} />
      <Text style={hidden === value ? historyStyles.selectedLabel : historyStyles.label}>{value ? "Hidden (" + hiddenCount + ")" : "Orders (" + (orders.length - hiddenCount) + ")"}</Text></Pressable>)}</View>
    <Text style={historyStyles.note}>{hidden ? "Hidden on this device. Restore an order to show it in your list again." : "Hide paid, finished orders to keep your list tidy. Active and unpaid orders stay visible."}</Text>
    {!hidden && finished.length ? <Pressable accessibilityRole="button" disabled={history.saving} onPress={hideFinished} style={[historyStyles.bulk, glass.surface]}><Feather name="archive" size={16} color="#6D0808" /><Text style={historyStyles.label}>{history.saving ? "Updating…" : "Hide finished orders (" + finished.length + ")"}</Text></Pressable> : null}
    {visible.length ? <OrderTracking orders={visible} hidden={hidden} historyBusy={history.saving} onToggleHidden={order => history.saveHidden([order], !hidden)} />
      : <Text style={styles.description}>{hidden ? "No hidden orders." : orders.length ? "Your list is clear. Past orders are in Hidden." : "No orders yet."}</Text>}
  </>;
}

const historyStyles = StyleSheet.create({
  tabs: { flexDirection: "row", gap: 6, padding: 5, borderRadius: 20, marginBottom: 10 },
  tab: { flex: 1, minHeight: 44, borderRadius: 16, flexDirection: "row", gap: 7, alignItems: "center", justifyContent: "center" },
  selected: { backgroundColor: "#6D0808" },
  selectedLabel: { color: "#FFFAF0", fontSize: 13, fontWeight: "600" },
  label: sharedStyles.logoutLabel,
  note: { color: "#625B5B", fontSize: 12, lineHeight: 19, marginBottom: 14 },
  bulk: { flexDirection: "row", minHeight: 46, alignItems: "center", justifyContent: "center", gap: 8, borderRadius: 14, paddingHorizontal: 12, marginBottom: 14 },
});
