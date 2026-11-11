import { Pressable, Text, View } from "../Themed";
import React from "react";
import styles from "./styles";
import { useMenuGlass } from "../../styles/menuGlass";
import MealNotes from "../MealNotes";
import { lineUnitPrice } from "../../utils/mealOptions";

export default function CartItem({ line, changeQuantity }) {
  const { item, quantity } = line;
  const key = line.key ?? item.id;
  const price = lineUnitPrice(line);

  return (
    <View style={styles.item}>
      <View style={styles.row}>
        <View style={styles.itemCopy}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.description}>₱{price.toFixed(2)} each</Text>
          <MealNotes line={line} />
          {item.available === false && <Text style={styles.accent}>Sold out — remove from tray</Text>}
        </View>
        <Text style={styles.accent}>₱{(price * quantity).toFixed(2)}</Text>
      </View>
      <View style={styles.controls}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={quantity === 1 ? `Remove ${item.name}` : `Decrease ${item.name} quantity`}
          onPress={() => changeQuantity(key, -1)}
          style={styles.control}
        >
          <Text style={styles.accent}>−</Text>
        </Pressable>
        <Text style={styles.name} accessibilityLabel={`Quantity: ${quantity}`}>{quantity}</Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Increase ${item.name} quantity`}
          disabled={item.available === false || quantity >= 99}
          accessibilityState={{ disabled: item.available === false || quantity >= 99 }}
          onPress={() => changeQuantity(key, 1)}
          style={styles.control}
        >
          <Text style={styles.accent}>+</Text>
        </Pressable>
      </View>
    </View>
  );
}

export function CartItems({ lines, count, changeQuantity }) {
  const glass = useMenuGlass();
  return (
    <View style={[styles.card, glass.surface]}>
      <View style={styles.row}>
        <Text accessibilityRole="header" style={styles.name}>Your dishes</Text>
        <Text accessibilityLiveRegion="polite" style={styles.description}>
          {count} {count === 1 ? "item" : "items"}
        </Text>
      </View>
      {count === 0 && <Text style={styles.description}>Your cart is empty.</Text>}
      {lines.map((line) => (
        <CartItem key={line.key ?? line.item.id} line={line} changeQuantity={changeQuantity} />
      ))}
    </View>
  );
}
