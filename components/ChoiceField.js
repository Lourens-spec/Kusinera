import { Feather, FlatList, Pressable, Text, TextInput, View, SafeAreaView } from "./Themed";
import sharedStyles from "../styles/sharedStyles";
import React, { useState } from "react";
import { Modal, StyleSheet } from "react-native";

export default function ChoiceField({ label, value, options, onChange, searchable = false, hideLabel = false, triggerStyle }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const selected = options.find((option) => option.value === value);
  const matches = options.filter((option) => option.label.toLowerCase().includes(query.trim().toLowerCase()));

  function close() {
    setOpen(false);
    setQuery("");
  }

  return (
    <View style={styles.field}>
      {!hideLabel && <Text style={styles.label}>{label}</Text>}
      <Pressable accessibilityRole="button" accessibilityLabel={label} accessibilityState={{ expanded: open }} accessibilityValue={{ text: selected?.label }} onPress={() => setOpen(true)} style={[styles.trigger, triggerStyle]}>
        <Text style={styles.value}>{selected?.label ?? "Choose an option"}</Text>
        <Feather name="chevron-down" size={17} color="#6D0808" />
      </Pressable>
      <Modal visible={open} transparent animationType="fade" onRequestClose={close}>
        <SafeAreaView style={styles.overlay}>
          <Pressable accessibilityLabel="Close options" accessibilityRole="button" style={StyleSheet.absoluteFill} onPress={close} />
          <View style={styles.sheet} accessibilityViewIsModal>
            <View style={styles.heading}>
              <Text style={styles.label}>{label}</Text>
              <Pressable accessibilityRole="button" accessibilityLabel="Close options" onPress={close} style={styles.close}>
                <Feather name="x" size={20} color="#6D0808" />
              </Pressable>
            </View>
            {searchable && <TextInput accessibilityLabel="Search options" placeholder="Search barangay" value={query} onChangeText={setQuery} style={styles.input} autoCorrect={false} />}
            <FlatList
              data={matches}
              keyExtractor={(option) => option.value}
              keyboardShouldPersistTaps="handled"
              ListEmptyComponent={<Text style={styles.value}>No matching options.</Text>}
              renderItem={({ item }) => (
                <Pressable accessibilityRole="button" accessibilityState={{ selected: item.value === value }} style={styles.option} onPress={() => { onChange(item.value); close(); }}>
                  <Text style={styles.value}>{item.label}</Text>
                  {item.value === value && <Feather name="check" size={17} color="#6D0808" />}
                </Pressable>
              )}
            />
          </View>
        </SafeAreaView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  field: { gap: 5 },
  label: sharedStyles.fieldLabel,
  trigger: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8, minHeight: 44, padding: 10, borderWidth: 1, borderColor: "#A39898", borderRadius: 9 },
  value: { color: "#292323", fontSize: 15, flexShrink: 1 },
  overlay: { flex: 1, justifyContent: "center", alignItems: "center", padding: 24, backgroundColor: "rgba(30, 20, 30, 0.35)" },
  sheet: { width: "100%", maxWidth: 500, maxHeight: "80%", flexShrink: 1, backgroundColor: "#FFFFFF", borderRadius: 16, padding: 14, gap: 9 },
  heading: sharedStyles.sectionHeading,
  close: sharedStyles.closeButton,
  input: sharedStyles.fieldInput,
  option: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8, minHeight: 44, paddingVertical: 10 },
});
