import { Feather, ImageBackground, Pressable, ScrollView, Text, View, SafeAreaView } from "./Themed";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useFocusEffect, useRouter } from "expo-router";
import { Keyboard, Modal, Platform, StyleSheet } from "react-native";
import { useAuth } from "../context/AuthContext";
import ProfileAvatar from "./ProfileAvatar";
import { glossyMenuTab, useMenuGlass } from "../styles/menuGlass";

const shortcuts = [
  { label: "Favorites", icon: "heart", route: "/favorites" },
  { label: "Delivery coverage", icon: "map-pin", route: "/delivery-coverage" },
  { label: "What’s new", icon: "star", route: "/whats-new" },
  { label: "Promos & vouchers", icon: "tag", route: "/promos" },
  { label: "Settings", icon: "settings", route: "/settings" },
];

export default function HomeHeader({ children }) {
  const router = useRouter();
  const { currentUser, logout } = useAuth();
  const glass = useMenuGlass();
  const [open, setOpen] = useState(false);
  const pendingAction = useRef(null);
  useFocusEffect(useCallback(() => () => {
    pendingAction.current = null;
    setOpen(false);
  }, []));

  useEffect(() => {
    if (open || !pendingAction.current) return;

    // Give the native modal a frame to dismiss before starting the route transition.
    let actionFrame;
    const closeFrame = requestAnimationFrame(() => {
      actionFrame = requestAnimationFrame(() => {
        const action = pendingAction.current;
        pendingAction.current = null;
        action?.();
      });
    });
    return () => {
      cancelAnimationFrame(closeFrame);
      if (actionFrame !== undefined) cancelAnimationFrame(actionFrame);
    };
  }, [open]);

  function openMenu() {
    if (pendingAction.current) return;
    Keyboard.dismiss();
    setOpen(true);
  }

  function closeAndRun(action) {
    if (pendingAction.current) return;
    pendingAction.current = action;
    setOpen(false);
  }

  function navigate(route) {
    closeAndRun(() => router.push(route));
  }

  function account() {
    if (currentUser) closeAndRun(logout);
    else navigate("/login");
  }
  return (
    <>
      <ImageBackground source={require("../assets/menu/adobo-stone-hero.jpg")} resizeMode="cover" style={styles.hero} imageStyle={styles.heroImage}>
        <View style={styles.top}>
          <Pressable accessibilityRole="button" accessibilityLabel="Open navigation menu" accessibilityState={{ expanded: open }} onPress={openMenu} style={styles.icon}><Feather name="menu" size={20} color="#6D0808" /></Pressable>
          <View style={styles.location}><Text style={styles.locationLabel}>Delivery area</Text><Text style={styles.city}>Cagayan de Oro City</Text></View>
          <Pressable accessibilityRole="button" accessibilityLabel={currentUser ? "Open my profile" : "Log in to your profile"} onPress={() => router.push("/profile")} style={styles.profile}>
            {currentUser ? <ProfileAvatar name={currentUser.displayName || currentUser.username} uri={currentUser.photoUri} size={36} /> : <Feather name="user" size={22} color="#6D0808" />}
          </Pressable>
        </View>
        <View style={styles.copy}>
          <Text accessibilityRole="header" numberOfLines={2} adjustsFontSizeToFit minimumFontScale={0.75} style={styles.title}>Comfort food.{"\n"}Made for you.</Text>
        </View>
        {children}
      </ImageBackground>
      <Modal visible={open} transparent animationType="none" onRequestClose={() => setOpen(false)}>
        <SafeAreaView style={styles.overlay}>
          <Pressable accessibilityRole="button" accessibilityLabel="Close navigation menu" onPress={() => setOpen(false)} style={StyleSheet.absoluteFill} />
          <View style={[styles.panel, glass.panel]}>
            <ScrollView style={styles.panelScroll} contentContainerStyle={styles.panelContent}>
              <Text accessibilityRole="header" style={styles.menuTitle}>Menu</Text>
              <View style={styles.group}>
                {shortcuts.map(link => (
                  <Pressable key={link.label} accessibilityRole="button" onPress={() => navigate(link.route)} style={({ pressed }) => [styles.link, pressed && styles.pressed]}>
                    <Feather name={link.icon} size={18} color="#6D0808" />
                    <Text style={styles.label}>{link.label}</Text>
                  </Pressable>
                ))}
              </View>
              <Pressable accessibilityRole="button" onPress={account} style={({ pressed }) => [styles.link, styles.account, glossyMenuTab, pressed && styles.pressed]}>
                <Feather name={currentUser ? "log-out" : "log-in"} size={18} color="#FFF8ED" />
                <Text style={[styles.label, styles.accountLabel]}>{currentUser ? "Log out" : "Log in"}</Text>
              </Pressable>
            </ScrollView>
          </View>
        </SafeAreaView>
      </Modal>
    </>
  );
}

const serif = Platform.select({ android: "serif", ios: "Georgia", web: "Georgia, serif" });
const styles = StyleSheet.create({
  hero: { backgroundColor: "#6D0808", padding: 18, borderTopLeftRadius: 0, borderTopRightRadius: 0, borderBottomLeftRadius: 26, borderBottomRightRadius: 26, overflow: "hidden" },
  heroImage: { borderTopLeftRadius: 0, borderTopRightRadius: 0, borderBottomLeftRadius: 26, borderBottomRightRadius: 26 },
  top: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 6, marginBottom: 0 },
  icon: { width: 44, height: 44, borderRadius: 22, backgroundColor: "#FFF1DA", alignItems: "center", justifyContent: "center" },
  profile: { width: 44, height: 44, flexShrink: 0, borderRadius: 22, borderWidth: 2, borderColor: "#FFF8ED", backgroundColor: "#FFF1DA", alignItems: "center", justifyContent: "center", overflow: "hidden" },
  location: { flex: 1, alignItems: "center", gap: 4 },
  locationLabel: { color: "#EED9CE", fontSize: 10 },
  city: { color: "#FFF8ED", fontSize: 12, fontWeight: "600", textAlign: "center" },
  copy: { width: "62%", marginTop: 38, marginBottom: 31 },
  title: { color: "#FFF8ED", fontFamily: serif, fontSize: 29, lineHeight: 33, fontWeight: "700", letterSpacing: -0.6, textShadowColor: "#37020266", textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 6 },
  overlay: { flex: 1, backgroundColor: "#23050555", paddingHorizontal: 16, paddingTop: 68, paddingBottom: 16 },
  panel: { flexShrink: 1, alignSelf: "flex-start", width: 248, maxWidth: "100%", borderRadius: 20 },
  panelScroll: { flexGrow: 0, borderRadius: 20 },
  panelContent: { padding: 14 },
  menuTitle: { color: "#6D0808", fontFamily: serif, fontSize: 21, fontWeight: "700", paddingHorizontal: 8, paddingBottom: 12 },
  group: { borderTopWidth: 1, borderTopColor: "#EADCCC", paddingTop: 9, paddingBottom: 5 },
  account: { justifyContent: "center", borderRadius: 10, marginTop: 6 },
  accountLabel: { color: "#FFF8ED", flexShrink: 0 },
  link: { flexDirection: "row", alignItems: "center", gap: 10, minHeight: 44, paddingHorizontal: 10 },
  pressed: { opacity: 0.72 },
  label: { color: "#6D0808", fontSize: 14, fontWeight: "600", flexShrink: 1 },
});
