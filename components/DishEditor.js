import { Feather, Image, Pressable, Switch, Text, TextInput, View } from "./Themed";
import sharedStyles from "../styles/sharedStyles";
import React, { useRef, useState } from "react";
import { launchImageLibraryAsync } from "expo-image-picker";
import { Keyboard, StyleSheet } from "react-native";
import { menuGroups, validateDishBasics } from "../context/MenuContext";
import ChoiceField from "./ChoiceField";
import ScreenContainer from "./ScreenContainer";

const groupOptions = menuGroups.map(label => ({ label, value: label }));
const steps = ["Basics", "Dish details"];

export default function DishEditor({ item, onSave, onCancel }) {
  const [draft, setDraft] = useState({
    name: item?.name ?? "",
    price: item ? String(item.price) : "",
    category: item?.category ?? "",
    menuGroup: item?.menuGroup ?? "Mains",
    description: item?.description ?? "",
    ingredients: item?.ingredients.join("\n") ?? "",
    serving: item?.serving ?? "",
    preparationTime: item?.preparationTime ?? "",
    image: item?.image ?? null,
    available: item?.available !== false,
  });
  const savingRef = useRef(false);
  const [saving, setSaving] = useState(false);
  const [step, setStep] = useState(0);
  const [error, setError] = useState("");

  function change(key, value) {
    setDraft(current => ({ ...current, [key]: value }));
    setError("");
  }

  function goToStep(next) {
    if (next === step) return;
    if (next === 1) {
      const message = validateDishBasics(draft);
      if (message) {
        setError(message);
        return;
      }
    }
    Keyboard.dismiss();
    setError("");
    setStep(next);
  }

  async function choosePhoto() {
    setError("");
    try {
      const result = await launchImageLibraryAsync({
        mediaTypes: ["images"], allowsEditing: true, aspect: [1, 1], quality: 0.7, base64: true,
      });
      if (!result.canceled && result.assets[0]) change("image", { uri: result.assets[0].uri, base64: result.assets[0].base64 });
    } catch {
      setError("Couldn’t open that photo. Please try another image.");
    }
  }

  async function save() {
    if (savingRef.current) return;
    savingRef.current = true;
    setSaving(true);
    setError("");
    try {
      const message = await onSave({ ...draft, ingredients: draft.ingredients.split("\n") });
      if (message) setError(message);
    } catch (failure) { setError(failure.message || "Couldn’t save this dish."); }
    finally { savingRef.current = false; setSaving(false); }
  }

  function field(key, label, inputProps = {}) {
    return (
      <View style={styles.field}>
        <Text style={styles.label}>{label}</Text>
        <TextInput
          {...inputProps}
          accessibilityLabel={label}
          value={draft[key]}
          onChangeText={value => change(key, value)}
          style={[styles.input, inputProps.multiline && styles.multiline]}
          placeholderTextColor="#76665F"
        />
      </View>
    );
  }

  return (
    <ScreenContainer backgroundColor="#FFF8ED" scrollStyle={styles.scroll} keyboardShouldPersistTaps="handled">
      <View style={styles.header}>
        <Pressable accessibilityRole="button" accessibilityLabel="Back to Manage menu" onPress={onCancel} style={styles.back}>
          <Feather name="arrow-left" size={21} color="#6D0808" />
        </Pressable>
        <View style={styles.summaryCopy}>
          <Text style={styles.workspace}>Staff workspace</Text>
          <Text accessibilityRole="header" style={styles.title}>{item ? "Edit dish" : "Add dish"}</Text>
        </View>
      </View>

      <View style={styles.main}>
        <View style={styles.steps}>
          {steps.map((label, index) => (
            <Pressable key={label} accessibilityRole="tab" accessibilityState={{ selected: index === step }} onPress={() => goToStep(index)} style={[styles.step, index === step && styles.primary]}>
              <Text style={[styles.buttonLabel, index === step && styles.primaryLabel]}>{index + 1} · {label}</Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.card}>
          {step === 0 ? (
            <>
              <Pressable accessibilityRole="button" onPress={choosePhoto} style={styles.photo}>
                {draft.image ? (
                  <Image accessibilityLabel="Dish photo" source={draft.image} style={styles.thumbnail} resizeMode="cover" />
                ) : (
                  <View style={styles.back}><Feather name="image" size={22} color="#6D0808" /></View>
                )}
                <View style={styles.summaryCopy}>
                  <Text style={styles.buttonLabel}>{draft.image ? "Change photo" : "Choose photo"}</Text>
                  <Text style={styles.hint}>{draft.image ? "Photo selected" : "Optional"}</Text>
                </View>
              </Pressable>
              {draft.image && (
                <Pressable accessibilityRole="button" onPress={() => change("image", null)} style={styles.remove}>
                  <Text style={styles.buttonLabel}>Remove photo</Text>
                </Pressable>
              )}
              {field("name", "Dish name", { placeholder: "e.g. Chicken Adobo", maxLength: 80 })}
              <View style={styles.pair}>
                <View style={styles.column}>
                  <ChoiceField label="Menu group" options={groupOptions} value={draft.menuGroup} onChange={value => change("menuGroup", value)} triggerStyle={styles.choice} />
                </View>
                <View style={styles.column}>
                  {field("price", "Price in pesos", { placeholder: "₱ 0.00", keyboardType: "decimal-pad", maxLength: 10 })}
                </View>
              </View>
              {field("category", "Menu caption (optional)", { placeholder: "e.g. House favorite", maxLength: 80 })}
            </>
          ) : (
            <>
              <View style={styles.summary}>
                <Feather name="clipboard" size={20} color="#6D0808" />
                <View style={styles.summaryCopy}>
                  <Text style={styles.label}>{draft.name.trim()}</Text>
                  <Text style={styles.hint}>{draft.menuGroup} · ₱{Number(draft.price).toFixed(2)}</Text>
                </View>
              </View>
              {field("description", "Description", { placeholder: "Describe the dish", multiline: true, maxLength: 2000 })}
              {field("ingredients", "Ingredients", { placeholder: "Enter one ingredient per line", multiline: true, maxLength: 2000 })}
              <View style={styles.pair}>
                <View style={styles.column}>{field("serving", "Serving size", { placeholder: "e.g. 1–2 people", maxLength: 80 })}</View>
                <View style={styles.column}>{field("preparationTime", "Preparation time", { placeholder: "e.g. 20 minutes", maxLength: 80 })}</View>
              </View>
              <View style={styles.stock}>
                <View style={styles.summaryCopy}>
                  <Text style={styles.label}>Available to order</Text>
                  <Text style={styles.hint}>{draft.available ? "Customers can add this dish to Tray." : "This dish will be marked sold out."}</Text>
                </View>
                <Switch accessibilityLabel="Available to order" value={draft.available} onValueChange={value => change("available", value)} />
              </View>
            </>
          )}
          {!!error && <Text accessibilityRole="alert" style={styles.error}>{error}</Text>}
        </View>

        <View style={styles.actions}>
          <Pressable accessibilityRole="button" onPress={step === 0 ? onCancel : () => goToStep(0)} style={[styles.action, styles.secondary]}>
            <Text style={styles.buttonLabel}>{step === 0 ? "Cancel" : "Back"}</Text>
          </Pressable>
          <Pressable accessibilityRole="button" disabled={saving} onPress={step === 0 ? () => goToStep(1) : save} style={[styles.action, styles.primary, styles.continue]}>
            <Text style={styles.primaryLabel}>{saving ? "Publishing…" : step === 0 ? "Continue" : "Save dish"}</Text>
            <Feather name={step === 0 ? "arrow-right" : "check"} size={17} color="#FFF8ED" />
          </Pressable>
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: 0 },
  header: { backgroundColor: "#6D0808", padding: 16, flexDirection: "row", alignItems: "center", gap: 12 },
  back: { width: 44, height: 44, borderRadius: 22, backgroundColor: "#FFF1DA", alignItems: "center", justifyContent: "center" },
  workspace: { color: "#EED9CE", fontSize: 12 },
  title: { color: "#FFF8ED", fontSize: 25, fontWeight: "700" },
  main: { padding: 16, gap: 14 },
  steps: { flexDirection: "row", gap: 4, padding: 4, backgroundColor: "#F8ECE8", borderRadius: 13 },
  step: { flex: 1, minHeight: 44, alignItems: "center", justifyContent: "center", borderRadius: 10, paddingHorizontal: 5 },
  card: { backgroundColor: "#FFFDF9", borderWidth: 1, borderColor: "#EADCCD", borderRadius: 15, padding: 14, gap: 12 },
  field: { gap: 5 },
  label: sharedStyles.fieldLabel,
  hint: sharedStyles.hint,
  input: { color: "#352925", borderWidth: 1, borderColor: "#D9C9B8", borderRadius: 9, padding: 9, minHeight: 44, fontSize: 16 },
  choice: { borderColor: "#D9C9B8" },
  multiline: { minHeight: 72, textAlignVertical: "top" },
  pair: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  column: { flexGrow: 1, flexBasis: 110, minWidth: 0 },
  photo: { flexDirection: "row", alignItems: "center", gap: 10, minHeight: 66, padding: 10, borderRadius: 12, backgroundColor: "#FFF1DA", borderWidth: 1, borderStyle: "dashed", borderColor: "#D9C9B8" },
  thumbnail: { width: 48, height: 48, borderRadius: 9 },
  remove: { minHeight: 44, alignSelf: "flex-start", justifyContent: "center" },
  summary: { flexDirection: "row", alignItems: "center", gap: 10, padding: 12, backgroundColor: "#FFF1DA", borderRadius: 12 },
  summaryCopy: { flex: 1, gap: 4 },
  stock: { flexDirection: "row", alignItems: "center", gap: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: "#EADCCD" },
  actions: { flexDirection: "row", gap: 10 },
  action: { minHeight: 44, paddingHorizontal: 14, borderRadius: 10, flexDirection: "row", gap: 8, alignItems: "center", justifyContent: "center" },
  secondary: { borderWidth: 1, borderColor: "#D9C9B8", backgroundColor: "#FFFDF9" },
  primary: { backgroundColor: "#6D0808" },
  continue: { flex: 1 },
  buttonLabel: sharedStyles.price,
  primaryLabel: sharedStyles.creamButtonLabel,
  error: { color: "#B42318", lineHeight: 21 },
});
