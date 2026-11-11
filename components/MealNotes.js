import { Text, View } from "./Themed";
import sharedStyles from "../styles/sharedStyles";
import React from "react";
import { StyleSheet } from "react-native";

export default function MealNotes({ line }) {
  const addOns = line.addOns ?? [];
  if (addOns.length === 0 && !line.notes) return null;

  return (
    <View style={styles.notes}>
      {addOns.length > 0 && <Text style={styles.addOns}>Add-ons · {addOns.map((addon) => addon.name).join(", ")}</Text>}
      {line.notes ? <Text style={styles.request}>Request · {line.notes}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  notes: { gap: 3, marginTop: 3 },
  addOns: sharedStyles.hint,
  request: { color: "#6D0808", fontSize: 13 },
});
