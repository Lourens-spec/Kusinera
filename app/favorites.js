import { Text } from "../components/Themed";
import sharedStyles from "../styles/sharedStyles";
import React from "react";
import { useRouter } from "expo-router";
import { StyleSheet } from "react-native";
import AuthButton from "../components/authButton";
import MenuCard from "../components/MenuCard";
import ScreenContainer from "../components/ScreenContainer";
import { useMenuGlass } from "../styles/menuGlass";
import { useAuth } from "../context/AuthContext";
import { useMenu } from "../context/MenuContext";

export default function FavoritesRoute() {
  const glass = useMenuGlass();
  const router = useRouter();
  const { menuItems } = useMenu();
  const { currentUser, favoriteIds } = useAuth();
  const favorites = menuItems.filter((item) => favoriteIds.includes(item.id));

  function openDish(id) {
    router.push({ pathname: "/details/[id]", params: { id } });
  }

  return (
    <ScreenContainer glassBackground>
      <Text accessibilityRole="header" style={styles.title}>Favorites</Text>
      {!currentUser && (
        <>
          <Text style={styles.note}>Log in to save and view your favorite dishes.</Text>
          <AuthButton
            title="Log in"
            onPress={() => router.push({ pathname: "/login", params: { fromFavorites: "1" } })}
          />
        </>
      )}
      {currentUser && favorites.length === 0 && (
        <Text style={styles.note}>Tap the heart beside a dish on the menu to save it here.</Text>
      )}
      {favorites.map((item) => <MenuCard key={item.id} item={item} onPress={openDish} surfaceStyle={glass.surface} />)}
      <AuthButton title="Back to menu" onPress={() => router.dismissTo("/")} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: sharedStyles.screenTitle,
  note: sharedStyles.note,
});
