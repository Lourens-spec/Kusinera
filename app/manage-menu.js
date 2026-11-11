import { Feather, Image, Pressable, Switch, Text, TextInput, View } from "../components/Themed";
import sharedStyles from "../styles/sharedStyles";
import React, { useState } from "react";
import { Redirect, useRouter } from "expo-router";
import { Platform, StyleSheet } from "react-native";
import ScreenContainer from "../components/ScreenContainer";
import MenuFilters from "../components/MenuFilters";
import { useAuth } from "../context/AuthContext";
import { useMenu } from "../context/MenuContext";

const stockFilters = ["All dishes", "Available", "Sold out"];

export default function ManageMenuRoute() {
  const router = useRouter();
  const { currentUser } = useAuth();
  const { menuItems, setDishAvailable } = useMenu();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All dishes");
  const availableCount = menuItems.filter(item => item.available !== false).length;
  const term = query.trim().toLowerCase();
  const visible = menuItems.filter(item => {
    const available = item.available !== false;
    const matchesStock = filter === "All dishes" || (filter === "Available" ? available : !available);
    const matchesSearch = [item.name, item.menuGroup, item.category].some(value => value?.toLowerCase().includes(term));
    return matchesStock && matchesSearch;
  });

  if (!currentUser) return <Redirect href="/login" />;
  if (currentUser.role !== "staff") return <Redirect href="/" />;

  return (
    <ScreenContainer backgroundColor="#FFF8ED" scrollStyle={styles.scroll} keyboardShouldPersistTaps="handled">
      <View style={styles.header}>
        <View>
          <Text style={styles.brand}>KUSINERA</Text>
          <Text style={styles.workspace}>Staff workspace</Text>
        </View>
        <Pressable accessibilityRole="button" onPress={() => router.dismissTo("/kitchen")} style={styles.back}>
          <Feather name="arrow-left" size={16} color="#FFF8ED" />
          <Text style={styles.backLabel}>Staff orders</Text>
        </Pressable>
      </View>

      <View style={styles.main}>
        <View style={styles.intro}>
          <View style={styles.heading}>
            <Text accessibilityRole="header" style={styles.title}>Manage menu</Text>
            <Text accessibilityLiveRegion="polite" style={styles.summary}>{menuItems.length} {menuItems.length === 1 ? "dish" : "dishes"} · {availableCount} available</Text>
          </View>
          <Pressable accessibilityRole="button" onPress={() => router.push("/edit-dish")} style={styles.add}>
            <Feather name="plus" size={18} color="#FFF8ED" />
            <Text style={styles.addLabel}>Add dish</Text>
          </Pressable>
        </View>

        <View style={styles.search}>
          <Feather name="search" size={18} color="#6D0808" />
          <TextInput accessibilityLabel="Search dishes or categories" placeholder="Search dishes or categories" placeholderTextColor="#76665F" value={query} onChangeText={setQuery} autoCorrect={false} style={styles.input} />
          {!!query && (
            <Pressable accessibilityRole="button" accessibilityLabel="Clear search" onPress={() => setQuery("")} style={sharedStyles.closeButton}>
              <Feather name="x" size={17} color="#6D0808" />
            </Pressable>
          )}
        </View>
        <MenuFilters options={stockFilters} selectedFilter={filter} onSelect={setFilter} />

        {visible.length === 0 ? (
          <Text accessibilityLiveRegion="polite" style={styles.empty}>{menuItems.length ? "No dishes match your search or filter." : "No dishes yet. Tap Add dish to get started."}</Text>
        ) : (
          <View style={styles.list}>
            {visible.map((item, index) => (
              <MenuDish
                key={item.id}
                item={item}
                divided={index > 0}
                onEdit={() => router.push({ pathname: "/edit-dish", params: { id: item.id } })}
                onAvailabilityChange={available => setDishAvailable(item.id, available)}
              />
            ))}
          </View>
        )}
      </View>
    </ScreenContainer>
  );
}

