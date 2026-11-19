import { Feather, Pressable, Text, TextInput, View } from "./Themed";
import sharedStyles from "../styles/sharedStyles";
import React, { useState } from "react";
import { StyleSheet } from "react-native";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { canRateOrder } from "../utils/orderReviews";

export default function OrderRating({ order }) {
  const { currentUser } = useAuth();
  const { rateOrder } = useCart();
  const [stars, setStars] = useState(order.rating?.stars || 0);
  const [comment, setComment] = useState(order.rating?.comment || "");
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const showForm = editing || !order.rating;
  if (!canRateOrder(order, currentUser)) return null;
  async function save() {
    if (saving) return;
    setSaving(true);
    setMessage("");
    try {
      const error = await rateOrder(order.id, stars, comment);
      setMessage(error || (order.cloudId ? "Thank you! Your rating is saved." : "Thank you! Your rating is saved for this session."));
      if (!error) setEditing(false);
    } finally {
      setSaving(false);
    }
  }
  function edit() {
    setStars(order.rating.stars);
    setComment(order.rating.comment);
    setMessage("");
    setEditing(true);
  }
  return <View style={styles.card}>
    <Text style={styles.title}>{showForm ? "How was your meal?" : "Your rating"}</Text>
    {showForm ? <>
      <View style={styles.row}>{[1, 2, 3, 4, 5].map((value) => (
        <Pressable key={value} accessibilityRole="button" accessibilityLabel={`Rate ${value} ${value === 1 ? "star" : "stars"}`} accessibilityState={{ selected: stars === value }} onPress={() => { setStars(value); setMessage(""); }} style={styles.star}>
          <Feather name="star" size={26} color={value <= stars ? "#6D0808" : "#A39898"} fill={value <= stars ? "#F3CF83" : "transparent"} />
        </Pressable>
      ))}</View>
      <TextInput accessibilityLabel="Optional order review" value={comment} onChangeText={setComment} maxLength={300} multiline placeholder="Add a comment (optional)" placeholderTextColor="#625B5B" style={styles.input} />
      <Pressable accessibilityRole="button" disabled={saving} onPress={save} style={styles.button}><Text style={styles.white}>{saving ? "Saving…" : "Save rating"}</Text></Pressable>
    </> : <>
      <Text style={styles.body}>{order.rating?.stars} / 5 stars</Text>
      {!!order.rating?.comment && <Text style={styles.body}>{order.rating.comment}</Text>}
      <Pressable accessibilityRole="button" onPress={edit} style={styles.edit}><Text style={styles.link}>Edit rating</Text></Pressable>
    </>}
    {!!message && <Text accessibilityLiveRegion="polite" style={styles.body}>{message}</Text>}
  </View>;
}

const styles = StyleSheet.create({
  card: { gap: 8, paddingTop: 14, marginTop: 10, borderTopWidth: 1, borderTopColor: "#EEE8E8" },
  title: sharedStyles.itemName,
  row: { flexDirection: "row", flexWrap: "wrap" },
  star: sharedStyles.closeButton,
  input: { borderWidth: 1, borderColor: "#A39898", borderRadius: 10, padding: 12, minHeight: 80, textAlignVertical: "top", color: "#292323", fontSize: 16 },
  button: { backgroundColor: "#6D0808", borderRadius: 12, padding: 14, alignItems: "center" },
  white: { color: "white", fontWeight: "700" },
  body: { color: "#625B5B", lineHeight: 21 },
  edit: { paddingVertical: 12, alignSelf: "flex-start" },
  link: sharedStyles.textLink,
});
