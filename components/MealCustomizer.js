import { Pressable, Switch, Text, TextInput, View } from "./Themed";
import sharedStyles from "../styles/sharedStyles";
import React, { useState } from "react";
import { StyleSheet } from "react-native";
import { mealAddOns } from "../utils/mealOptions";
import AuthButton from "./authButton";

export default function MealCustomizer({ item, isLoggedIn, onAdd }) {
  const [quantity, setQuantity] = useState(1);
  const [addOnIds, setAddOnIds] = useState([]);
  const [notes, setNotes] = useState("");
  const [message, setMessage] = useState("");
  const options = mealAddOns(item);
  const unitPrice = item.price + options.filter((option) => addOnIds.includes(option.id)).reduce((sum, option) => sum + option.price, 0);

  function toggle(id, selected) {
    setAddOnIds((current) => selected ? [...current, id] : current.filter((value) => value !== id));
    setMessage("");
  }

  function add() {
    const error = onAdd({ quantity, addOnIds, notes });
    setMessage(error || "Added to your tray.");
  }

  return (
    <View style={styles.options}>
      {options.map((option) => (
        <View key={option.id} style={styles.row}>
          <Text style={styles.label}>{option.name} · +₱{option.price.toFixed(2)} (sample price)</Text>
          <Switch accessibilityLabel={option.name} value={addOnIds.includes(option.id)} onValueChange={(selected) => toggle(option.id, selected)} />
        </View>
      ))}
      <Text style={styles.label}>Meal request (optional)</Text>
      <TextInput accessibilityLabel="Meal request" placeholder="For example, sauce on the side" placeholderTextColor="#625B5B" multiline maxLength={150} value={notes} onChangeText={(value) => { setNotes(value); setMessage(""); }} style={styles.input} />
      <Text style={styles.hint}>Requests depend on what the kitchen can accommodate.</Text>
      <View style={styles.row}>
        <Text style={styles.label}>Quantity</Text>
        <View style={styles.stepper}>
          <Pressable accessibilityRole="button" accessibilityLabel="Decrease meal quantity" disabled={quantity === 1} accessibilityState={{ disabled: quantity === 1 }} style={styles.step} onPress={() => { setQuantity(quantity - 1); setMessage(""); }}>
            <Text style={styles.label}>−</Text>
          </Pressable>
          <Text accessibilityLabel={`Quantity: ${quantity}`} style={styles.label}>{quantity}</Text>
          <Pressable accessibilityRole="button" accessibilityLabel="Increase meal quantity" disabled={quantity === 99} accessibilityState={{ disabled: quantity === 99 }} style={styles.step} onPress={() => { setQuantity(quantity + 1); setMessage(""); }}>
            <Text style={styles.label}>+</Text>
          </Pressable>
        </View>
      </View>
      <AuthButton title={isLoggedIn ? `Add to tray · ₱${(unitPrice * quantity).toFixed(2)}` : "Log in to add to tray"} onPress={add} />
      {message ? <Text accessibilityLiveRegion="polite" style={styles.label}>{message}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  options: { gap: 8 },
  row: sharedStyles.ticketRow,
  label: sharedStyles.formLabel,
  hint: sharedStyles.hint,
  input: { borderWidth: 1, borderColor: "#A39898", backgroundColor: "#FFFFFF", borderRadius: 10, padding: 10, minHeight: 60, fontSize: 16, color: "#292323" },
  stepper: { flexDirection: "row", alignItems: "center", gap: 12 },
  step: { width: 44, height: 44, borderRadius: 10, backgroundColor: "#FFFFFF", alignItems: "center", justifyContent: "center" },
});
