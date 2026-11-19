import sharedStyles from "../styles/sharedStyles";
import React, { useState } from "react";
import { useRouter } from "expo-router";
import { StyleSheet } from "react-native";
import { Feather, Pressable, Text, TextInput, View } from "../components/Themed";
import ScreenContainer from "../components/ScreenContainer";
import { useMenuGlass } from "../styles/menuGlass";
import { CDO_BARANGAYS, DELIVERY_CITY } from "../utils/delivery";

const suggestions = ["Carmen", "Gusa", "Lapasan", "Nazareth", "Barangay 12"];
const maxResults = 8;

function normalize(value) {
  return value.toLowerCase().replace(/[.\s-]+/g, "");
}

export default function DeliveryCoverageRoute() {
  const glass = useMenuGlass();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(null);
  const term = normalize(query);
  const matches = term
    ? CDO_BARANGAYS.filter(name => normalize(name).includes(term))
    : suggestions.filter(name => CDO_BARANGAYS.includes(name));
  const count = matches.length;

  function updateQuery(value) {
    setQuery(value);
    setSelected(null);
  }

  return (
    <ScreenContainer glassBackground contentStyle={styles.page} keyboardShouldPersistTaps="handled">
      <View style={styles.header}>
        <Pressable accessibilityRole="button" accessibilityLabel="Back to menu" onPress={() => router.dismissTo("/")} style={styles.back}>
          <Feather name="arrow-left" size={21} color="#6D0808" />
        </Pressable>
        <Text accessibilityRole="header" style={styles.title}>Delivery coverage</Text>
      </View>

      <View style={[styles.city, glass.surface]}>
        <Feather name="map-pin" size={21} color="#6D0808" />
        <View style={styles.copy}>
          <Text style={styles.cityName}>{DELIVERY_CITY}</Text>
          <Text style={styles.body}>Delivery is available within CDO only.</Text>
        </View>
      </View>

      <Text style={styles.label}>Find your barangay</Text>
      <View style={[styles.field, glass.surface]}>
        <Feather name="search" size={18} color="#6D0808" />
        <TextInput accessibilityLabel="Find your barangay" placeholder="Try Carmen or Barangay 12" placeholderTextColor="#76665F" value={query} onChangeText={updateQuery} autoCorrect={false} style={styles.input} />
      </View>

      <Text accessibilityLiveRegion="polite" style={styles.status}>
        {!term ? "Try one of these barangays" : count === 0 ? "No matching barangay in the CDO delivery list." : count + (count === 1 ? " matching barangay" : " matching barangays")}
        {term && count > maxResults ? " · refine your search to see more" : ""}
      </Text>
      {selected && (
        <Text accessibilityLiveRegion="polite" style={styles.result}>Delivery available in {selected}.</Text>
      )}
      {count > 0 && (
        <View style={[styles.list, glass.surface]}>
          {matches.slice(0, maxResults).map((name, index) => (
            <Pressable key={name} accessibilityRole="button" accessibilityState={{ selected: selected === name }} onPress={() => setSelected(name)} style={[styles.row, index > 0 && styles.divider, selected === name && styles.selected]}>
              <Text style={styles.rowLabel}>{name}</Text>
              <Feather name={selected === name ? "check" : "chevron-right"} size={18} color="#6D0808" />
            </Pressable>
          ))}
        </View>
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  page: { maxWidth: 430 },
  header: sharedStyles.supportHeader,
  back: sharedStyles.supportBack,
  title: sharedStyles.supportTitle,
  city: { flexDirection: "row", alignItems: "center", gap: 12, padding: 15, borderRadius: 14, marginVertical: 16 },
  copy: { flex: 1, gap: 4 },
  cityName: { fontWeight: "700", color: "#6D0808", fontSize: 16 },
  body: { color: "#76665F", fontSize: 13 },
  label: { color: "#352925", fontWeight: "600", marginBottom: 7 },
  field: { flexDirection: "row", alignItems: "center", gap: 8, borderRadius: 14, paddingHorizontal: 12 },
  input: { flex: 1, minHeight: 46, minWidth: 0, color: "#352925", fontSize: 16 },
  status: { color: "#76665F", marginTop: 12, marginBottom: 7 },
  result: { color: "#23543A", backgroundColor: "#E4F4E8", padding: 12, borderRadius: 10, marginBottom: 8 },
  list: { borderRadius: 12, overflow: "hidden" },
  row: { flexDirection: "row", alignItems: "center", gap: 10, minHeight: 46, padding: 12 },
  divider: { borderTopWidth: 1, borderTopColor: "#EADCCD" },
  selected: { backgroundColor: "#F8ECE8" },
  rowLabel: { flex: 1, color: "#352925" },
});
