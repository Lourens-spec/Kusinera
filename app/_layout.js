import React from "react";
import { Stack } from "expo-router";
import { CartProvider } from "../context/CartContext";
import { AuthProvider } from "../context/AuthContext";

export default function RootLayout() {
  return (
    <AuthProvider>
      <CartProvider>
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: "#E0E6F8" } }} />
      </CartProvider>
    </AuthProvider>
  );
}
