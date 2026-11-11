import React from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import { useMenu } from "../../context/MenuContext";
import DetailsScreen from "../../screens/DetailsScreen";

export default function DetailsRoute() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { menuItems } = useMenu();
  const { currentUser } = useAuth();
  const { count, addMeal } = useCart();
  const item = menuItems.find((menuItem) => menuItem.id === id);

  function addToCart({ quantity = 1, addOnIds = [], notes = "" } = {}) {
    if (!item || item.available === false) return "This dish is sold out.";
    if (!currentUser) {
      router.push({ pathname: "/login", params: { dishId: item.id } });
      return "Log in to add this meal.";
    }
    return addMeal(item.id, quantity, addOnIds, notes);
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
