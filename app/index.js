import React from "react";
import { useRouter } from "expo-router";
import HomeScreen from "../screens/HomeScreen";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

export default function HomeRoute() {
  const router = useRouter();
  const { count } = useCart();
  const { currentUser, logout } = useAuth();

  function openItem(id) {
    router.push({ pathname: "/details/[id]", params: { id } });
  }

  return (
    <HomeScreen
      username={currentUser?.username}
      onSelectItem={openItem}
      onLogin={() => router.push("/login")}
      onLogout={logout}
      cartCount={count}
      onOpenCart={() => router.push("/cart")}
      onOpenKitchen={() => router.push("/kitchen")}
    />
  );
}
