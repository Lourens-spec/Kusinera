import { Feather, MaterialCommunityIcons, Pressable, Text, View } from "./Themed";
import sharedStyles from "../styles/sharedStyles";
import { glossyMenuTab, useMenuGlass } from "../styles/menuGlass";
import React, { useState } from "react";
import { Platform, StyleSheet } from "react-native";
import { getNextOrderStatus } from "../context/CartContext";
import ScreenContainer from "./ScreenContainer";
import TicketDishes from "./TicketDishes";

const filters = ["All orders", "New", "Preparing", "Ready"];
const deliveryNotes = {
  Placed: "Waiting for staff acceptance.",
  Accepted: "Accepted · prepare and pack for delivery.",
  Preparing: "Prepare and pack this order for delivery.",
  Ready: "Packed · awaiting rider pickup.",
  "Out for delivery": "Handed to the rider.",
  Delivered: "Delivery completed.",
  Cancelled: "Order cancelled.",
};

export default function KitchenQueue({ orders, onAdvance, onLogout }) {
  const glass = useMenuGlass();
  const [filter, setFilter] = useState("All orders");
  const grouped = {
    "All orders": orders,
    New: orders.filter(order => ["Placed", "Accepted"].includes(order.status)),
    Preparing: orders.filter(order => order.status === "Preparing"),
    Ready: orders.filter(order => order.status === "Ready"),
  };
  const visibleOrders = grouped[filter];

  function tile(label) {
    const selected = filter === label;
    const all = label === "All orders";
    return (
      <Pressable
        key={label}
        accessibilityRole="button"
        accessibilityLabel={label + ", " + grouped[label].length}
        accessibilityState={{ selected }}
        onPress={() => setFilter(label)}
        style={({ pressed }) => [styles.tile, all && styles.allTile, selected ? [styles.activeTile, glossyMenuTab] : glass.surface, pressed && styles.pressed]}
      >
        <View style={styles.tileLabelRow}>
          {all && <MaterialCommunityIcons name="pot-steam-outline" size={19} color={selected ? "#FFF8ED" : "#6D0808"} />}
          <Text style={[styles.tileLabel, selected && styles.activeText]}>{label}</Text>
        </View>
        <Text style={[styles.tileCount, selected && styles.activeText]}>{grouped[label].length}</Text>
      </Pressable>
    );
  }

  return (
    <ScreenContainer glassBackground scrollStyle={styles.scroll}>
      <View style={[styles.row, styles.header]}>
        <View>
          <Text style={styles.brand}>KUSINERA</Text>
          <Text style={styles.tagline}>Kitchen workspace</Text>
        </View>
        <Pressable accessibilityRole="button" onPress={onLogout} style={({ pressed }) => [styles.logout, pressed && styles.pressed]}>
          <Feather name="log-out" size={16} color="#FFF8ED" />
          <Text style={styles.logoutLabel}>Log out</Text>
        </Pressable>
      </View>
      <View style={styles.main}>
        <Text accessibilityRole="header" style={styles.title}>Kitchen queue</Text>
        {tile(filters[0])}
        <View style={styles.tiles}>{filters.slice(1).map(tile)}</View>
        <View style={[styles.row, styles.ticketHeading]}>
          <Text accessibilityRole="header" style={styles.ticketTitle}>Order tickets</Text>
          <Text accessibilityLiveRegion="polite" style={styles.detail}>{visibleOrders.length} {visibleOrders.length === 1 ? "order" : "orders"}</Text>
        </View>
        {visibleOrders.length === 0 && (
          <View style={[styles.empty, glass.surface]}>
            <MaterialCommunityIcons name="pot-steam-outline" size={23} color="#6D0808" />
            <Text style={[styles.detail, styles.emptyText]}>
              {orders.length === 0 ? "Orders will appear here when they reach the kitchen." : "No orders in this group."}
            </Text>
          </View>
        )}
        {visibleOrders.map(order => <KitchenOrder key={order.id} order={order} onAdvance={onAdvance} surfaceStyle={glass.surface} />)}
      </View>
    </ScreenContainer>
  );
}

