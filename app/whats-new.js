import React from "react";
import { useRouter } from "expo-router";
import { StyleSheet } from "react-native";
import { Feather, Image, MaterialCommunityIcons, Pressable, Text, View } from "../components/Themed";
import ScreenContainer from "../components/ScreenContainer";
import { useMenuGlass } from "../styles/menuGlass";
import { useMenu } from "../context/MenuContext";
import initialMenu from "../data/menuItems";

const originalIds = new Set(initialMenu.map(dish => dish.id));
const picks = { "3": "Kitchen pick", "5": "Seasonal pick" };

export default function WhatsNewRoute() {
  const glass = useMenuGlass();
  const router = useRouter();
  const { menuItems } = useMenu();
  const newDishes = menuItems.filter(dish => !originalIds.has(dish.id));
  const featured = menuItems.filter(dish => picks[dish.id]);

  function viewDish(id) {
    router.push({ pathname: "/details/[id]", params: { id } });
  }

  return (
    <ScreenContainer glassBackground contentStyle={styles.page}>
      <View style={styles.header}>
        <Pressable accessibilityRole="button" accessibilityLabel="Back to menu" onPress={() => router.dismissTo("/")} style={styles.back}>
          <Feather name="arrow-left" size={21} color="#6D0808" />
        </Pressable>
        <Text accessibilityRole="header" style={styles.title}>What’s new</Text>
      </View>

      <Text accessibilityRole="header" style={styles.section}>From our kitchen</Text>
      {newDishes.map(dish => <FeaturedDish key={dish.id} dish={dish} label="New dish" onPress={() => viewDish(dish.id)} />)}
      {featured.map(dish => <FeaturedDish key={dish.id} dish={dish} label={picks[dish.id]} onPress={() => viewDish(dish.id)} />)}

      <Text accessibilityRole="header" style={styles.section}>Coming soon</Text>
      <View style={[styles.upcoming, glass.surface]}>
        <View style={styles.badge}><MaterialCommunityIcons name="pot-steam-outline" size={22} color="#6D0808" /></View>
        <View style={styles.upcomingCopy}>
          <Text style={styles.label}>In the works</Text>
          <Text style={styles.dishName}>Leche Flan</Text>
          <Text style={styles.body}>Silky custard topped with golden caramel.</Text>
        </View>
      </View>
    </ScreenContainer>
  );
}

function FeaturedDish({ dish, label, onPress }) {
  const glass = useMenuGlass();
  return (
    <View style={[styles.card, glass.surface]}>
      {dish.image && <Image source={dish.image} style={styles.photo} resizeMode="cover" />}
      <View style={styles.cardCopy}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.dishName}>{dish.name}</Text>
        <Text style={styles.body}>{dish.description}</Text>
        <View style={styles.cardFooter}>
          <Text style={styles.price}>{dish.available === false ? "Sold out" : "PHP " + dish.price.toFixed(2)}</Text>
          <Pressable accessibilityRole="button" accessibilityLabel={"View " + dish.name} onPress={onPress} style={styles.viewDish}>
            <Text style={styles.price}>View dish</Text>
            <Feather name="chevron-right" size={17} color="#6D0808" />
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { maxWidth: 430 },
  header: { flexDirection: "row", alignItems: "center", gap: 12, paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: "#EADCCD" },
  back: { width: 44, height: 44, borderRadius: 22, backgroundColor: "#FFFDF9", alignItems: "center", justifyContent: "center" },
  title: { flex: 1, color: "#6D0808", fontSize: 25, fontWeight: "700" },
  section: { color: "#352925", fontSize: 21, fontWeight: "700", marginTop: 18, marginBottom: 10 },
  card: { borderRadius: 16, overflow: "hidden", marginBottom: 10 },
  photo: { width: "100%", height: 128 },
  cardCopy: { padding: 14, gap: 6 },
  label: { color: "#6D0808", fontSize: 11, letterSpacing: 0.7, textTransform: "uppercase" },
  dishName: { color: "#352925", fontSize: 19, fontWeight: "700" },
  body: { color: "#76665F", fontSize: 13, lineHeight: 19 },
  cardFooter: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 8 },
  price: { color: "#6D0808", fontWeight: "600" },
  viewDish: { minHeight: 44, flexDirection: "row", alignItems: "center", gap: 4 },
  upcoming: { flexDirection: "row", gap: 12, alignItems: "center", padding: 14, borderRadius: 16, borderStyle: "dashed" },
  badge: { width: 44, height: 44, borderRadius: 22, backgroundColor: "#FFFDF9", alignItems: "center", justifyContent: "center" },
  upcomingCopy: { flex: 1, gap: 4 },
});
