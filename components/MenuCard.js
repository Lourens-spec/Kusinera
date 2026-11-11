import { Image, Pressable, Text, View, Ionicons } from "./Themed";
import sharedStyles from "../styles/sharedStyles";
import React from "react";
import { StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

export default function MenuCard({ item, onPress, surfaceStyle }) {
  const router = useRouter();
  const { popularIds } = useCart();
  const { currentUser, favoriteIds, toggleFavorite } = useAuth();
  const isFavorite = favoriteIds.includes(item.id);

  function onHeartPress() {
    if (currentUser) toggleFavorite(item.id);
    else router.push("/login");
  }

  return (
    <View style={[styles.card, surfaceStyle]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`View ${item.name}`}
        onPress={() => onPress(item.id)}
        style={({ pressed }) => [styles.details, pressed && styles.pressed]}
      >
        {item.image ? (
          <Image source={item.image} style={styles.image} resizeMode="cover" />
        ) : (
          <View style={[styles.image, styles.placeholder]}>
            <Ionicons name="restaurant-outline" size={24} color="#6D0808" />
          </View>
        )}
        <View style={styles.info}>
          {popularIds.includes(item.id) && <Text style={styles.badge}>Bestseller</Text>}
          <Text style={styles.category}>{item.category}</Text>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.price}>PHP {item.price.toFixed(2)}</Text>
          {item.available === false && <Text style={styles.price}>Sold out</Text>}
        </View>
        <Ionicons name="chevron-forward" size={20} color="#6D0808" />
      </Pressable>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={isFavorite ? `Remove ${item.name} from favorites` : `Save ${item.name} to favorites`}
        accessibilityState={{ selected: isFavorite }}
        onPress={onHeartPress}
        style={[styles.heart, isFavorite && styles.saved]}
      >
        <Ionicons name={isFavorite ? "heart" : "heart-outline"} size={22} color="#6D0808" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "#FFFFFF", borderRadius: 18, padding: 12, marginBottom: 12 },
  details: { flex: 1, flexDirection: "row", alignItems: "center", gap: 8 },
  heart: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" },
  saved: { backgroundColor: "#F8ECE8" },
  pressed: { opacity: 0.7 },
  image: { width: 64, height: 64, borderRadius: 16, backgroundColor: "#F8ECE8" },
  info: { flex: 1 },
  badge: { alignSelf: "flex-start", color: "#6D0808", backgroundColor: "#FFF1DA", fontSize: 11, fontWeight: "700", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10, marginBottom: 5 },
  placeholder: sharedStyles.imagePlaceholder,
  category: { fontSize: 12, color: "#716767", marginBottom: 4 },
  name: { fontSize: 18, fontWeight: "700", color: "#292323", marginBottom: 6 },
  price: sharedStyles.price,
});

