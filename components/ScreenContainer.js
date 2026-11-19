import { ScrollView, View, SafeAreaView } from "./Themed";
import sharedStyles from "../styles/sharedStyles";
import React from "react";
import { KeyboardAvoidingView, Platform, StyleSheet } from "react-native";
import { useMenuGlass } from "../styles/menuGlass";

export default function ScreenContainer({ children, header, footer, keyboardShouldPersistTaps, backgroundColor, contentStyle, scrollStyle, viewportStyle, scrollViewRef, onScrollLayout, keyboardAvoiding = false, glassBackground = false, tabScreen = false }) {
  const glass = useMenuGlass();
  const viewport = viewportStyle ?? (tabScreen || glassBackground ? [styles.viewport, glass.backdrop] : null);
  const scrollView = <ScrollView ref={scrollViewRef} onLayout={onScrollLayout} keyboardDismissMode={keyboardAvoiding ? "on-drag" : undefined} contentContainerStyle={[styles.scroll, scrollStyle]} keyboardShouldPersistTaps={keyboardShouldPersistTaps}>
    <View style={[styles.content, contentStyle]}>{children}</View>
  </ScrollView>;
  const content = <>
    {viewport ? <View style={viewport}>{header}{scrollView}</View> : <>{header}{scrollView}</>}
    {footer}
  </>;
  return <SafeAreaView style={[styles.background, backgroundColor && { backgroundColor }, glassBackground && glass.bar]} edges={footer || tabScreen ? ["top", "left", "right"] : undefined}>
    {keyboardAvoiding && Platform.OS !== "web" ? <KeyboardAvoidingView style={styles.viewport} behavior={Platform.OS === "ios" ? "padding" : "height"}>{content}</KeyboardAvoidingView> : content}
  </SafeAreaView>;
}
const styles = StyleSheet.create({
  background: sharedStyles.background,
  viewport: { flex: 1 },
  scroll: { flexGrow: 1, padding: 24 },
  content: { width: "100%", maxWidth: 600, alignSelf: "center" },
});
