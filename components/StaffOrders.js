import { Feather, MaterialCommunityIcons, Pressable, Text, View } from "./Themed";
import sharedStyles from "../styles/sharedStyles";
import { glossyMenuTab, useMenuGlass } from "../styles/menuGlass";
import React, { useState } from "react";
import { useRouter } from "expo-router";
import { Platform, StyleSheet } from "react-native";
import { getNextOrderStatus } from "../context/CartContext";
import ChoiceField from "./ChoiceField";
import ScreenContainer from "./ScreenContainer";
import DeliveryDispatch from "./delivery/DeliveryDispatch";
import TicketDishes from "./TicketDishes";

const orderTypes = [
  { label: "Dine-in", icon: "silverware-fork-knife" },
  { label: "Delivery", icon: "bike" },
];

const statusGroups = {
  "Dine-in": {
    "In kitchen": ["Placed", "Preparing"],
    "Ready to serve": ["Ready"],
    Served: ["Served"],
  },
  Delivery: {
    "New orders": ["Placed"],
    "In kitchen": ["Accepted", "Preparing"],
    "Ready for pickup": ["Ready"],
    "Out for delivery": ["Out for delivery"],
    Delivered: ["Delivered"],
  },
};

export default function StaffOrders({ orders, syncError, onAdvance, onPayment, onLogout }) {
  const router = useRouter();
  const glass = useMenuGlass();
  const [orderType, setOrderType] = useState("Dine-in");
  const [filter, setFilter] = useState("All orders");
  const delivery = orderType === "Delivery";
  const typeOrders = orders.filter(order => (order.type === "delivery") === delivery);
  const readyCount = typeOrders.filter(order => order.status === "Ready").length;
  const groups = statusGroups[orderType];
  const options = ["All orders", ...Object.keys(groups)].map(label => ({ label, value: label }));
  const visible = filter === "All orders"
    ? typeOrders
    : typeOrders.filter(order => groups[filter]?.includes(order.status));
  const ordersByTable = new Map();
  if (!delivery) {
    for (const order of visible) {
      if (!ordersByTable.has(order.table)) ordersByTable.set(order.table, []);
      ordersByTable.get(order.table).push(order);
    }
  }

  function selectType(label) {
    if (label === orderType) return;
    setOrderType(label);
    setFilter("All orders");
  }

  return (
    <ScreenContainer glassBackground scrollStyle={styles.scroll} contentStyle={styles.page}>
      <View style={[styles.row, styles.header]}>
        <View>
          <Text style={styles.brand}>KUSINERA</Text>
          <Text style={styles.tagline}>Staff workspace</Text>
        </View>
        <Pressable accessibilityRole="button" onPress={onLogout} style={styles.logout}>
          <Feather name="log-out" size={16} color="#FFF8ED" />
          <Text style={styles.logoutLabel}>Log out</Text>
        </Pressable>
      </View>
      <View style={styles.main}>
        <View style={[styles.row, styles.heading]}>
          <Text accessibilityRole="header" style={styles.title}>Staff orders</Text>
          <Pressable accessibilityRole="button" onPress={() => router.push("/manage-menu")} style={({ pressed }) => [styles.manageMenu, glass.surface, pressed && styles.pressed]}>
            <Feather name="book-open" size={17} color="#6D0808" />
            <Text style={styles.buttonLabel}>Manage menu</Text>
          </Pressable>
        </View>
        {syncError ? <Text accessibilityRole="alert" style={styles.detail}>{syncError}</Text> : null}
        <View style={[styles.tabs, glass.surface]}>
          {orderTypes.map(({ label, icon }) => {
            const selected = orderType === label;
            return (
              <Pressable key={label} accessibilityRole="tab" accessibilityState={{ selected }} onPress={() => selectType(label)} style={({ pressed }) => [styles.tab, selected && glossyMenuTab, pressed && styles.pressed]}>
                <MaterialCommunityIcons name={icon} size={17} color={selected ? "#FFF8ED" : "#6D0808"} />
                <Text style={[styles.buttonLabel, selected && styles.primaryLabel]}>{label}</Text>
              </Pressable>
            );
          })}
        </View>
        <View style={[styles.row, styles.toolbar]}>
          <View style={styles.ready}>
            <View style={styles.dot} />
            <Text accessibilityLiveRegion="polite" style={styles.readyLabel}>{readyCount} {delivery ? "ready for pickup" : "ready to serve"}</Text>
          </View>
          <ChoiceField label="Filter by status" value={filter} options={options} onChange={setFilter} hideLabel triggerStyle={[styles.statusFilter, glass.surface]} />
        </View>
        {visible.length === 0 && (
          <View style={[styles.empty, glass.surface]}>
            <View style={styles.emptyIcon}><Feather name="clipboard" size={20} color="#6D0808" /></View>
            <Text accessibilityRole="header" style={styles.emptyTitle}>
              {filter !== "All orders" ? "No matching orders" : delivery ? "No delivery orders yet" : "No dine-in orders yet"}
            </Text>
            <Text style={styles.emptyCopy}>
              {filter !== "All orders" ? "Choose All orders to see the full list." : delivery ? "Delivery orders will appear here for staff review." : "Orders placed from a table will appear here."}
            </Text>
          </View>
        )}
        {delivery ? <DeliveryDispatch orders={visible} surfaceStyle={glass.surface} /> : Array.from(ordersByTable, ([table, tableOrders]) => (
          <View key={table} style={styles.tableGroup}>
            <View style={[styles.row, styles.tableHeading]}>
              <Text accessibilityRole="header" style={styles.table}>Table {table}</Text>
              <Text style={styles.detail}>{tableOrders.length} {tableOrders.length === 1 ? "order" : "orders"}</Text>
            </View>
            {tableOrders.map(order => (
              <StaffTicket key={order.id} order={order} onAdvance={onAdvance} onPayment={onPayment} surfaceStyle={glass.surface} />
            ))}
          </View>
        ))}
      </View>
    </ScreenContainer>
  );
}

