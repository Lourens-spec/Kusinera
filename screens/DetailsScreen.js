import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import ScreenContainer from "../components/ScreenContainer";
import AuthButton from "../components/authButton";

export default function DetailsScreen({ item, id, onBack, onAddToCart, onOpenCart, cartCount, isLoggedIn }) {
  if (!item) {
    return (
      <ScreenContainer>
        <Text style={styles.title}>Item not found</Text>
        <Text style={styles.description}>There is no menu item with ID: {id || "(missing)"}.</Text>
        <AuthButton title="Back to menu" onPress={onBack} />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <Text style={styles.eyebrow}>KUSINERA / MENU DETAILS</Text>
      <View style={styles.hero}>
        <Image
          source={item.image}
          style={styles.image}
          resizeMode="contain"
          accessibilityLabel={item.name}
        />
        <Text style={styles.category}>{item.category}</Text>
        <Text style={styles.title}>{item.name}</Text>
        <Text style={styles.price}>PHP {item.price.toFixed(2)}</Text>
        <View style={styles.actions}>
          <AuthButton title={isLoggedIn ? "Add to cart" : "Log in to add to cart"} onPress={onAddToCart} />
          <AuthButton title={`View cart (${cartCount})`} onPress={onOpenCart} />
        </View>
      </View>
      <View style={styles.card}>
        <Text style={styles.id}>ID: {id}</Text>
        <Text style={styles.heading}>About this dish</Text>
        <Text style={styles.description}>{item.description}</Text>
        <View style={styles.facts}>
          <Text style={styles.fact}>Serves: {item.serving}</Text>
          <Text style={styles.fact}>Preparation: {item.preparationTime}</Text>
        </View>
        <Text style={styles.heading}>Ingredients</Text>
        {item.ingredients.map((ingredient) => (
          <Text style={styles.ingredient} key={ingredient}>{"\u2022"} {ingredient}</Text>
        ))}
      </View>
      <AuthButton title="Back to menu" onPress={onBack} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  eyebrow: {
    color: "#6D0808",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1,
    marginVertical: 12,
  },
  hero: {
    alignItems: "center",
    backgroundColor: "#F8ECE8",
    borderRadius: 24,
    padding: 20,
    marginTop: 8,
    marginBottom: 20,
  },
  category: {
    color: "#716767",
    fontSize: 14,
    marginTop: 16,
    marginBottom: 8,
  },
  image: {
    width: "100%",
    height: "auto",
    aspectRatio: 1,
    borderRadius: 16,
  },
  title: {
    color: "#292323",
    fontSize: 30,
    fontWeight: "800",
    textAlign: "center",
  },
  price: {
    color: "#6D0808",
    fontSize: 22,
    fontWeight: "700",
    marginTop: 12,
  },
  actions: { alignSelf: "stretch", marginTop: 8 },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 24,
    marginBottom: 10,
  },
  id: {
    color: "#6D0808",
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 18,
  },
  heading: {
    color: "#292323",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 10,
  },
  description: {
    color: "#625B5B",
    fontSize: 16,
    lineHeight: 25,
    marginVertical: 8,
  },
  facts: {
    borderTopWidth: 1,
    borderTopColor: "#EEE8E8",
    marginTop: 14,
    paddingVertical: 18,
    gap: 8,
  },
  fact: {
    color: "#625B5B",
    fontSize: 14,
  },
  ingredient: {
    color: "#625B5B",
    fontSize: 15,
    lineHeight: 25,
  },
  note: {
    color: "#716767",
    textAlign: "center",
    fontSize: 12,
    marginTop: 20,
  },
});
