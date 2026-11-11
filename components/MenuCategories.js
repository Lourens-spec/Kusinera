import { MaterialCommunityIcons, Image, Pressable, Text, View } from "./Themed";
import React from "react";
import { StyleSheet } from "react-native";
import { useMenuGlass } from "../styles/menuGlass";

const categories = [
  ["All dishes", null],
  ["Mains", require("../assets/menu/centered/adobo.png")],
  ["Noodles", require("../assets/menu/centered/pancit_canton.png")],
  ["Dessert", require("../assets/menu/centered/halo_halo.png")],
];
export default function MenuCategories({ selected, onSelect }) {
  const glass = useMenuGlass();
  return <View style={styles.row}>{categories.map(([label, image]) => <Pressable key={label} accessibilityRole="button" accessibilityState={{ selected: selected === label }} onPress={() => onSelect(label)} style={styles.category}>
    <View style={[styles.circle, glass.surface, selected === label && glass.selectedCategory]}>{image ? <Image source={image} style={styles.photo} resizeMode="cover" /> : <MaterialCommunityIcons name="silverware-fork-knife" size={22} color="#6D0808" />}</View>
    <Text style={[styles.label, selected === label && styles.activeLabel]}>{label}</Text>
  </Pressable>)}</View>;
}
const styles = StyleSheet.create({
  row: { flexDirection: "row", justifyContent: "space-between", gap: 6, marginBottom: 14 },
  category: { flex: 1, alignItems: "center", gap: 6, paddingVertical: 2 },
  circle: { width: 54, height: 54, borderRadius: 27, padding: 5, alignItems: "center", justifyContent: "center" },
  photo: { width: 42, height: 42, borderRadius: 21 },
  label: { color: "#76665F", fontSize: 11, textAlign: "center" },
  activeLabel: { color: "#6D0808", fontWeight: "600" },
});

