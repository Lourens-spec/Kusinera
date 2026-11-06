import React from "react";
import { Pressable, Text, View } from "react-native";
import styles from "./styles";

export default function CartItem({ item, quantity, changeQuantity }) {
  return (
    <View style={styles.card}>
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
  );
}
