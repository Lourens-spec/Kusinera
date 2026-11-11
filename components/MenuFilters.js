import { Pressable, Text, View } from "./Themed";
import sharedStyles from "../styles/sharedStyles";
import React from "react";
import { StyleSheet } from "react-native";

const menuFilters = ["All dishes", "Mains", "Noodles", "Dessert"];

export default function MenuFilters({ selectedFilter, onSelect, options = menuFilters }) {
  return (
    <View style={styles.filters}>
      {options.map((label) => {
        const isSelected = label === selectedFilter;

        return (
          <Pressable
            key={label}
            accessibilityRole="button"
            accessibilityState={{ selected: isSelected }}
            onPress={() => onSelect(label)}
            style={[styles.filter, isSelected && styles.activeFilter]}
          >
            <Text style={[styles.label, isSelected && styles.activeFilterText]}>{label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  filters: { flexDirection: "row", flexWrap: "wrap", gap: 7, marginBottom: 18 },
  filter: { borderWidth: 1, borderRadius: 20, borderColor: "#AEA8BE", paddingHorizontal: 12, paddingVertical: 9 },
  activeFilter: { backgroundColor: "#6D0808", borderColor: "#6D0808" },
  activeFilterText: { color: "#FFFFFF" },
  label: sharedStyles.logoutLabel,
});
