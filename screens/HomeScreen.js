import { Feather, Pressable, Text, TextInput, View } from "../components/Themed";
import sharedStyles from "../styles/sharedStyles";
import React, { useState } from "react";
import { Platform, StyleSheet } from "react-native";
import ScreenContainer from "../components/ScreenContainer";
import HomeHeader from "../components/HomeHeader";

import MenuCategories from "../components/MenuCategories";
import MenuCard from "../components/MenuCard";
import { useMenu } from "../context/MenuContext";
import { matchesDish } from "../utils/mealOptions";
import { useMenuGlass } from "../styles/menuGlass";

export default function HomeScreen({ onSelectItem }) {
  const { menuItems } = useMenu();
  const glass = useMenuGlass();
  const [selectedFilter, setSelectedFilter] = useState("All dishes");
  const [query, setQuery] = useState("");
  const visibleItems = menuItems.filter((item) =>
    (selectedFilter === "All dishes" || item.menuGroup === selectedFilter) && matchesDish(item, query)
  );

  const header = (
    <View style={styles.content}>
      <HomeHeader>
        <View style={styles.search}>
          <Feather name="search" size={18} color="#6D0808" />
          <TextInput accessibilityLabel="Search dishes or ingredients" placeholder="What are you craving?" placeholderTextColor="#625B5B" value={query} onChangeText={setQuery} style={styles.searchInput} autoCorrect={false} />
          {query.length > 0 && (
            <Pressable accessibilityRole="button" accessibilityLabel="Clear search" onPress={() => setQuery("")} style={styles.clear}>
              <Feather name="x" size={18} color="#6D0808" />
            </Pressable>
          )}
        </View>
      </HomeHeader>
    </View>
  );

  return (
    <ScreenContainer tabScreen keyboardShouldPersistTaps="handled" backgroundColor="#FFF8ED" header={header} scrollStyle={styles.scroll} viewportStyle={[styles.content, styles.menuViewport, glass.backdrop]} contentStyle={styles.content}>
      <View style={styles.menu}>
        <MenuCategories selected={selectedFilter} onSelect={setSelectedFilter} />
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Our menu</Text>
          <Text accessibilityLiveRegion="polite" style={styles.count}>{visibleItems.length} {visibleItems.length === 1 ? "dish" : "dishes"}</Text>
        </View>
        {visibleItems.length === 0 && <Text style={styles.count}>No matching dishes. Try another search or category.</Text>}
        {visibleItems.map((item) => (
          <MenuCard key={item.id} item={item} onPress={onSelectItem} surfaceStyle={glass.surface} />
        ))}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { width: "100%", maxWidth: 480, alignSelf: "center" },
  scroll: { padding: 0 },
  menuViewport: { flex: 1 },
  menu: { paddingHorizontal: 18, paddingTop: 12, paddingBottom: 18 },
  search: { borderWidth: 1, borderColor: "#EADCCD", flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: "#FFFDF9", borderRadius: 25, paddingLeft: 14 },
  searchInput: { flex: 1, minWidth: 0, minHeight: 46, color: "#292323", fontSize: 16, ...Platform.select({ web: { outlineStyle: "none" } }) },
  clear: sharedStyles.closeButton,
  section: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 10 },
  sectionTitle: { color: "#292323", fontSize: 21, fontWeight: "700" },
  count: { color: "#716767", fontSize: 13 },
});



