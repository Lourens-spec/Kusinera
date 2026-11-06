import React from "react";
import { useRouter } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import AuthButton from "../components/authButton";
import ScreenContainer from "../components/ScreenContainer";
import { orderStatuses, useCart } from "../context/CartContext";

export default function KitchenRoute() {
  const router = useRouter();
  const { orders, advanceOrder, recordCashPayment } = useCart();

  return (
    <ScreenContainer>
      <Text accessibilityRole="header" style={styles.title}>Staff &amp; kitchen</Text>
      {orders.length === 0 && <Text style={styles.detail}>No orders in this session yet.</Text>}
      {orders.map((order) => {
        const nextStatus = orderStatuses[orderStatuses.indexOf(order.status) + 1];

        return (
          <View key={order.id} style={styles.card}>
            <Text style={styles.heading}>Order #{order.id} · Table {order.table}</Text>
            <Text accessibilityLiveRegion="polite" style={styles.status}>{order.status}</Text>
            {order.lines.map(({ item, quantity }) => (
              <Text key={item.id} style={styles.detail}>{quantity} × {item.name}</Text>
            ))}
            <Text style={styles.detail}>
              {order.paid ? "Cash received" : "Cash due"}: PHP {order.total.toFixed(2)}
            </Text>
            {!order.paid && (
              <AuthButton title="Record cash received" onPress={() => recordCashPayment(order.id)} />
            )}
            {nextStatus && (
              <AuthButton
                title={nextStatus === "Preparing" ? "Start preparing" : `Mark as ${nextStatus.toLowerCase()}`}
                onPress={() => advanceOrder(order.id, order.status)}
              />
            )}
          </View>
        );
      })}
      <AuthButton title="Back to menu" onPress={() => router.dismissTo("/")} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: { color: "#292323", fontSize: 30, fontWeight: "800", marginBottom: 20 },
  card: { backgroundColor: "#FFFFFF", borderRadius: 20, padding: 16, marginBottom: 12, gap: 8 },
  heading: { color: "#292323", fontSize: 18, fontWeight: "700" },
  detail: { color: "#625B5B", fontSize: 15 },
  status: { color: "#6D0808", fontSize: 16, fontWeight: "700" },
});
