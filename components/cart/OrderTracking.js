import { Text, View } from "../Themed";
import React from "react";
import styles from "./styles";
import { useMenuGlass } from "../../styles/menuGlass";
import { useCart } from "../../context/CartContext";
import DeliveryTicket, { DeliveryAction } from "../delivery/DeliveryTicket";
import DeliveryProgress from "../delivery/DeliveryProgress";
import MealNotes from "../MealNotes";
import OrderAgain from "../OrderAgain";
import OrderRating from "../OrderRating";

export default function OrderTracking({ orders }) {
  const glass = useMenuGlass();
  const { cancelDelivery } = useCart();
  const deliveries = orders.filter((order) => order.type === "delivery");
  const dineIn = orders.filter((order) => order.type !== "delivery");

  return (
    <>
      {deliveries.map((order) => (
        <DeliveryTicket key={order.id} order={order} surfaceStyle={glass.surface}>
          <DeliveryProgress status={order.status} />
          <OrderAgain order={order} />
          <OrderRating order={order} />
          {order.status === "Placed" && (
            <DeliveryAction label="Cancel order" onPress={() => cancelDelivery(order.id)} />
          )}
        </DeliveryTicket>
      ))}
      {(dineIn.length > 0 || orders.length === 0) && <View style={[styles.card, glass.surface]}>
      <Text style={styles.description}>Orders placed in this session appear here.</Text>
      {orders.length === 0 && <Text style={styles.description}>No orders yet.</Text>}
      {dineIn.map((order) => (
        <View key={order.id} style={styles.order}>
          <View style={styles.row}>
            <Text style={styles.name}>Order #{order.id}</Text>
            <Text accessibilityLiveRegion="polite" style={styles.saved}>{order.status}</Text>
          </View>
          <Text style={styles.description}>Table {order.table}</Text>
          {order.lines.map((line) => (
            <View key={line.key ?? line.item.id}>
              <Text style={styles.description}>{line.quantity} × {line.item.name}</Text>
              <MealNotes line={line} />
            </View>
          ))}
          <Text style={styles.name}>Billing and payment</Text>
          <Text style={styles.description}>Bill total: ₱{order.total.toFixed(2)}</Text>
          {order.discount > 0 && <Text style={styles.description}>{order.voucherCode} discount · −₱{order.discount.toFixed(2)}</Text>}
          <View style={styles.row}>
            <Text style={styles.accent}>Amount due: ₱{(order.paid ? 0 : order.total).toFixed(2)}</Text>
            <Text accessibilityLiveRegion="polite" style={order.paid ? styles.saved : styles.missing}>
              {order.paid ? "Paid in cash" : "Unpaid"}
            </Text>
          </View>
          <OrderAgain order={order} />
          <OrderRating order={order} />
        </View>
      ))}
      </View>}
    </>
  );
}
