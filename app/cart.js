import React from "react";
import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import AuthButton from "../components/authButton";
import ScreenContainer from "../components/ScreenContainer";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

export default function CartRoute() {
  const router = useRouter();
  const { currentUser } = useAuth();
  const { lines, total, changeQuantity, tableNumber, setTableNumber, orders, placeOrder } = useCart();
  const canPlaceOrder = lines.length > 0 && tableNumber.trim().length > 0;

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
      <View style={styles.card}>
        <View style={styles.row}>
          <Text style={styles.name}>Table identification</Text>
          <Text accessibilityLiveRegion="polite" style={tableNumber.trim() ? styles.saved : styles.missing}>
            {tableNumber.trim() ? "Entered" : "Missing"}
          </Text>
        </View>
        <TextInput
          accessibilityLabel="Table number"
          placeholder="Enter your table number"
          placeholderTextColor="#625B5B"
          value={tableNumber}
          onChangeText={setTableNumber}
          autoCapitalize="characters"
          autoCorrect={false}
          style={styles.input}
        />
      </View>
      {lines.length === 0 && <Text style={styles.description}>Your cart is empty.</Text>}
      {lines.map(({ item, quantity }) => (
        <View key={item.id} style={styles.card}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.description}>PHP {item.price.toFixed(2)} each</Text>
          <View style={styles.row}>
            <View style={styles.controls}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={quantity === 1 ? `Remove ${item.name}` : `Decrease ${item.name} quantity`}
                onPress={() => changeQuantity(item.id, -1)}
                style={styles.control}
              >
                <Text style={styles.accent}>−</Text>
              </Pressable>
              <Text accessibilityLabel={`Quantity: ${quantity}`}>{quantity}</Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Increase ${item.name} quantity`}
                onPress={() => changeQuantity(item.id, 1)}
                style={styles.control}
              >
                <Text style={styles.accent}>+</Text>
              </Pressable>
            </View>
            <Text style={styles.accent}>PHP {(item.price * quantity).toFixed(2)}</Text>
          </View>
        </View>
      ))}
      {lines.length > 0 && (
        <View style={[styles.card, styles.row]}>
          <Text style={styles.name}>Total</Text>
          <Text accessibilityLiveRegion="polite" style={styles.accent}>PHP {total.toFixed(2)}</Text>
        </View>
      )}
      <View style={styles.card}>
        <Text accessibilityRole="header" style={styles.name}>Order placement</Text>
        {canPlaceOrder ? (
          <>
            <Text style={styles.description}>Payment method: cash at the counter.</Text>
            <AuthButton title="Place order" onPress={placeOrder} />
          </>
        ) : (
          <Text style={styles.description}>
            {lines.length === 0 ? "Add a dish to place an order." : "Enter your table number to place an order."}
          </Text>
        )}
      </View>
      <View style={styles.card}>
        <Text accessibilityRole="header" style={styles.name}>Order tracking</Text>
        <Text style={styles.description}>Orders placed in this session appear here.</Text>
        {orders.length === 0 && <Text style={styles.description}>No orders yet.</Text>}
        {orders.map((order) => (
          <View key={order.id} style={styles.order}>
            <View style={styles.row}>
              <Text style={styles.name}>Order #{order.id}</Text>
              <Text accessibilityLiveRegion="polite" style={styles.saved}>{order.status}</Text>
            </View>
            <Text style={styles.description}>Table {order.table}</Text>
            {order.lines.map(({ item, quantity }) => (
              <Text key={item.id} style={styles.description}>{quantity} × {item.name}</Text>
            ))}
            <Text style={styles.name}>Billing and payment</Text>
            <Text style={styles.description}>Bill total: PHP {order.total.toFixed(2)}</Text>
            <View style={styles.row}>
              <Text style={styles.accent}>Amount due: PHP {(order.paid ? 0 : order.total).toFixed(2)}</Text>
              <Text accessibilityLiveRegion="polite" style={order.paid ? styles.saved : styles.missing}>
                {order.paid ? "Paid in cash" : "Unpaid"}
              </Text>
            </View>
          </View>
        ))}
      </View>
      <AuthButton title="Back to menu" onPress={() => router.dismissTo("/")} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: { color: "#292323", fontSize: 30, fontWeight: "800", marginBottom: 20 },
  card: { backgroundColor: "#FFFFFF", borderRadius: 20, padding: 16, marginBottom: 12, gap: 8 },
  name: { color: "#292323", fontSize: 18, fontWeight: "700" },
  description: { color: "#625B5B", fontSize: 15 },
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 },
  input: {
    borderWidth: 1,
    borderColor: "#A39898",
    borderRadius: 12,
    paddingHorizontal: 12,
    minHeight: 44,
    color: "#292323",
    fontSize: 15,
  },
  missing: {
    color: "#6D0808",
    backgroundColor: "#F8ECE8",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  saved: {
    color: "#23543A",
    backgroundColor: "#E4F4E8",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  order: { borderTopWidth: 1, borderTopColor: "#EEE8E8", paddingTop: 12, gap: 6 },
  controls: { flexDirection: "row", alignItems: "center", gap: 12 },
  control: { backgroundColor: "#F8ECE8", borderRadius: 12, width: 44, height: 44, alignItems: "center", justifyContent: "center" },
  accent: { color: "#6D0808", fontSize: 16, fontWeight: "700" },
});
