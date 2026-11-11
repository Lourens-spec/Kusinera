import { Feather, Pressable, Switch, Text, TextInput, View } from "../components/Themed";
import React, { useState } from "react";
import { Redirect, useRouter } from "expo-router";
import ScreenContainer from "../components/ScreenContainer";
import DeliveryTicket, { DeliveryAction, deliveryStyles as styles } from "../components/delivery/DeliveryTicket";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

export default function RiderRoute() {
  const router = useRouter();
  const { currentUser, logout } = useAuth();
  const { orders } = useCart();

  if (!currentUser) return <Redirect href="/login" />;
  if (currentUser.role !== "rider") return <Redirect href="/" />;
  const deliveries = orders.filter((order) => order.type === "delivery" && order.rider === currentUser.username);

  function signOut() {
    logout();
    router.dismissTo("/");
  }

  return (
    <ScreenContainer keyboardShouldPersistTaps="handled">
      <View style={styles.row}>
        <Text style={styles.title}>Rider deliveries</Text>
        <DeliveryAction label="Log out" onPress={signOut} />
      </View>
      <Text style={styles.sectionLabel}>{currentUser.displayName || currentUser.username}</Text>
      {deliveries.length === 0 && <Text style={styles.detail}>No assigned deliveries yet.</Text>}
      {deliveries.map((order) => <RiderDelivery key={order.id} order={order} />)}
    </ScreenContainer>
  );
}

function RiderDelivery({ order }) {
  const { startDelivery, completeDelivery, reportDeliveryIssue } = useCart();
  const [cashReceived, setCashReceived] = useState(false);
  const [issue, setIssue] = useState("");
  const [showIssue, setShowIssue] = useState(false);
  const [issueError, setIssueError] = useState("");

  function reportIssue() {
    if (!issue.trim()) {
      setIssueError("Describe the delivery problem first.");
      return;
    }
    reportDeliveryIssue(order.id, issue);
    setIssueError("");
  }

  return (
    <DeliveryTicket order={order}>
      {["Accepted", "Preparing"].includes(order.status) && <Text style={styles.detail}>Waiting for the kitchen to finish packing.</Text>}
      {order.status === "Ready" && (
        <DeliveryAction label="Picked up · start delivery" onPress={() => startDelivery(order.id)} primary />
      )}
      {order.status === "Out for delivery" && (
        <>
          <View style={styles.check}>
            <Switch accessibilityLabel="Cash received from customer" value={cashReceived} onValueChange={setCashReceived} />
            <Text style={styles.body}>Cash received from customer</Text>
          </View>
          <DeliveryAction label="Confirm delivered" disabled={!cashReceived} onPress={() => completeDelivery(order.id, cashReceived)} primary />
          <Pressable accessibilityRole="button" accessibilityState={{ expanded: showIssue }} onPress={() => setShowIssue((open) => !open)} style={styles.check}>
            <Feather name="alert-circle" color="#6D0808" size={17} />
            <Text style={styles.body}>Delivery problem?</Text>
          </Pressable>
          {showIssue && (
            <>
              <TextInput accessibilityLabel="Delivery problem" placeholder="For example, customer could not be reached" multiline maxLength={200} value={issue} onChangeText={setIssue} style={styles.input} />
              {issueError ? <Text accessibilityRole="alert" style={styles.detail}>{issueError}</Text> : null}
              <DeliveryAction label="Report to staff" onPress={reportIssue} />
              {order.deliveryIssue ? <Text accessibilityLiveRegion="polite" style={styles.detail}>Reported · {order.deliveryIssue}</Text> : null}
            </>
          )}
        </>
      )}
      {order.status === "Delivered" && (
        <Text style={styles.detail}>{order.cashRemitted ? "Staff received the collected cash." : "Delivery completed. Hand the collected cash to staff."}</Text>
      )}
    </DeliveryTicket>
  );
}
