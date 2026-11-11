import { Text, TextInput, View } from "../Themed";
import React from "react";
import { CDO_BARANGAYS, DELIVERY_CITY } from "../../utils/delivery";
import ChoiceField from "../ChoiceField";
import styles from "./styles";
import { useMenuGlass } from "../../styles/menuGlass";

const barangays = CDO_BARANGAYS.map((name) => ({ label: name, value: name }));
const fields = [
  { key: "recipient", label: "Recipient name", maxLength: 60, autoComplete: "name" },
  { key: "phone", label: "Mobile number", keyboardType: "phone-pad", maxLength: 20, placeholder: "09XXXXXXXXX" },
  { key: "street", label: "House number and street", maxLength: 300, multiline: true, placeholder: "House, street, subdivision" },
];

export default function DeliveryDetails({ details, onChange }) {
  const glass = useMenuGlass();
  function change(key, value) {
    onChange({ ...details, [key]: value });
  }

  return (
    <View style={[styles.card, glass.surface]}>
      <Text accessibilityRole="header" style={styles.name}>Delivery details</Text>
      <Text style={styles.accent}>{DELIVERY_CITY} only</Text>
      {fields.map(({ key, label, ...props }) => (
        <View key={key} style={styles.deliveryField}>
          <Text style={styles.description}>{label}</Text>
          <TextInput {...props} accessibilityLabel={label} placeholderTextColor="#625B5B" value={details[key]} onChangeText={(value) => change(key, value)} style={styles.input} />
        </View>
      ))}
      <ChoiceField label="Barangay" options={barangays} value={details.barangay} onChange={(name) => change("barangay", name)} searchable />
      <Text style={styles.description}>Landmark / delivery instructions (optional)</Text>
      <TextInput accessibilityLabel="Delivery instructions" multiline maxLength={300} value={details.notes} onChangeText={(value) => change("notes", value)} style={styles.input} />
    </View>
  );
}
