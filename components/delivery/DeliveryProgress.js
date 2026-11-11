import { Feather, Text, View } from "../Themed";
import sharedStyles from "../../styles/sharedStyles";
import React from "react";
import { StyleSheet } from "react-native";

const steps = ["Placed", "Accepted", "Preparing", "Ready", "Out for delivery", "Delivered"];

export default function DeliveryProgress({ status }) {
  if (status === "Cancelled") return <Text style={styles.label}>This delivery was cancelled.</Text>;

  return (
    <View accessibilityLabel={`Delivery status: ${status}`} style={styles.progress}>
      {steps.map((step, index) => {
        const completed = index <= steps.indexOf(status);
        return (
          <View key={step} style={styles.row}>
            <Feather name={completed ? "check-circle" : "circle"} color={completed ? "#23543A" : "#A39898"} size={15} />
            <Text style={[styles.label, completed && styles.complete, step === status && styles.current]}>{step}</Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  progress: { backgroundColor: "#FFF1DA", padding: 12, borderRadius: 10, gap: 7 },
  row: sharedStyles.controls,
  label: sharedStyles.mutedText,
  complete: { color: "#23543A" },
  current: { fontWeight: "800" },
});
