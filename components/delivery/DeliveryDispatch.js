import { Text } from "../Themed";
import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import ChoiceField from "../ChoiceField";
import DeliveryTicket, { DeliveryAction, deliveryStyles } from "./DeliveryTicket";

export default function DeliveryDispatch({ orders, surfaceStyle }) {
  return (
    <>
      {orders.map((order) => <DispatchTicket key={order.id} order={order} surfaceStyle={surfaceStyle} />)}
    </>
  );
}

function DispatchTicket({ order, surfaceStyle }) {
  const { accounts } = useAuth();
  const { reviewDelivery, assignRider, recordRiderCash } = useCart();
  const [selectedRider, setSelectedRider] = useState(order.rider ?? "");
  const riders = accounts.filter((account) => account.role === "rider")
    .map((account) => ({ value: account.username, label: account.displayName || account.username }));
  const canAssign = ["Accepted", "Preparing", "Ready"].includes(order.status);

  return (
    <DeliveryTicket order={order} surfaceStyle={surfaceStyle}>
      {order.status === "Placed" && (
        <>
          <DeliveryAction label="Accept order" onPress={() => reviewDelivery(order.id, true)} primary />
          <DeliveryAction label="Decline order" onPress={() => reviewDelivery(order.id, false)} />
        </>
      )}
      {canAssign && (
        <>
          <ChoiceField label="Assign rider" options={riders} value={selectedRider} onChange={setSelectedRider} />
          <DeliveryAction label="Save rider assignment" disabled={!selectedRider} onPress={() => assignRider(order.id, selectedRider)} />
        </>
      )}
      {order.deliveryIssue && order.status !== "Delivered" ? (
        <Text accessibilityRole="alert" style={deliveryStyles.body}>Delivery issue · {order.deliveryIssue}</Text>
      ) : null}
      {order.status === "Delivered" && (
        order.cashRemitted ? <Text style={deliveryStyles.detail}>Rider cash received by staff.</Text> : (
          <DeliveryAction label="Record rider cash received" onPress={() => recordRiderCash(order.id)} />
        )
      )}
    </DeliveryTicket>
  );
}
