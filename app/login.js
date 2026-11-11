import React from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import LoginScreen from "../screens/LoginScreen";
import { useAuth } from "../context/AuthContext";

export default function LoginRoute() {
  const router = useRouter();
  const { dishId, fromCart, fromProfile, fromFavorites, fromTracking } = useLocalSearchParams();
  const { accounts, message, setMessage, login, exploreMenu } = useAuth();

  function handleLogin(account) {
    login(account);
    if (account.role === "rider") {
      router.dismissTo("/rider");
    } else if (account.role === "staff" || account.role === "kitchen") {
      router.dismissTo("/kitchen");
    } else if (typeof dishId === "string" && dishId) {
      router.dismissTo({ pathname: "/details/[id]", params: { id: dishId } });
    } else if (fromTracking === "1") {
      router.dismissTo("/tracking");
    } else if (fromFavorites === "1") {
      router.dismissTo("/favorites");
    } else if (fromProfile === "1") {
      router.dismissTo("/profile");
    } else if (fromCart === "1") {
      router.dismissTo("/cart");
    } else {
      router.replace("/");
    }
  }

  function openRegistration() {
    setMessage("");
    router.replace({ pathname: "/register", params: { dishId, fromCart, fromProfile, fromFavorites, fromTracking } });
  }

  return (
    <LoginScreen
      goToWelcome={() => router.dismissTo("/")}
      accounts={accounts}
      message={message}
      goToRegister={openRegistration}
      onLoginSuccess={handleLogin}
      goToHome={() => { exploreMenu(); router.replace("/"); }}
    />
  );
}


