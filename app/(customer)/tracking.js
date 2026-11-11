import { Text } from "../../components/Themed";
import React from "react";
import { Redirect, useRouter } from "expo-router";
import AuthButton from "../../components/authButton";
import OrderTracking from "../../components/cart/OrderTracking";
import styles from "../../components/cart/styles";
import ScreenContainer from "../../components/ScreenContainer";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";

export default function TrackingRoute() {
  const router = useRouter();
  const { currentUser } = useAuth();
  const { customerOrders } = useCart();

  if (currentUser?.role === "rider") return <Redirect href="/rider" />;
  if (currentUser?.role === "staff" || currentUser?.role === "kitchen") return <Redirect href="/kitchen" />;

  return (
    <ScreenContainer tabScreen backgroundColor="#FFF8ED">
      <Text style={styles.brand}>KUSINERA</Text>
      <Text accessibilityRole="header" style={styles.title}>My orders</Text>
      {currentUser ? (
        <OrderTracking orders={customerOrders} />
      ) : (
        <>
          <Text style={styles.description}>Log in to view your orders and payment status.</Text>
          <AuthButton
            title="Log in"
            onPress={() => router.push({ pathname: "/login", params: { fromTracking: "1" } })}
          />
        </>
      )}
    </ScreenContainer>
  );
}