function MenuDish({ item, divided, onEdit, onAvailabilityChange }) {
  const available = item.available !== false;

  return (
    <View style={[styles.row, divided && styles.divider]}>
      <Pressable accessibilityRole="button" accessibilityLabel={`Edit ${item.name}`} onPress={onEdit} style={({ pressed }) => [styles.dish, pressed && styles.pressed]}>
        {item.image ? (
          <Image source={item.image} style={[styles.image, !available && styles.soldImage]} resizeMode="cover" />
        ) : (
          <View style={[styles.image, sharedStyles.imagePlaceholder]}>
            <Feather name="image" size={20} color="#6D0808" />
          </View>
        )}
        <View style={styles.copy}>
          <Text style={styles.group}>{item.menuGroup}</Text>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.price}>₱{item.price.toFixed(2)}</Text>
        </View>
        <View style={styles.editIcon}><Feather name="edit-2" size={16} color="#6D0808" /></View>
      </Pressable>
      <View style={styles.stock}>
        <Switch accessibilityLabel={`${item.name} availability`} value={available} onValueChange={onAvailabilityChange}
          trackColor={{ false: "#DDD5D5", true: "#A9C9B4" }} thumbColor={available ? "#23543A" : "#FFFFFF"} ios_backgroundColor="#DDD5D5" />
        <Text style={[styles.stockLabel, !available && styles.soldLabel]}>{available ? "Available" : "Sold out"}</Text>
      </View>
    </View>
  );
}

const serif = Platform.select({ android: "serif", ios: "Georgia", web: "Georgia, serif" });
const styles = StyleSheet.create({
  scroll: { padding: 0 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 10, padding: 16, backgroundColor: "#6D0808" },
  brand: { color: "#FFF8ED", fontFamily: serif, fontSize: 20, fontWeight: "700", letterSpacing: 1.4 },
  workspace: { color: "#EED9CE", fontSize: 12, marginTop: 4 },
  back: { flexDirection: "row", alignItems: "center", gap: 7, minHeight: 44, paddingHorizontal: 10, borderRadius: 11, borderWidth: 1, borderColor: "#FFF1DA33" },
  backLabel: { color: "#FFF8ED", fontSize: 12, fontWeight: "600" },
  main: { padding: 16 },
  intro: { flexDirection: "row", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 8, marginBottom: 14 },
  heading: { flexShrink: 1, gap: 4 },
  title: { color: "#6D0808", fontFamily: serif, fontSize: 25, fontWeight: "700" },
  summary: sharedStyles.mutedText,
  add: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 5, minHeight: 44, paddingHorizontal: 10, borderRadius: 10, backgroundColor: "#6D0808" },
  addLabel: { color: "#FFF8ED", fontSize: 13, fontWeight: "700" },
  search: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 11, borderWidth: 1, borderColor: "#D9C9B8", backgroundColor: "#FFFDF9", borderRadius: 12, marginBottom: 10 },
  input: { flex: 1, minWidth: 0, minHeight: 44, color: "#352925", fontSize: 16 },
  list: { backgroundColor: "#FFFDF9", borderWidth: 1, borderColor: "#EADCCD", borderRadius: 14, overflow: "hidden" },
  row: { flexDirection: "row", alignItems: "center", gap: 8, padding: 8 },
  divider: { borderTopWidth: 1, borderTopColor: "#EADCCD" },
  dish: { flex: 1, minWidth: 0, flexDirection: "row", alignItems: "center", gap: 8 },
  pressed: { opacity: 0.7 },
  copy: { flex: 1, minWidth: 0, gap: 3 },
  image: { width: 49, height: 53, borderRadius: 9, backgroundColor: "#F8ECE8" },
  soldImage: { opacity: 0.65 },
  group: sharedStyles.hint,
  name: { color: "#292323", fontSize: 14, fontWeight: "700" },
  price: sharedStyles.price,
  editIcon: { width: 38, height: 44, borderRadius: 10, backgroundColor: "#F8ECE8", alignItems: "center", justifyContent: "center" },
  stock: { alignItems: "center", minWidth: 48 },
  stockLabel: { color: "#23543A", fontSize: 10, textAlign: "center" },
  soldLabel: { color: "#76665F" },
  empty: { padding: 16, color: "#76665F", backgroundColor: "#FFFDF9", borderWidth: 1, borderStyle: "dashed", borderColor: "#D9C9B8", borderRadius: 12, textAlign: "center" },
});
