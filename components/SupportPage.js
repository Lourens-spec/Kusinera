import { Feather, Pressable, Text, TextInput, View } from "./Themed";
import sharedStyles from "../styles/sharedStyles";
import React, { useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Linking, StyleSheet } from "react-native";
import ScreenContainer from "./ScreenContainer";
import { useMenuGlass } from "../styles/menuGlass";
import AuthButton from "./authButton";
import { useAuth } from "../context/AuthContext";
import { restaurantContact } from "../data/restaurantContact";

export default function SupportPage({ title, children }) {
  const glass = useMenuGlass();
  const router = useRouter();
  const { fromSettings } = useLocalSearchParams();
  const backToSettings = fromSettings === "1";
  return (
    <ScreenContainer glassBackground keyboardShouldPersistTaps="handled">
      <Text style={styles.brand}>KUSINERA · HERE TO HELP</Text>
      <Text accessibilityRole="header" style={styles.title}>{title}</Text>
      <View style={[styles.card, glass.surface]}>{children}</View>
      <Pressable accessibilityRole="button" onPress={() => router.dismissTo(backToSettings ? "/settings" : "/")} style={styles.back}>
        <Text style={styles.link}>‹ {backToSettings ? "Back to Settings" : "Back to menu"}</Text>
      </Pressable>
    </ScreenContainer>
  );
}

export function SupportText({ heading, children }) {
  return <View style={styles.section}><Text style={styles.heading}>{heading}</Text><Text style={styles.body}>{children}</Text></View>;
}

export function FeedbackForm({ ratingMode = false }) {
  const { currentUser } = useAuth();
  const [category, setCategory] = useState("Suggestion");
  const [rating, setRating] = useState(0);
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("");
  async function compose() {
    if (ratingMode && !rating) return setStatus("Choose a star rating first.");
    if (!ratingMode && message.trim().length < 10) return setStatus("Please write at least 10 characters.");
    if (!restaurantContact.email) return setStatus("Feedback email is not set yet. Your message has not been sent.");
    const subject = encodeURIComponent(ratingMode ? "Kusinera rating" : `Kusinera — ${category}`);
    const summary = ratingMode ? `Rating: ${rating}/5\n\n` : "";
    const body = encodeURIComponent(`${summary}${message.trim()}\n\nFrom: ${currentUser?.displayName || currentUser?.username || "Guest"}`);
    try {
      await Linking.openURL(`mailto:${restaurantContact.email}?subject=${subject}&body=${body}`);
      setStatus("Email draft opened. Review it and tap Send in your email app.");
    } catch {
      setStatus("Could not open your email app. Your message has not been sent. Please contact the restaurant directly.");
    }
  }
  return <>
    {ratingMode ? (
      <>
        <Text style={styles.body}>How was your experience with Kusinera?</Text>
        <View style={styles.stars}>
          {[1, 2, 3, 4, 5].map(value => (
            <Pressable key={value} accessibilityRole="button" accessibilityLabel={value === 1 ? "1 star" : `${value} stars`} accessibilityState={{ selected: value === rating }} onPress={() => { setRating(value); setStatus(""); }} style={[styles.star, value <= rating && styles.selectedStar]}>
              <Feather name="star" size={21} color="#6D0808" />
            </Pressable>
          ))}
        </View>
        {rating > 0 && <Text accessibilityLiveRegion="polite" style={styles.body}>{rating} out of 5 stars</Text>}
      </>
    ) : (
      <>
    <Text style={styles.body}>Share an idea or report a problem. Please leave out passwords and payment details.</Text>
    <View style={styles.categories}>{["Suggestion", "Report a problem"].map((label) => (
      <Pressable key={label} accessibilityRole="button" accessibilityState={{ selected: category === label }} onPress={() => { setCategory(label); setStatus(""); }} style={[styles.chip, category === label && styles.selected]}>
        <Text style={category === label ? styles.white : styles.link}>{label}</Text>
      </Pressable>
    ))}</View>
      </>
    )}
    <Text style={styles.heading}>{ratingMode ? "Comments (optional)" : "Your message"}</Text>
    <TextInput accessibilityLabel={ratingMode ? "Rating comments" : "Feedback message"} multiline maxLength={1000} value={message} onChangeText={(text) => { setMessage(text); setStatus(""); }} placeholder="Tell us what we can improve…" placeholderTextColor="#625B5B" style={styles.input} />
    <Text style={styles.body}>{message.length}/1000 characters</Text>
    {!restaurantContact.email && <Text style={styles.body}>Feedback email: Not set yet. Sending will be available once the restaurant adds its email address.</Text>}
    <AuthButton title="Open email draft" onPress={compose} />
    {!!status && <Text accessibilityLiveRegion="polite" style={styles.body}>{status}</Text>}
  </>;
}

const styles = StyleSheet.create({
  brand: { color: "#6D0808", fontSize: 11, fontWeight: "700", letterSpacing: 1 },
  title: { color: "#292323", fontSize: 30, fontWeight: "800", marginTop: 8, marginBottom: 18 },
  card: { borderRadius: 20, padding: 20, gap: 14 },
  section: { gap: 6 },
  heading: sharedStyles.itemName,
  body: { color: "#625B5B", fontSize: 14, lineHeight: 22 },
  back: { paddingVertical: 18, alignSelf: "flex-start" },
  link: sharedStyles.textLink,
  stars: { flexDirection: "row", flexWrap: "wrap", gap: 5 },
  star: { width: 44, height: 44, alignItems: "center", justifyContent: "center", borderRadius: 12, borderWidth: 1, borderColor: "#D9C9B8" },
  selectedStar: { backgroundColor: "#F5D7B7", borderColor: "#6D0808" },
  categories: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: { borderWidth: 1, borderColor: "#6D0808", borderRadius: 20, padding: 12 },
  selected: { backgroundColor: "#6D0808" },
  white: { color: "white", fontWeight: "600" },
  input: { minHeight: 140, borderWidth: 1, borderColor: "#A39898", borderRadius: 12, padding: 12, textAlignVertical: "top", color: "#292323", fontSize: 16 },
});
