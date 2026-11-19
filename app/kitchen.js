import { Text } from "../components/Themed";
import React from "react";
import { Redirect, useRouter } from "expo-router";
import { StyleSheet } from "react-native";
import AuthButton from "../components/authButton";
import KitchenQueue from "../components/KitchenQueue";
import StaffOrders from "../components/StaffOrders";
import ScreenContainer from "../components/ScreenContainer";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

export default function KitchenRoute() {
  const router = useRouter();
  const { currentUser, logout } = useAuth();
  const { orders, syncError, advanceOrder, recordCashPayment } = useCart();

  const role = currentUser?.role;
  const isStaff = role === "staff";

  if (role === "rider") return <Redirect href="/rider" />;
  if (!isStaff && role !== "kitchen") {
    return (
      <ScreenContainer>
        <Text accessibilityRole="header" style={styles.title}>Staff &amp; kitchen</Text>
        <Text style={styles.detail}>Log in with a staff or kitchen account to view orders.</Text>
        <AuthButton
          title={currentUser ? "Switch account" : "Log in"}
          onPress={() => {
            logout();
            router.push("/login");
          }}
        />
        <AuthButton title="Back to menu" onPress={() => router.dismissTo("/")} />
      </ScreenContainer>
    );
  }

  function signOut() {
    logout();
    router.dismissTo("/");
  }

  if (role === "kitchen") {
    return <KitchenQueue orders={orders} syncError={syncError} onAdvance={advanceOrder} onLogout={signOut} />;
  }

  return (
    <StaffOrders orders={orders} syncError={syncError} onAdvance={advanceOrder} onPayment={recordCashPayment} onLogout={signOut} />
  );
}

const styles = StyleSheet.create({
  title: { color: "#292323", fontSize: 30, fontWeight: "800", marginBottom: 20 },
  detail: { color: "#625B5B", fontSize: 15 },
});
