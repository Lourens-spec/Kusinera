import { Feather, MaterialCommunityIcons, KeyboardAvoidingView, Pressable, ScrollView, Text, View, SafeAreaView } from "./Themed";
import React from "react";
import { Platform } from "react-native";

export default function AuthLayout({ styles, goToWelcome, header, children, bounces = true }) {
  return (
    <SafeAreaView style={styles.background}>
      <KeyboardAvoidingView style={styles.fill} behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <ScrollView bounces={bounces} overScrollMode={bounces ? "auto" : "never"} contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.page}>
            <View style={styles.header}>
              <View style={styles.top}>
                <Text style={styles.brand}>KUSINERA</Text>
                <Pressable accessibilityRole="button" accessibilityLabel="Back to welcome" onPress={goToWelcome} style={styles.close}>
                  <Feather name="x" size={20} color="#FFF8ED" />
                </Pressable>
              </View>
              {header}
            </View>
            <View style={styles.form}>
              {children}
              <View style={styles.footer}>
                <MaterialCommunityIcons name="pot-steam-outline" size={16} color="#9B8370" />
                <Text style={styles.footerLabel}>FROM OUR KITCHEN, WITH LOVE</Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

export function AuthDivider({ styles, label, style }) {
  return <View style={[styles.divider, style]}><View style={styles.line} /><Text style={styles.details}>{label}</Text><View style={styles.line} /></View>;
}

export function AuthSubmit({ styles, label, onPress }) {
  return <Pressable accessibilityRole="button" onPress={onPress} style={styles.submit}><Text style={styles.submitLabel}>{label}</Text><Feather name="arrow-right" size={16} color="#FFF8ED" /></Pressable>;
}
