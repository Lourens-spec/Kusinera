import React from "react";
import { Text, View } from "react-native";
import styles from "./styles";

export default function OrderTracking({ orders }) {
  return (
    <View style={styles.card}>
      <Text accessibilityRole="header" style={styles.name}>Order tracking</Text>
      <Text style={styles.description}>Orders placed in this session appear here.</Text>
      {orders.length === 0 && <Text style={styles.description}>No orders yet.</Text>}
      {orders.map((order) => (
        <View key={order.id} style={styles.order}>
          <View style={styles.row}>
            <Text style={styles.name}>Order #{order.id}</Text>
            <Text accessibilityLiveRegion="polite" style={styles.saved}>{order.status}</Text>
          </View>
          <Text style={styles.description}>Table {order.table}</Text>
          {order.lines.map(({ item, quantity }) => (
            <Text key={item.id} style={styles.description}>{quantity} × {item.name}</Text>
          ))}
          <Text style={styles.name}>Billing and payment</Text>
          <Text style={styles.description}>Bill total: PHP {order.total.toFixed(2)}</Text>
          <View style={styles.row}>
            <Text style={styles.accent}>Amount due: PHP {(order.paid ? 0 : order.total).toFixed(2)}</Text>
            <Text accessibilityLiveRegion="polite" style={order.paid ? styles.saved : styles.missing}>
              {order.paid ? "Paid in cash" : "Unpaid"}
            </Text>
          </View>
        </View>
      ))}
    </View>
  );
}
