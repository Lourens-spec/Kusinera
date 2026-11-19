import { Pressable, Text, View } from "../Themed";
import sharedStyles from "../../styles/sharedStyles";
import React from "react";
import { StyleSheet } from "react-native";
import { useAuth } from "../../context/AuthContext";
import { deliveryAddress } from "../../utils/delivery";
import { lineUnitPrice } from "../../utils/mealOptions";
import MealNotes from "../MealNotes";

export default function DeliveryTicket({ order, children, surfaceStyle, riderName }) {
  const { accounts } = useAuth();
  const rider = accounts.find((account) => account.username === order.rider);
  const assignedName = riderName || rider?.displayName || rider?.username;
  const cancelled = order.status === "Cancelled";

  return (
    <View style={[deliveryStyles.card, surfaceStyle]}>
      <View style={deliveryStyles.row}>
        <Text style={deliveryStyles.heading}>Order #{order.id} · Delivery</Text>
        <Text accessibilityLiveRegion="polite" style={deliveryStyles.badge}>{order.status}</Text>
      </View>
      {order.delivery ? <>
        <Text style={deliveryStyles.heading}>{order.delivery.recipient}</Text>
        <Text style={deliveryStyles.body}>{deliveryAddress(order.delivery)}</Text>
        <Text style={deliveryStyles.detail}>{order.delivery.phone}</Text>
        {order.delivery.notes ? <Text style={deliveryStyles.detail}>Instructions · {order.delivery.notes}</Text> : null}
      </> : null}
      <View style={deliveryStyles.divider} />
      {order.lines.map((line) => (
        <View key={line.key ?? line.item.id}>
          <View style={deliveryStyles.row}>
            <Text style={deliveryStyles.body}>{line.quantity} × {line.item.name}</Text>
            <Text style={deliveryStyles.body}>₱{(lineUnitPrice(line) * line.quantity).toFixed(2)}</Text>
          </View>
          <MealNotes line={line} />
        </View>
      ))}
      {order.discount > 0 && (
        <View style={deliveryStyles.row}>
          <Text style={deliveryStyles.detail}>{order.voucherCode} discount</Text>
          <Text style={deliveryStyles.detail}>−₱{order.discount.toFixed(2)}</Text>
        </View>
      )}
      <View style={deliveryStyles.row}>
        <Text style={deliveryStyles.detail}>Delivery fee</Text>
        <Text style={deliveryStyles.detail}>₱{order.deliveryFee.toFixed(2)}</Text>
      </View>
      <View style={[deliveryStyles.row, deliveryStyles.bill]}>
        <View>
          <Text style={deliveryStyles.detail}>{cancelled ? "Cancelled bill" : order.paid ? "Paid in cash" : "Cash on delivery"}</Text>
          <Text style={deliveryStyles.amount}>₱{order.total.toFixed(2)}</Text>
        </View>
        <Text accessibilityLiveRegion="polite" style={deliveryStyles.detail}>
          {cancelled ? "No amount due" : order.paid ? "Paid" : "Unpaid"}
        </Text>
      </View>
      <Text style={deliveryStyles.detail}>
        {assignedName ? `Rider · ${assignedName}` : order.riderId ? "Rider assigned" : "Rider not assigned yet"}
      </Text>
      {order.cancellationReason ? <Text style={deliveryStyles.detail}>{order.cancellationReason}</Text> : null}
      {children}
    </View>
  );
}

export function DeliveryAction({ label, onPress, primary = false, disabled = false }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={[deliveryStyles.button, primary && deliveryStyles.primary, disabled && deliveryStyles.disabled]}
    >
      <Text style={[deliveryStyles.buttonLabel, primary && deliveryStyles.primaryLabel]}>{label}</Text>
    </Pressable>
  );
}

export const deliveryStyles = StyleSheet.create({
  card: { backgroundColor: "#FFFFFF", borderRadius: 14, padding: 14, gap: 8, marginBottom: 12 },
  row: sharedStyles.wrappingRow,
  heading: { color: "#292323", fontSize: 16, fontWeight: "700", flexShrink: 1 },
  body: { color: "#292323", fontSize: 14, flexShrink: 1 },
  detail: { color: "#625B5B", fontSize: 13, flexShrink: 1 },
  badge: { color: "#6D0808", backgroundColor: "#F8ECE8", paddingVertical: 4, paddingHorizontal: 8, borderRadius: 16, fontSize: 12 },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: "#D8C8CC", marginVertical: 3 },
  bill: sharedStyles.creamPanel,
  amount: { color: "#6D0808", fontSize: 18, fontWeight: "800" },
  button: { borderWidth: 1, borderColor: "#6D0808", borderRadius: 10, minHeight: 44, alignItems: "center", justifyContent: "center", padding: 9 },
  buttonLabel: sharedStyles.buttonLabel,
  primary: { backgroundColor: "#6D0808" },
  primaryLabel: { color: "#FFFFFF" },
  disabled: { opacity: 0.45 },
  input: sharedStyles.fieldInput,
  check: { flexDirection: "row", alignItems: "center", gap: 8, minHeight: 44 },
  title: { color: "#6D0808", fontSize: 27, fontWeight: "800", marginBottom: 14 },
  sectionLabel: { color: "#6D0808", fontSize: 15, fontWeight: "700", marginBottom: 10 },
});
