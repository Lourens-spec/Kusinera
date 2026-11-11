import { Feather, Text, View } from "./Themed";
import sharedStyles from "../styles/sharedStyles";
import React from "react";
import { StyleSheet } from "react-native";
import ProfileAvatar from "./ProfileAvatar";
import { useMenuGlass } from "../styles/menuGlass";

export default function ProfileCard({ account }) {
  const glass = useMenuGlass();
  const { username, email, displayName, photoUri } = account;
  const name = displayName || username;

  return (
    <View style={[styles.card, glass.surface]}>
      <View style={styles.banner}>
        <ProfileAvatar name={name} uri={photoUri} />
        <View style={styles.text}>
          <Text style={styles.name}>{name}</Text>
          <Text style={styles.label}>Customer account</Text>
        </View>
      </View>
      <View style={styles.details}>
        <Detail icon="user" label="Username" value={username} />
        <View style={styles.divider} />
        <Detail icon="mail" label="Email address" value={email} />
      </View>
    </View>
  );
}

function Detail({ icon, label, value }) {
  return (
    <View style={styles.row}>
      <Feather name={icon} size={18} color="#6D0808" />
      <View style={styles.text}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.value}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: sharedStyles.profileCard,
  banner: sharedStyles.photoBanner,
  details: { paddingHorizontal: 15 },
  row: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 10 },
  text: { flex: 1 },
  name: { color: "#292323", fontSize: 19, fontWeight: "800" },
  label: sharedStyles.mutedText,
  value: { color: "#292323", fontSize: 15, marginTop: 2 },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: "#EAE0E0" },
});
