import { Platform, StyleSheet } from "react-native";
import { useTheme } from "../context/ThemeContext";

export function gradient(value) {
  return Platform.select({
    web: { backgroundImage: value },
    default: { experimental_backgroundImage: value },
  });
}

function authGradient(cream, blush) {
  return gradient(`radial-gradient(ellipse at 15% 24%, ${cream}, transparent 44%), radial-gradient(ellipse at 95% 65%, ${blush}, transparent 48%)`);
}

export const authGlow = {
  light: authGradient("#FFF1DA", "#F5DAD4"),
  dark: authGradient("#543332", "#3A253B"),
};

export const authForm = {
  light: { backgroundColor: "#E0E6F8", ...authGlow.light },
  dark: { backgroundColor: "#252333", ...authGlow.dark },
};

function backdrop(backgroundColor, cream, pink) {
  return {
    backgroundColor,
    ...gradient(`radial-gradient(ellipse at 0% 8%, ${cream}, transparent 55%), radial-gradient(ellipse at 100% 49%, ${pink}, transparent 60%)`),
  };
}

function glass(backgroundColor, edge, highlight, shade, shadow) {
  return {
    backgroundColor,
    borderWidth: 1,
    borderColor: edge,
    boxShadow: `0px 2px 6px ${shadow}`,
    ...gradient(`linear-gradient(145deg, ${highlight}, ${shade})`),
  };
}

const light = StyleSheet.create({
  backdrop: backdrop("#E0E6F8", "#FFF1DA", "#F4CED8"),
  bar: { backgroundColor: "#E0E6F8" },
  surface: glass("#FFFDF95C", "#FFFFFFC9", "#FFFFFFC9", "#FFFAF421", "#422B4C15"),
  panel: glass("#F6EBE9", "#FFFFFFC9", "#FFFFFFD9", "#F4CED83D", "#422B4C38"),
  selectedCategory: { backgroundColor: "#F7DFD0", borderColor: "#B57576" },
});

const dark = StyleSheet.create({
  backdrop: backdrop("#252333", "#543332", "#472B43"),
  bar: { backgroundColor: "#252333" },
  surface: glass("#302832BD", "#E6B9B84D", "#FFFFFF22", "#55424836", "#00000044"),
  panel: glass("#302832", "#E6B9B84D", "#FFFFFF22", "#55424836", "#00000055"),
  selectedCategory: { backgroundColor: "#663F41", borderColor: "#E3A9A0" },
});

export const glossyMenuTab = {
  backgroundColor: "#6D0808",
  boxShadow: "inset 0px 1px 2px #FFFFFF54, 0px 3px 8px #6D080830",
  ...gradient("linear-gradient(155deg, #9C4447, #6D0808 70%)"),
};

export function useMenuGlass() {
  return useTheme().darkMode ? dark : light;
}
