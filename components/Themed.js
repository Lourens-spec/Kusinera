import React from "react";
import * as Native from "react-native";
import { SafeAreaView as NativeSafeAreaView } from "react-native-safe-area-context";
import * as Icons from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";

const surfaces = {
  "#E0E6F8": "#211819",
  "#FFF8ED": "#211819",
  "#FFFDF9": "#302324",
  "#FFFFFF": "#302324",
  "#FFFAF1": "#4B3536",
  WHITE: "#302324",
  "#F8ECE8": "#493233",
  "#FFF1DA": "#443032",
  "#F5D7B7": "#593D39",
  "#F5DFBA": "#593D39",
  "#EBCFA5": "#795952",
  "#6D0808": "#872C32",
  "#E4F4E8": "#263E32",
  "#A9C9B4": "#49745A",
  "#DDD5D5": "#584344",
  "#FFFFFF45": "#392829",
};

const foreground = {
  "#292323": "#FFF2E9",
  "#352925": "#FFF2E9",
  "#403838": "#F5E4DB",
  "#6D0808": "#F5B6AE",
  "#702329": "#F5B6AE",
  "#B42318": "#FFAAA2",
  "#23543A": "#A8DFB8",
  "#27613B": "#A8DFB8",
  "#625B5B": "#D9C5BF",
  "#716767": "#D9C5BF",
  "#76665F": "#D9C5BF",
  "#796C65": "#D9C5BF",
  "#7A625A": "#D9C5BF",
  "#808080": "#CEB7AF",
  "#8B7766": "#CEB7AF",
  "#967B65": "#CEB7AF",
  "#9A7E6D": "#CEB7AF",
  "#9B5D52": "#E8A99F",
  "#9B8370": "#CEB7AF",
  BLACK: "#FFF2E9",
};

const borders = {
  "#6D0808": "#B46665",
  "#6D080829": "#60474A",
  "#6D08082E": "#60474A",
  "#6D08084D": "#775456",
  "#A39898": "#80686A",
  "#AEA8BE": "#80686A",
  "#C4A9A9": "#775456",
  "#D8C8CC": "#60474A",
  "#D9C9B8": "#60474A",
  "#D9C9B877": "#60474A",
  "#DDD5D5": "#60474A",
  "#E5D9CA": "#60474A",
  "#E9DFD2": "#60474A",
  "#EADCCC": "#60474A",
  "#EADCCD": "#60474A",
  "#EAE0E0": "#60474A",
  "#EEE8E8": "#60474A",
};

function mapColor(value, palette) {
  return typeof value === "string" ? palette[value.toUpperCase()] ?? value : value;
}

const darkStyles = new WeakMap();

function darkStyle(style) {
  if (!style) return style;
  if (typeof style === "function") return state => darkStyle(style(state));
  if (typeof style !== "object") return style;
  if (darkStyles.has(style)) return darkStyles.get(style);

  const result = Array.isArray(style) ? style.map(darkStyle) : { ...style };
  if (!Array.isArray(style)) {
    for (const key of Object.keys(result)) {
      if (key === "backgroundColor") result[key] = mapColor(result[key], surfaces);
      else if (key === "color" || key === "tintColor") result[key] = mapColor(result[key], foreground);
      else if (key.startsWith("border") && key.endsWith("Color")) result[key] = mapColor(result[key], borders);
    }
  }
  darkStyles.set(style, result);
  return result;
}

function themed(Component, name) {
  function ThemedComponent(props) {
    const { darkMode } = useTheme();
    if (!darkMode) return <Component {...props} />;

    const next = { ...props };
    for (const key of ["style", "contentContainerStyle", "imageStyle", "columnWrapperStyle"]) {
      if (props[key] !== undefined) next[key] = darkStyle(props[key]);
    }
    for (const key of ["color", "placeholderTextColor", "selectionColor", "cursorColor", "thumbColor"]) {
      if (props[key] !== undefined) next[key] = mapColor(props[key], foreground);
    }
    if (props.trackColor) {
      next.trackColor = {
        false: mapColor(props.trackColor.false, surfaces),
        true: mapColor(props.trackColor.true, surfaces),
      };
    }
    if (Component === Native.TextInput && props.keyboardAppearance === undefined) next.keyboardAppearance = "dark";
    return <Component {...next} />;
  }

  ThemedComponent.displayName = name;
  return ThemedComponent;
}

export const View = themed(Native.View, "ThemedView");
export const Text = themed(Native.Text, "ThemedText");
export const TextInput = themed(Native.TextInput, "ThemedTextInput");
export const Pressable = themed(Native.Pressable, "ThemedPressable");
export const TouchableOpacity = themed(Native.TouchableOpacity, "ThemedTouchableOpacity");
export const ScrollView = themed(Native.ScrollView, "ThemedScrollView");
export const FlatList = themed(Native.FlatList, "ThemedFlatList");
export const Image = themed(Native.Image, "ThemedImage");
export const ImageBackground = themed(Native.ImageBackground, "ThemedImageBackground");
export const Switch = themed(Native.Switch, "ThemedSwitch");
export const KeyboardAvoidingView = themed(Native.KeyboardAvoidingView, "ThemedKeyboardAvoidingView");
export const SafeAreaView = themed(NativeSafeAreaView, "ThemedSafeAreaView");
export const Feather = themed(Icons.Feather, "ThemedFeather");
export const Ionicons = themed(Icons.Ionicons, "ThemedIonicons");
export const MaterialCommunityIcons = themed(Icons.MaterialCommunityIcons, "ThemedMaterialCommunityIcons");