function StaffTicket({ order, onAdvance, onPayment, surfaceStyle }) {
  const canServe = getNextOrderStatus("staff", order.status) === "Served";
  const serviceComplete = canServe || order.status === "Served";

  return (
    <View style={[sharedStyles.ticketCard, surfaceStyle]}>
      <View style={styles.row}>
        <Text style={styles.orderNumber}>ORDER #{order.id}</Text>
        <Text accessibilityLiveRegion="polite" style={[styles.badge, serviceComplete && styles.complete]}>
          {order.status}
        </Text>
      </View>
      <View style={styles.dishes}>
        <TicketDishes lines={order.lines} />
      </View>
      <View style={[styles.row, styles.bill]}>
        <View>
          <Text style={styles.detail}>{order.paid ? "Cash received" : "Cash due"}</Text>
          <Text style={styles.amount}>₱{order.total.toFixed(2)}</Text>
          {order.discount > 0 && <Text style={styles.detail}>{order.voucherCode} discount · −₱{order.discount.toFixed(2)}</Text>}
        </View>
        <Text accessibilityLiveRegion="polite" style={[styles.badge, order.paid && styles.complete]}>
          {order.paid ? "Paid" : "Unpaid"}
        </Text>
      </View>
      {canServe && (
        <TicketButton icon="check" label="Mark as served" onPress={() => onAdvance(order.id, order.status)} primary />
      )}
      {!order.paid && (
        <TicketButton icon="currency-php" label="Record cash received" onPress={() => onPayment(order.id)} />
      )}
    </View>
  );
}

function TicketButton({ icon, label, onPress, primary }) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.button, primary && glossyMenuTab, pressed && styles.pressed]}>
      <MaterialCommunityIcons name={icon} size={18} color={primary ? "#FFFFFF" : "#6D0808"} />
      <Text style={[styles.buttonLabel, primary && styles.primaryLabel]}>{label}</Text>
    </Pressable>
  );
}

const serif = Platform.select({ android: "serif", ios: "Georgia", web: "Georgia, serif" });

const styles = StyleSheet.create({
  row: sharedStyles.ticketRow,
  scroll: { padding: 0 },
  page: { maxWidth: 600 },
  header: { backgroundColor: "#6D0808", paddingHorizontal: 18, paddingVertical: 16 },
  brand: { color: "#FFF8ED", fontFamily: serif, fontSize: 20, fontWeight: "700", letterSpacing: 1.4 },
  tagline: { color: "#EED9CE", fontSize: 12, marginTop: 4 },
  logout: { flexDirection: "row", alignItems: "center", gap: 7, minHeight: 44, paddingHorizontal: 10, borderRadius: 11, borderWidth: 1, borderColor: "#FFF1DA33", backgroundColor: "#FFFFFF10" },
  logoutLabel: { color: "#FFF8ED", fontSize: 12, fontWeight: "600" },
  main: { paddingHorizontal: 16, paddingTop: 18, paddingBottom: 24 },
  manageMenu: { flexDirection: "row", alignItems: "center", gap: 7, minHeight: 44, borderRadius: 11, paddingHorizontal: 9 },
  heading: { flexWrap: "wrap", marginBottom: 14 },
  title: { color: "#6D0808", fontFamily: serif, fontSize: 25, fontWeight: "700" },
  tabs: { flexDirection: "row", gap: 4, padding: 4, borderRadius: 13 },
  tab: { flex: 1, minHeight: 44, flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 7, borderRadius: 10, paddingHorizontal: 5 },
  toolbar: { flexWrap: "wrap", marginVertical: 12 },
  ready: { flexDirection: "row", alignItems: "center", gap: 6 },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: "#9B5D52" },
  readyLabel: { color: "#6D0808", fontWeight: "600", fontSize: 12 },
  statusFilter: { maxWidth: 200 },
  empty: { alignItems: "center", gap: 8, borderStyle: "dashed", borderRadius: 16, paddingVertical: 24, paddingHorizontal: 14 },
  emptyIcon: { width: 44, height: 44, borderRadius: 22, justifyContent: "center", alignItems: "center", backgroundColor: "#FFF1DA" },
  emptyTitle: { color: "#352925", fontFamily: serif, fontSize: 18, fontWeight: "700", textAlign: "center" },
  emptyCopy: { color: "#76665F", fontSize: 13, textAlign: "center" },
  detail: sharedStyles.mutedText,
  badge: sharedStyles.statusBadge,
  complete: sharedStyles.successBadge,
  tableGroup: { marginBottom: 8 },
  tableHeading: { marginBottom: 6 },
  orderNumber: sharedStyles.orderNumber,
  table: { color: "#292323", fontSize: 20, fontWeight: "800" },
  dishes: { borderTopWidth: 1, borderStyle: "dashed", borderTopColor: "#C4A9A9", paddingTop: 8, gap: 5 },
  bill: sharedStyles.creamPanel,
  amount: { color: "#6D0808", fontSize: 17, fontWeight: "800" },
  button: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, minHeight: 44, padding: 8, borderRadius: 10, borderWidth: 1, borderColor: "#6D0808" },
  buttonLabel: { color: "#6D0808", fontWeight: "700", textAlign: "center" },
  pressed: { opacity: 0.72 },
  primaryLabel: { color: "#FFFFFF" },
});