function KitchenOrder({ order, onAdvance, surfaceStyle }) {
  const nextStatus = getNextOrderStatus("kitchen", order.status, order.type);
  const status = order.status === "Placed" ? "New" : order.status;
  const badgeStyle = order.status === "Ready" ? styles.ready : order.status === "Preparing" && styles.preparing;

  return (
    <View style={[sharedStyles.ticketCard, surfaceStyle]}>
      <View style={styles.row}>
        <View style={styles.orderHeading}>
          <Text style={styles.orderNumber}>ORDER #{order.id}</Text>
          <Text style={styles.table}>{order.type === "delivery" ? "Delivery order" : `Table ${order.table}`}</Text>
        </View>
        <Text accessibilityLiveRegion="polite" style={[styles.badge, badgeStyle]}>{status}</Text>
      </View>
      {order.type === "delivery" && (
        <Text style={styles.detail}>
          {deliveryNotes[order.status]}
        </Text>
      )}
      <View style={styles.dishes}>
        <TicketDishes lines={order.lines} />
      </View>
      {nextStatus && (
        <Pressable
          accessibilityRole="button"
          onPress={() => onAdvance(order.id, order.status)}
          style={({ pressed }) => [styles.action, glossyMenuTab, pressed && styles.pressed]}
        >
          <Feather name={nextStatus === "Preparing" ? "zap" : "check"} size={16} color="#FFFFFF" />
          <Text style={styles.actionLabel}>{nextStatus === "Preparing" ? "Start preparing" : order.type === "delivery" ? "Packed and ready for pickup" : "Mark as ready"}</Text>
        </Pressable>
      )}
    </View>
  );
}

const serif = Platform.select({ android: "serif", ios: "Georgia", web: "Georgia, serif" });

const styles = StyleSheet.create({
  row: sharedStyles.ticketRow,
  scroll: { padding: 0 },
  header: { backgroundColor: "#6D0808", paddingHorizontal: 18, paddingVertical: 16 },
  brand: { color: "#FFF8ED", fontFamily: serif, fontSize: 20, fontWeight: "700", letterSpacing: 1.2 },
  tagline: { color: "#EED9CE", fontSize: 12, marginTop: 4 },
  logout: { flexDirection: "row", alignItems: "center", gap: 7, minHeight: 44, paddingHorizontal: 10, borderRadius: 11, borderWidth: 1, borderColor: "#FFF1DA33", backgroundColor: "#FFFFFF10" },
  logoutLabel: { color: "#FFF8ED", fontSize: 12, fontWeight: "600" },
  main: { padding: 16 },
  title: { color: "#6D0808", fontFamily: serif, fontSize: 26, fontWeight: "700", marginBottom: 13 },
  tiles: { flexDirection: "row", gap: 8, marginTop: 8 },
  tile: { flex: 1, minWidth: 0, minHeight: 66, justifyContent: "space-between", gap: 5, padding: 9, borderRadius: 13 },
  allTile: { flex: 0, minHeight: 52, flexDirection: "row", alignItems: "center", paddingHorizontal: 12 },
  tileLabelRow: { flexDirection: "row", alignItems: "center", gap: 7 },
  tileLabel: { color: "#6D0808", fontSize: 12, fontWeight: "600", flexShrink: 1 },
  tileCount: { color: "#6D0808", fontFamily: serif, fontSize: 23, fontWeight: "700" },
  activeTile: { borderWidth: 1, borderColor: "#6D0808" },
  pressed: { opacity: 0.72 },
  activeText: { color: "#FFF8ED" },
  ticketHeading: { marginTop: 18, marginBottom: 10, flexWrap: "wrap" },
  ticketTitle: { color: "#6D0808", fontFamily: serif, fontSize: 19, fontWeight: "700" },
  empty: { alignItems: "center", gap: 8, padding: 16, borderRadius: 13, borderStyle: "dashed" },
  emptyText: { textAlign: "center" },
  detail: sharedStyles.mutedText,
  badge: sharedStyles.statusBadge,
  preparing: { backgroundColor: "#FFF1DA", color: "#702329" },
  ready: sharedStyles.successBadge,
  orderHeading: { flex: 1 },
  orderNumber: sharedStyles.orderNumber,
  table: { color: "#292323", fontSize: 18, fontWeight: "800" },
  dishes: { borderWidth: 0, borderTopWidth: 1, borderStyle: "dashed", borderTopColor: "#C4A9A9", paddingTop: 8, gap: 5 },
  action: { flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 6, minHeight: 44, borderRadius: 10 },
  actionLabel: { color: "#FFFFFF", fontWeight: "700" },
});

