import { Text, View } from "../components/Themed";
import sharedStyles from "../styles/sharedStyles";
import React from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StyleSheet } from "react-native";
import AuthButton from "../components/authButton";
import ScreenContainer from "../components/ScreenContainer";
import { useMenuGlass } from "../styles/menuGlass";

const orderSteps = [
  "Browse the menu and open a dish you want to order.",
  "Log in, then add the dish to your cart.",
  "Open Tray and choose Dine-in or Delivery. Enter your table number for dine-in, or a recipient, mobile number, street, and CDO barangay for delivery.",
  "Check the total and place your order. Follow its progress in Orders. Pay at the counter for dine-in, or pay the rider on delivery.",
];

export default function InfoRoute() {
  const glass = useMenuGlass();
  const router = useRouter();
  const { topic, fromSettings } = useLocalSearchParams();
  const isOrderingGuide = topic === "ordering";

  return (
    <ScreenContainer glassBackground>
      <Text accessibilityRole="header" style={styles.title}>
        {isOrderingGuide ? "How to order" : "About Kusinera"}
      </Text>
      <View style={[styles.card, glass.surface]}>
        {isOrderingGuide ? (
          orderSteps.map((step, index) => (
            <Text key={step} style={styles.body}>{index + 1}. {step}</Text>
          ))
        ) : (
          <>
            <Text style={styles.body}>Kusinera is a Filipino comfort food app inspired by the meals we look forward to sharing at home. Our menu brings together familiar favorites, from savory Chicken Adobo and tangy Sinigang na Baboy to creamy Kare-Kare, Pancit Canton, and a refreshing Halo-Halo to end the meal.</Text>
            <Text style={styles.body}>If you’re dining with us, you can browse the menu and order right from your table. If you’d rather enjoy your meal at home, delivery is available within Cagayan de Oro City. Save the dishes you love, add a note to your meal, and follow your order’s progress in the app.</Text>
            <Text style={styles.body}>Whether you’re sharing lunch with friends or craving a favorite after a long day, there’s a seat for you at Kusinera.</Text>
          </>
        )}
      </View>
      <AuthButton title={fromSettings === "1" ? "Back to Settings" : "Back to menu"} onPress={() => router.dismissTo(fromSettings === "1" ? "/settings" : "/")} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: sharedStyles.screenTitle,
  card: { backgroundColor: "#FFFFFF", borderRadius: 20, padding: 16, gap: 12 },
  body: sharedStyles.note,
});
