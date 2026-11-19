import { Feather, Pressable, Text } from "./Themed";
import sharedStyles from "../styles/sharedStyles";
import React from "react";
import { Redirect, useRouter } from "expo-router";
import { StyleSheet } from "react-native";
import AuthButton from "./authButton";
import ProfileCard from "./ProfileCard";
import ScreenContainer from "./ScreenContainer";
import { useAuth } from "../context/AuthContext";

export default function ProfileScreen() {
  const router = useRouter();
  const { currentUser, logout } = useAuth();

  if (currentUser?.role === "admin") return <Redirect href="/admin" />;
  if (currentUser?.role === "rider") return <Redirect href="/rider" />;
  if (currentUser?.role === "staff" || currentUser?.role === "kitchen") {
    return <Redirect href="/kitchen" />;
  }

  function signIn() {
    router.push({ pathname: "/login", params: { fromProfile: "1" } });
  }

  return (
    <ScreenContainer tabScreen backgroundColor="#FFF8ED">
      <Text style={styles.brand}>KUSINERA</Text>
      <Text accessibilityRole="header" style={styles.title}>My profile</Text>
      {currentUser ? (
        <>
          <ProfileCard account={currentUser} />
          <Pressable accessibilityRole="button" onPress={() => router.push("/edit-profile")} style={styles.edit}>
            <Feather name="edit-2" size={16} color="#FFFFFF" />
            <Text style={styles.editLabel}>Edit profile</Text>
          </Pressable>
          {currentUser.role === "customer" ? <Pressable accessibilityRole="button" onPress={() => router.push("/change-password")} style={styles.password}><Feather name="lock" size={17} color="#6D0808" /><Text style={styles.passwordLabel}>Change password</Text><Feather name="chevron-right" size={17} color="#6D0808" /></Pressable> : null}
          <Pressable accessibilityRole="button" onPress={() => { logout(); router.dismissTo("/"); }} style={styles.password}><Feather name="log-out" size={17} color="#6D0808" /><Text style={styles.passwordLabel}>Log out</Text></Pressable>
        </>
      ) : (
        <>
          <Text style={styles.label}>Log in to view your account.</Text>
          <AuthButton title="Log in" onPress={signIn} />
        </>
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  brand: sharedStyles.smallBrand,
  title: sharedStyles.pageTitle,
  label: sharedStyles.mutedText,
  edit: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 7, minHeight: 46, padding: 12, marginTop: 12, borderRadius: 12, backgroundColor: "#6D0808" },
  editLabel: sharedStyles.primaryLabel,
  password: { flexDirection: "row", alignItems: "center", gap: 10, minHeight: 48, padding: 14, borderWidth: 1, borderColor: "#D9C9B8", borderRadius: 13, marginTop: 10 },
  passwordLabel: { flex: 1, color: "#6D0808", fontSize: 14, fontWeight: "600" },
});

