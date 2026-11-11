import { Text, View } from "../../components/Themed";
import React, { useState } from "react";
import { Redirect, useRouter } from "expo-router";
import { Keyboard } from "react-native";
import AuthButton from "../../components/authButton";
import { CartItems } from "../../components/cart/CartItem";
import { OrderPlacement, TableIdentification } from "../../components/cart/Checkout";
import DeliveryDetails from "../../components/cart/DeliveryDetails";
import VoucherPanel from "../../components/cart/VoucherPanel";
import MenuFilters from "../../components/MenuFilters";
import styles from "../../components/cart/styles";
import ScreenContainer from "../../components/ScreenContainer";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import { isCustomer, validateDelivery } from "../../utils/delivery";
import { useMenuGlass } from "../../styles/menuGlass";

export default function CartRoute() {
  const router = useRouter();
  const { currentUser } = useAuth();
  const glass = useMenuGlass();
  const {
    lines, count, total, orderTotal, deliveryFee, discount, checkout, error, notice, changeQuantity,
    tableNumber, setTableNumber, customerOrders, placeOrder, setOrderType, setDeliveryDetails,
  } = useCart();
  const [previousOrderCount, setPreviousOrderCount] = useState(null);
  const hasTable = tableNumber.trim().length > 0;
  const isDelivery = checkout.type === "delivery";
  const detailsError = isDelivery ? validateDelivery(checkout.delivery) : null;
  const hasDetails = isDelivery ? !detailsError : hasTable;
  const hasUnavailableItems = lines.some(({ item }) => item.available === false);
  const placedOrder = previousOrderCount !== null && customerOrders.length > previousOrderCount ? customerOrders[0] : null;

  if (currentUser?.role === "rider") return <Redirect href="/rider" />;
  if (currentUser?.role === "staff" || currentUser?.role === "kitchen") return <Redirect href="/kitchen" />;
  function submitOrder() {
    setPreviousOrderCount(customerOrders.length);
    Keyboard.dismiss();
    placeOrder();
  }

  return (
    <ScreenContainer tabScreen backgroundColor="#FFF8ED" keyboardShouldPersistTaps="handled">
      <Text style={styles.brand}>KUSINERA</Text>
      <Text accessibilityRole="header" style={styles.title}>Your tray</Text>
      {isCustomer(currentUser) ? (
        <>
          {placedOrder && (
            <View style={[styles.card, glass.surface]}>
              <Text accessibilityLiveRegion="polite" style={styles.accent}>
                Order #{placedOrder.id} placed{placedOrder.type === "delivery" ? " for delivery." : ` for table ${placedOrder.table}.`}
              </Text>
              <AuthButton title="View your orders" onPress={() => router.navigate("/tracking")} />
            </View>
          )}
          {notice ? <Text accessibilityLiveRegion="polite" style={[styles.card, styles.accent]}>{notice}</Text> : null}
          <MenuFilters
            options={["Dine-in", "Delivery"]}
            selectedFilter={isDelivery ? "Delivery" : "Dine-in"}
            onSelect={(label) => setOrderType(label === "Delivery" ? "delivery" : "dine-in")}
          />
          {isDelivery ? (
            <DeliveryDetails details={checkout.delivery} onChange={setDeliveryDetails} />
          ) : (
            <TableIdentification tableNumber={tableNumber} setTableNumber={setTableNumber} hasTable={hasTable} />
          )}
          <CartItems lines={lines} count={count} changeQuantity={changeQuantity} />
          {count > 0 && <VoucherPanel />}
          <OrderPlacement
            total={orderTotal} subtotal={total} deliveryFee={deliveryFee} discount={discount} isDelivery={isDelivery}
            hasItems={count > 0} hasTable={hasDetails} detailsMessage={detailsError}
            hasUnavailableItems={hasUnavailableItems} placeOrder={submitOrder}
          />
          {error ? <Text accessibilityRole="alert" style={styles.accent}>{error}</Text> : null}
        </>
      ) : (
        <>
          <Text style={styles.description}>Log in to add dishes and place an order.</Text>
          <AuthButton title="Log in" onPress={() => router.push({ pathname: "/login", params: { fromCart: "1" } })} />
        </>
      )}
    </ScreenContainer>
  );
}

