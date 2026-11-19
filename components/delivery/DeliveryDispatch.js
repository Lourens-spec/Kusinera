import { Text } from "../Themed";
import React, { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import ChoiceField from "../ChoiceField";
import DeliveryTicket, { DeliveryAction, deliveryStyles } from "./DeliveryTicket";

export default function DeliveryDispatch({ orders, surfaceStyle }) {
  const { accounts, currentUser } = useAuth();
  const [directory, setDirectory] = useState(null);
  const staffId = currentUser?.role === "staff" ? currentUser.id : null;

  useEffect(() => {
    if (!staffId || !supabase) return;
    let active = true;
    supabase.rpc("list_delivery_riders").then(({ data, error }) => {
      if (active) setDirectory({ staffId, riders: data ?? [], failed: Boolean(error) });
    }, () => {
      if (active) setDirectory({ staffId, riders: [], failed: true });
    });
    return () => { active = false; };
  }, [staffId]);

  const cloudDirectory = directory?.staffId === staffId ? directory : null;
  const cloudRiders = (cloudDirectory?.riders ?? []).map(rider => ({
    value: rider.id, label: rider.display_name || rider.username,
  }));
  const demoRiders = accounts.filter(account => account.role === "rider")
    .map(account => ({ value: account.username, label: account.displayName || account.username }));

  return (
    <>
      {orders.map(order => <DispatchTicket key={order.id} order={order} surfaceStyle={surfaceStyle}
        riders={order.cloudId ? cloudRiders : demoRiders} directory={order.cloudId ? cloudDirectory : null} />)}
    </>
  );
}

function DispatchTicket({ order, surfaceStyle, riders, directory }) {
  const { reviewDelivery, assignRider, recordRiderCash } = useCart();
  const [selection, setSelectedRider] = useState(null);
  const assigned = order.riderId ?? order.rider;
  const selectedRider = selection ?? assigned ?? "";
  const riderName = riders.find(rider => rider.value === assigned)?.label;
  const canAssign = ["Accepted", "Preparing", "Ready"].includes(order.status);

  return (
    <DeliveryTicket order={order} surfaceStyle={surfaceStyle} riderName={riderName}>
      {order.status === "Placed" && (
        <>
          <DeliveryAction label="Accept order" onPress={() => reviewDelivery(order.id, true)} primary />
          <DeliveryAction label="Decline order" onPress={() => reviewDelivery(order.id, false)} />
        </>
      )}
      {canAssign && (
        <>
          {riders.length ? <>
            <ChoiceField label="Assign rider" options={riders} value={selectedRider} onChange={setSelectedRider} />
            <DeliveryAction label="Save rider assignment" disabled={!selectedRider || selectedRider === assigned} onPress={() => assignRider(order.id, selectedRider)} />
          </> : <Text style={deliveryStyles.detail}>{directory?.failed ? "Couldn’t load rider accounts." : order.cloudId && !directory ? "Loading riders…" : "No rider accounts available."}</Text>}
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
