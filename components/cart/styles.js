import { StyleSheet } from "react-native";

export default StyleSheet.create({
  title: { color: "#292323", fontSize: 30, fontWeight: "800", marginBottom: 20 },
  card: { backgroundColor: "#FFFFFF", borderRadius: 20, padding: 16, marginBottom: 12, gap: 8 },
  name: { color: "#292323", fontSize: 18, fontWeight: "700" },
  description: { color: "#625B5B", fontSize: 15 },
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 },
  input: {
    borderWidth: 1,
    borderColor: "#A39898",
    borderRadius: 12,
    paddingHorizontal: 12,
    minHeight: 44,
    color: "#292323",
    fontSize: 15,
  },
  missing: {
    color: "#6D0808",
    backgroundColor: "#F8ECE8",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  saved: {
    color: "#23543A",
    backgroundColor: "#E4F4E8",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  order: { borderTopWidth: 1, borderTopColor: "#EEE8E8", paddingTop: 12, gap: 6 },
  controls: { flexDirection: "row", alignItems: "center", gap: 12 },
  control: { backgroundColor: "#F8ECE8", borderRadius: 12, width: 44, height: 44, alignItems: "center", justifyContent: "center" },
  accent: { color: "#6D0808", fontSize: 16, fontWeight: "700" },
});
