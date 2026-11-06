import React from "react";
import { Text, TextInput, View } from "react-native";
import AuthButton from "../authButton";
import styles from "./styles";

export function TableIdentification({ tableNumber, setTableNumber, hasTable }) {
  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <Text style={styles.name}>Table identification</Text>
        <Text accessibilityLiveRegion="polite" style={hasTable ? styles.saved : styles.missing}>
          {hasTable ? "Entered" : "Missing"}
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
  );
}

export function OrderPlacement({ hasItems, hasTable, placeOrder }) {
  return (
    <View style={styles.card}>
      <Text accessibilityRole="header" style={styles.name}>Order placement</Text>
      {hasItems && hasTable ? (
        <>
          <Text style={styles.description}>Payment method: cash at the counter.</Text>
          <AuthButton title="Place order" onPress={placeOrder} />
        </>
      ) : (
        <Text style={styles.description}>
          {!hasItems ? "Add a dish to place an order." : "Enter your table number to place an order."}
        </Text>
      )}
    </View>
  );
}
