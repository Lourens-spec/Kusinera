import sharedStyles from "../../styles/sharedStyles";
import { StyleSheet } from "react-native";

export default StyleSheet.create({
  brand: sharedStyles.smallBrand,
  title: { color: "#292323", fontSize: 28, fontWeight: "800", marginBottom: 12 },
  card: { backgroundColor: "#FFFFFF", borderRadius: 14, padding: 12, marginBottom: 10, gap: 6 },
  name: sharedStyles.itemName,
  description: sharedStyles.mutedText,
  deliveryField: { gap: 5 },
  voucherRemove: { minHeight: 44, justifyContent: "center" },
  row: sharedStyles.wrappingRow,
  iconLabel: { flexDirection: "row", alignItems: "center", gap: 7 },
  item: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: "#EEE8E8", paddingTop: 7, gap: 2 },
  itemCopy: { flex: 1 },
  input: { borderWidth: 1, borderColor: "#A39898", borderRadius: 9, paddingHorizontal: 12, minHeight: 44, color: "#292323", fontSize: 15 },
  missing: { color: "#6D0808", backgroundColor: "#F8ECE8", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  saved: { color: "#23543A", backgroundColor: "#E4F4E8", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  order: { borderTopWidth: 1, borderTopColor: "#EEE8E8", paddingTop: 12, gap: 6 },
  controls: sharedStyles.controls,
  control: { backgroundColor: "#F8ECE8", borderRadius: 8, width: 44, height: 44, alignItems: "center", justifyContent: "center" },
  accent: { color: "#6D0808", fontSize: 16, fontWeight: "700" },
  total: { color: "#6D0808", fontSize: 20, fontWeight: "800" },
  place: { backgroundColor: "#6D0808", borderRadius: 9, minHeight: 44, alignItems: "center", justifyContent: "center" },
  placeLabel: sharedStyles.primaryLabel,
  disabledPlace: { backgroundColor: "#F8ECE8" },
  disabledLabel: { color: "#6D0808" },
});
