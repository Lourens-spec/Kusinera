import { ScrollView, View, SafeAreaView } from "./Themed";
import sharedStyles from "../styles/sharedStyles";
import React from "react";
import { StyleSheet } from "react-native";
import { useMenuGlass } from "../styles/menuGlass";

export default function ScreenContainer({ children, header, footer, keyboardShouldPersistTaps, backgroundColor, contentStyle, scrollStyle, viewportStyle, glassBackground = false, tabScreen = false }) {
  const glass = useMenuGlass();
  const viewport = viewportStyle ?? (tabScreen || glassBackground ? [styles.viewport, glass.backdrop] : null);
  const scrollView = (
    <ScrollView contentContainerStyle={[styles.scroll, scrollStyle]} keyboardShouldPersistTaps={keyboardShouldPersistTaps}>
      <View style={[styles.content, contentStyle]}>{children}</View>
    </ScrollView>
  );

  return (
    <SafeAreaView style={[styles.background, backgroundColor && { backgroundColor }, glassBackground && glass.bar]} edges={footer || tabScreen ? ["top", "left", "right"] : undefined}>
      {viewport ? (
        <View style={viewport}>
          {header}
          {scrollView}
        </View>
      ) : (
        <>
          {header}
          {scrollView}
        </>
      )}
      {footer}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  background: sharedStyles.background,
  viewport: { flex: 1 },
  scroll: { flexGrow: 1, padding: 24 },
  content: { width: "100%", maxWidth: 600, alignSelf: "center" },
});


