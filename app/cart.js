import React from "react";
import { useRouter } from "expo-router";
import { Text, View } from "react-native";
import AuthButton from "../components/authButton";
import { OrderPlacement, TableIdentification } from "../components/cart/Checkout";
import CartItem from "../components/cart/CartItem";
import OrderTracking from "../components/cart/OrderTracking";
import styles from "../components/cart/styles";
import ScreenContainer from "../components/ScreenContainer";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

export default function CartRoute() {
  const router = useRouter();
  const { currentUser } = useAuth();
  const { lines, total, changeQuantity, tableNumber, setTableNumber, orders, placeOrder } = useCart();
  const hasItems = lines.length > 0;
  const hasTable = tableNumber.trim().length > 0;

  if (!currentUser) {
    return (
      <ScreenContainer>
        <Text accessibilityRole="header" style={styles.title}>Shopping cart</Text>
        <Text style={styles.description}>Log in to add dishes and place an order.</Text>
        <AuthButton title="Log in" onPress={() => router.push({ pathname: "/login", params: { fromCart: "1" } })} />
        <AuthButton title="Back to menu" onPress={() => router.dismissTo("/")} />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <Text accessibilityRole="header" style={styles.title}>Shopping cart</Text>
      <TableIdentification tableNumber={tableNumber} setTableNumber={setTableNumber} hasTable={hasTable} />
      {!hasItems && <Text style={styles.description}>Your cart is empty.</Text>}
      {lines.map(({ item, quantity }) => (
        <CartItem key={item.id} item={item} quantity={quantity} changeQuantity={changeQuantity} />
      ))}
      {hasItems && (
        <View style={[styles.card, styles.row]}>
          <Text style={styles.name}>Total</Text>
          <Text accessibilityLiveRegion="polite" style={styles.accent}>PHP {total.toFixed(2)}</Text>
        </View>
      )}
      <OrderPlacement hasItems={hasItems} hasTable={hasTable} placeOrder={placeOrder} />
      <OrderTracking orders={orders} />
      <AuthButton title="Back to menu" onPress={() => router.dismissTo("/")} />
    </ScreenContainer>
  );
}
