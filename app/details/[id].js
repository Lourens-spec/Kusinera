import React from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import menuItems from "../../data/menuItems";
import DetailsScreen from "../../screens/DetailsScreen";

export default function DetailsRoute() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { currentUser } = useAuth();
  const { count, changeQuantity } = useCart();
  const item = menuItems.find((menuItem) => menuItem.id === id);

  function addToCart() {
    if (!item) return;
    if (!currentUser) {
      router.push({ pathname: "/login", params: { dishId: item.id } });
      return;
    }
    changeQuantity(item.id, 1);
  }

  function goBack() {
    // A direct link may not have a previous screen in the app.
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/");
    }
  }

  return (
    <DetailsScreen
      item={item}
      id={id}
      onBack={goBack}
      onAddToCart={addToCart}
      isLoggedIn={Boolean(currentUser)}
      onOpenCart={() => router.push("/cart")}
      cartCount={count}
    />
  );
}
