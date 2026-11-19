import React from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { PromotionsProvider } from "../lib/promotions";
import { CartProvider } from "../context/CartContext";
import { AuthProvider } from "../context/AuthContext";
import { MenuProvider } from "../context/MenuContext";
import { ThemeProvider, useTheme } from "../context/ThemeContext";

const menuScreens = ["favorites", "delivery-coverage", "whats-new", "promos", "settings", "login", "info", "help", "contact", "feedback", "edit-profile"];
const menuTransition = { animation: "fade" };

export default function RootLayout() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <MenuProvider>
          <PromotionsProvider>
          <CartProvider>
            <RootNavigator />
          </CartProvider>
          </PromotionsProvider>
        </MenuProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

function RootNavigator() {
  const { darkMode } = useTheme();
  return (
    <>
      <StatusBar style={darkMode ? "light" : "dark"} />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: darkMode ? "#211819" : "#E0E6F8" } }}>
        <Stack.Screen name="(customer)" options={{ animation: "none" }} />
        {menuScreens.map(name => <Stack.Screen key={name} name={name} options={menuTransition} />)}
      </Stack>
    </>
  );
}
