import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import ScreenContainer from "../components/ScreenContainer";
import MenuCard from "../components/MenuCard";
import menuItems from "../data/menuItems";

export default function HomeScreen({ username, onSelectItem, onLogin, onLogout, cartCount, onOpenCart, onOpenKitchen }) {
  return (
    <ScreenContainer>
      <View style={styles.header}>
        <View>
          <Text style={styles.brand}>KUSINERA</Text>
          <Text style={styles.tagline}>Filipino comfort food</Text>
        </View>
        <View style={styles.headerActions}>
          <Pressable accessibilityRole="button" onPress={username ? onLogout : onLogin} style={styles.account}>
            <Text style={styles.accountText}>{username ? "Log out" : "Log in"}</Text>
          </Pressable>
          <Pressable accessibilityRole="button" onPress={onOpenCart} style={styles.account}>
            <Text style={styles.accountText}>Cart ({cartCount})</Text>
          </Pressable>
        </View>
      </View>
      <Text style={styles.greeting}>{username ? `Welcome, ${username}!` : "Welcome to our table"}</Text>
      <Text style={styles.title}>Something delicious{"\n"}is waiting.</Text>
      <Text style={styles.subtitle}>Favorites from our kitchen. See what makes it special.</Text>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Our menu</Text>
        <Text style={styles.count}>{menuItems.length} dishes</Text>
      </View>
      {menuItems.map((item) => (
        <MenuCard key={item.id} item={item} onPress={onSelectItem} />
      ))}
      <Pressable accessibilityRole="button" onPress={onOpenKitchen} style={[styles.account, styles.kitchen]}>
        <Text style={styles.accountText}>Staff &amp; kitchen</Text>
      </Pressable>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    flexWrap: "wrap",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    marginVertical: 12,
  },
  brand: {
    color: "#6D0808",
    fontSize: 27,
    fontWeight: "800",
    letterSpacing: 1,
  },
  tagline: {
    color: "#716767",
    fontSize: 13,
    marginTop: 4,
  },
  headerActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-end",
    marginLeft: "auto",
    gap: 8,
  },
  account: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#6D0808",
    borderRadius: 20,
  },
  kitchen: { alignSelf: "flex-start", marginTop: 12 },
  accountText: {
    color: "#6D0808",
    fontWeight: "600",
    fontSize: 13,
  },
  greeting: {
    color: "#6D0808",
    fontSize: 14,
    fontWeight: "600",
    marginTop: 28,
    marginBottom: 10,
  },
  title: {
    color: "#292323",
    fontSize: 34,
    lineHeight: 40,
    fontWeight: "800",
  },
  subtitle: {
    color: "#625B5B",
    fontSize: 15,
    lineHeight: 23,
    marginTop: 14,
    marginBottom: 28,
  },
  section: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  sectionTitle: {
    color: "#292323",
    fontSize: 21,
    fontWeight: "700",
  },
  count: {
    color: "#716767",
    fontSize: 13,
  },
  note: {
    color: "#716767",
    textAlign: "center",
    fontSize: 12,
    marginTop: 18,
    marginBottom: 8,
  },
});
