import { Feather, Pressable, Text, TextInput, View } from "./Themed";
import sharedStyles from "../styles/sharedStyles";
import React from "react";
import { StyleSheet } from "react-native";
import ProfileAvatar from "./ProfileAvatar";
import ScreenContainer from "./ScreenContainer";
import { useMenuGlass } from "../styles/menuGlass";

export default function EditProfileForm({
  username, displayName, photoUri, error, onNameChange, onChangePhoto, onRemovePhoto, onSave, onCancel,
}) {
  const glass = useMenuGlass();
  return (
    <ScreenContainer glassBackground>
      <Text style={styles.brand}>KUSINERA</Text>
      <Text accessibilityRole="header" style={styles.title}>Edit profile</Text>
      <View style={[styles.card, glass.surface]}>
        <View style={styles.banner}>
          <ProfileAvatar name={displayName.trim() || username} uri={photoUri} />
          <View style={styles.photoDetails}>
            <Text style={styles.label}>Profile photo</Text>
            <View style={styles.photoActions}>
              <FormButton label="Change photo" icon="camera" onPress={onChangePhoto} style={styles.change} />
              {photoUri && (
                <FormButton label="Remove" accessibilityLabel="Remove photo" onPress={onRemovePhoto} />
              )}
            </View>
          </View>
        </View>
        <View style={styles.field}>
          {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
          <Text style={styles.label}>Display name</Text>
          <TextInput
            accessibilityLabel="Display name"
            maxLength={40}
            placeholder={username}
            placeholderTextColor="#625B5B"
            value={displayName}
            onChangeText={onNameChange}
            style={styles.input}
          />
          <Text style={styles.hint}>This name appears in your welcome greeting.</Text>
        </View>
      </View>
      <View style={styles.actions}>
        <FormButton label="Save changes" onPress={onSave} style={styles.save} primary />
        <FormButton label="Cancel" onPress={onCancel} style={styles.cancel} />
      </View>
    </ScreenContainer>
  );
}

function FormButton({ label, accessibilityLabel, icon, onPress, style, primary }) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={accessibilityLabel} onPress={onPress} style={[styles.button, style]}>
      {icon && <Feather name={icon} size={16} color="#6D0808" />}
      <Text style={[styles.buttonLabel, primary && styles.primaryLabel]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  brand: sharedStyles.smallBrand,
  title: sharedStyles.pageTitle,
  card: sharedStyles.profileCard,
  banner: sharedStyles.photoBanner,
  photoDetails: { flex: 1, gap: 5 },
  photoActions: { flexDirection: "row", flexWrap: "wrap", gap: 4 },
  field: { padding: 16, gap: 6 },
  label: sharedStyles.fieldLabel,
  input: { minHeight: 44, borderWidth: 1, borderColor: "#A39898", borderRadius: 10, paddingHorizontal: 11, paddingVertical: 8, color: "#292323", fontSize: 16 },
  hint: sharedStyles.hint,
  actions: { flexDirection: "row", gap: 8, marginTop: 12 },
  button: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, minHeight: 44, paddingHorizontal: 10, paddingVertical: 8, borderRadius: 11 },
  change: { backgroundColor: "#FFFFFF" },
  save: { flex: 2, backgroundColor: "#6D0808" },
  cancel: { flex: 1, borderWidth: 1, borderColor: "#6D0808" },
  primaryLabel: { color: "#FFFFFF" },
  buttonLabel: sharedStyles.buttonLabel,
  error: { color: "#B42318" },
});
