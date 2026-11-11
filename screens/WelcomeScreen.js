import { Feather, MaterialCommunityIcons, Image, Pressable, Text, View, SafeAreaView } from "../components/Themed";
import { useTheme } from "../context/ThemeContext";
import sharedStyles from "../styles/sharedStyles";
import { authGlow, gradient as sheen } from "../styles/menuGlass";
import React, { useState } from "react";
import { useRouter } from "expo-router";
import { Platform, StyleSheet, useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function WelcomeScreen({ onExplore }) {
  const router = useRouter();
  const { darkMode } = useTheme();
  const { height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const availableHeight = height - insets.top - insets.bottom;
  const compact = availableHeight < 720;
  const veryShort = availableHeight < 500;
  const [foodSize, setFoodSize] = useState(0);
  const circle = (size) => ({ width: size, height: size, borderRadius: size / 2 });
  return (
    <SafeAreaView style={[sharedStyles.background, darkMode ? authGlow.dark : authGlow.light]}>
      <View style={[styles.frame, compact && styles.compactFrame]}>
        <View style={styles.content}>
          <View style={[styles.header, compact && styles.compactHeader]}>
            <View style={styles.wordmark}>
              <Text style={styles.brand}>KUSINERA</Text>
              <Text style={styles.tagline}>THE FILIPINO TABLE</Text>
            </View>
            <View style={styles.glassIcon} accessible={false} importantForAccessibility="no-hide-descendants">
              <MaterialCommunityIcons name="pot-steam-outline" size={22} color="#6D0808" />
            </View>
          </View>
          <View style={[styles.arch, compact && styles.compactArch]}>
            <View style={[styles.copy, compact && styles.compactCopy]}>
              {!veryShort && <Text style={styles.eyebrow}>THE COMFORT OF FILIPINO COOKING</Text>}
              <Text accessibilityRole="header" style={[styles.title, compact && styles.compactTitle]}>Made with love.{"\n"}<Text style={styles.italic}>Feels like home.</Text></Text>
              {!veryShort && <Text style={styles.subtitle}>Filipino favorites. A seat at our table.</Text>}
            </View>
            <View style={[styles.food, compact && styles.compactFood]} onLayout={({ nativeEvent: { layout } }) => setFoodSize(Math.min(layout.width, layout.height))}>
              <View style={[styles.ring, circle(foodSize * 0.97)]}><View style={[styles.innerRing, circle(Math.max(0, foodSize * 0.97 - 16))]} /></View>
              <Image accessibilityLabel="Chicken Adobo served with rice" source={require("../assets/menu/centered/adobo.png")} resizeMode="cover" style={[styles.photo, circle(foodSize * 0.86)]} />
              {foodSize >= 140 && <View style={styles.stamp}>
                <View style={styles.stampBorder}>
                  <Text style={styles.stampSmall}>LUTONG</Text>
                  <Text style={styles.stampTitle}>BAHAY</Text>
                  <Text style={styles.stampNote}>made with care</Text>
                </View>
              </View>}
            </View>
            {!veryShort && <View style={[styles.caption, compact && styles.compactCaption]}>
              <Text style={styles.captionLabel}>01 / OUR HOUSE FAVORITE</Text>
              <Text style={styles.dish}>Chicken Adobo</Text>
              <Text style={styles.dishNote}>A familiar kind of comfort.</Text>
            </View>}
          </View>
          <View style={[styles.actions, compact && styles.compactActions]}>
            <Pressable accessibilityRole="button" onPress={() => router.push("/register")} style={[styles.button, styles.primary]}>
              <Text style={styles.primaryText}>Get started</Text><Feather name="arrow-right" size={16} color="#FFF8ED" />
            </Pressable>
            <Pressable accessibilityRole="button" onPress={() => router.push("/login")} style={[styles.button, styles.secondary]}>
              <Text style={styles.secondaryText}>I already have an account</Text>
            </Pressable>
            <Pressable accessibilityRole="button" onPress={onExplore} style={styles.guest}>
              <Text style={styles.guestText}>Explore the menu first</Text>
            </Pressable>
            {!compact && <Text style={styles.note}>FROM OUR KITCHEN, WITH LOVE</Text>}
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const serif = Platform.select({ android: "serif", ios: "Georgia", web: "Georgia, serif" });
const styles = StyleSheet.create({
  frame: { flex: 1, justifyContent: "center", paddingHorizontal: 24, paddingVertical: 26 },
  content: { flexShrink: 1, width: "100%", maxWidth: 350, alignSelf: "center" },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderBottomWidth: 1, borderBottomColor: "#6D080829", paddingBottom: 14, marginBottom: 16 },
  glassIcon: { width: 40, height: 40, borderRadius: 14, borderWidth: 1, borderColor: "#FFF1DA88", backgroundColor: "#FFFFFF45", alignItems: "center", justifyContent: "center", boxShadow: "0px 3px 8px rgba(57,38,41,0.10)", ...Platform.select({ web: { backdropFilter: "blur(12px)" } }) },
  wordmark: { flexShrink: 1, gap: 5 },
  brand: { color: "#6D0808", fontFamily: serif, fontSize: 21, fontWeight: "700", letterSpacing: 3 },
  tagline: { color: "#796C65", fontSize: 10, letterSpacing: 2 },
  arch: { flexShrink: 1, minHeight: 0, backgroundColor: "#FFF8ED", borderTopLeftRadius: 180, borderTopRightRadius: 180, borderBottomLeftRadius: 18, borderBottomRightRadius: 18, paddingHorizontal: 12, paddingTop: 42, paddingBottom: 26, borderWidth: 1, borderColor: "#BDA78655", boxShadow: "0px 7px 18px rgba(56,34,20,0.12)", ...sheen("linear-gradient(150deg, #FFFDF466, #FFF3DF10)"), ...Platform.select({ web: { backgroundImage: "repeating-linear-gradient(0deg, #9C6E400A 0 1px, transparent 1px 4px), linear-gradient(150deg, #FFFDF466, #FFF3DF10)" } }) },
  copy: { alignItems: "center", gap: 12 },
  eyebrow: { color: "#7A625A", fontSize: 10, letterSpacing: 1.1, textAlign: "center", paddingHorizontal: 8 },
  title: { color: "#6D0808", fontFamily: serif, fontSize: 34, lineHeight: 40, letterSpacing: -1.2, textAlign: "center" },
  italic: { color: "#9B5D52", fontStyle: "italic" },
  subtitle: { color: "#796C65", fontSize: 12, textAlign: "center", lineHeight: 18 },
  food: { height: 260, minHeight: 0, flexShrink: 1, overflow: "hidden", width: "100%", maxWidth: 260, alignSelf: "center", alignItems: "center", justifyContent: "center", marginTop: 22 },
  ring: { position: "absolute", borderWidth: 1, borderColor: "#B28C5966", backgroundColor: "#FFF1DA", boxShadow: "inset 2px 3px 7px rgba(127,86,50,0.15)", padding: 7 },
  innerRing: { borderWidth: 1, borderStyle: "dashed", borderColor: "#B28C5955" },
  photo: { borderWidth: 5, borderColor: "#FFFAF1", transform: [{ rotate: "-8deg" }], boxShadow: "0px 12px 20px rgba(80,59,36,0.25)" },
  stamp: { position: "absolute", right: 0, bottom: 7, width: 74, height: 74, borderRadius: 40, backgroundColor: "#6D0808", padding: 5, transform: [{ rotate: "12deg" }], boxShadow: "0px 4px 9px rgba(72,11,22,0.24)", ...sheen("linear-gradient(145deg, #FFFFFF33, #FFFFFF00 70%)") },
  stampBorder: { flex: 1, borderRadius: 36, borderWidth: 1, borderStyle: "dashed", borderColor: "#FFF1DA88", alignItems: "center", justifyContent: "center", gap: 2 },
  stampSmall: { color: "#FFF1DA", fontSize: 9, letterSpacing: 1.4 },
  stampTitle: { color: "#FFF1DA", fontSize: 12, letterSpacing: 2, fontWeight: "700" },
  stampNote: { color: "#FFF1DA", fontFamily: serif, fontSize: 9, fontStyle: "italic" },
  caption: { alignItems: "center", gap: 6, paddingTop: 16 },
  captionLabel: { color: "#967B65", fontSize: 10, letterSpacing: 1.3, textAlign: "center" },
  dish: { color: "#6D0808", fontFamily: serif, fontSize: 22 },
  dishNote: { color: "#796C65", fontFamily: serif, fontSize: 12, fontStyle: "italic" },
  actions: { gap: 10, marginTop: 20 },
  button: { minHeight: 48, borderRadius: 15, paddingHorizontal: 14, paddingVertical: 10, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 12 },
  primary: { backgroundColor: "#6D0808", borderRadius: 17, boxShadow: "0px 4px 10px rgba(109,8,8,0.22)", ...sheen("linear-gradient(170deg, #FFFFFF44, #FFFFFF08 40%, #FFFFFF00 75%)") },
  secondary: { borderWidth: 1, borderColor: "#6D08084D", backgroundColor: "#FFFFFF45", borderRadius: 17, boxShadow: "0px 3px 9px rgba(85,51,51,0.10)", ...sheen("linear-gradient(165deg, #FFFDF366, #FFF6E800)"), ...Platform.select({ web: { backdropFilter: "blur(14px)" } }) },
  primaryText: sharedStyles.creamButtonLabel,
  secondaryText: sharedStyles.price,
  guest: { minHeight: 44, alignItems: "center", justifyContent: "center" },
  guestText: sharedStyles.guestLink,
  compactFrame: { paddingVertical: 10 },
  compactHeader: { paddingBottom: 8, marginBottom: 8 },
  compactArch: { paddingTop: 20, paddingBottom: 10 },
  compactCopy: { gap: 5 },
  compactTitle: { fontSize: 27, lineHeight: 31 },
  compactFood: { marginTop: 8 },
  compactCaption: { gap: 3, paddingTop: 6 },
  compactActions: { gap: 5, marginTop: 10 },
  note: { color: "#796C65", fontSize: 10, letterSpacing: 1.5, textAlign: "center", marginTop: 4 },
});
