import React from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import LoginScreen from "../screens/LoginScreen";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";

export default function LoginRoute() {
  const router = useRouter();
  const { dishId, fromCart, fromProfile, fromFavorites, fromTracking } = useLocalSearchParams();
  const { message, setMessage, login, exploreMenu } = useAuth();

  async function handleLogin(identifier, password) {
    const account = await login(identifier, password);
    if (account.role === "admin") {
      router.dismissTo("/admin");
    } else if (account.role === "rider") {
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
      emailEnabled={Boolean(supabase)}
      onVerifyEmail={email => router.push({ pathname: "/verify-email", params: { email, dishId, fromCart, fromProfile, fromFavorites, fromTracking, noCodeSent: "1" } })}
      message={message}
      goToRegister={openRegistration}
      onLoginSuccess={handleLogin}
      goToHome={() => { exploreMenu(); router.replace("/"); }}
    />
  );
}


