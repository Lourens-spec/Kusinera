import { Feather, MaterialCommunityIcons, Pressable, Text, View, SafeAreaView } from "./Themed";
import React from "react";
import { useRouter } from "expo-router";
import { Keyboard, Platform, StyleSheet } from "react-native";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { glossyMenuTab, useMenuGlass } from "../styles/menuGlass";

const mainTabs = [
  { label: "Menu", displayLabel: "Menu", icon: "book-open", route: "/" },
  { label: "Cart", displayLabel: "Tray", icon: "tray-full", Icon: MaterialCommunityIcons, route: "/cart" },
  { label: "Orders", icon: "clipboard", route: "/tracking" },
  { label: "Profile", icon: "user", route: "/profile" },
];

export default function BottomNavigation({ active, state, navigation }) {
  const router = useRouter();
  const { currentUser } = useAuth();
  const { count } = useCart();
  const glass = useMenuGlass();

  const activeRoute = state?.routes[state.index]?.name;

  return (
    <SafeAreaView edges={["bottom"]} style={[styles.bar, glass.bar]}>
      <View accessibilityRole="tablist" style={[styles.tabs, glass.surface, styles.frostedTabs]}>
        {mainTabs.map(({ label, displayLabel = label, icon, Icon = Feather, route }) => {
          const screen = route === "/" ? "index" : route.slice(1);
          const selected = state ? activeRoute === screen : active === label;
          const title = label === "Cart" && currentUser && count > 0 ? `${displayLabel} (${count})` : displayLabel;

          return (
            <Pressable
              key={route}
              accessibilityRole="tab"
              accessibilityState={{ selected }}
              style={[styles.tab, selected && glossyMenuTab]}
              onPress={() => {
                if (selected) return;
                Keyboard.dismiss();
                if (navigation) {
                  const target = state.routes.find(entry => entry.name === screen);
                  const event = navigation.emit({ type: "tabPress", target: target.key, canPreventDefault: true });
                  if (!event.defaultPrevented) navigation.navigate(screen);
                } else router.navigate(route);
              }}
            >
              <Icon name={icon} size={17} color={selected ? "#FFF8ED" : "#76665F"} />
              <Text style={[styles.label, selected && styles.selectedLabel]}>{title}</Text>
            </Pressable>
          );
        })}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  bar: { paddingHorizontal: 8, paddingTop: 10, paddingBottom: 8 },
  tabs: { flexDirection: "row", alignSelf: "center", width: "100%", maxWidth: 480, gap: 3, padding: 7, borderRadius: 34 },
  tab: { flex: 1, minHeight: 48, alignItems: "center", justifyContent: "center", gap: 5, paddingHorizontal: 3, borderRadius: 25 },
  frostedTabs: Platform.select({ web: { backdropFilter: "blur(18px) saturate(130%)" }, default: {} }),
  label: { color: "#76665F", fontSize: 10, textAlign: "center", flexShrink: 1 },
  selectedLabel: { color: "#FFF8ED", fontWeight: "600" },
});
