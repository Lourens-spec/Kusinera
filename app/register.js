import React from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import RegisterScreen from "../screens/RegisterScreen";
import { useAuth } from "../context/AuthContext";

export default function RegisterRoute() {
  const router = useRouter();
  const { dishId, fromCart, fromProfile, fromFavorites, fromTracking } = useLocalSearchParams();

  function openLogin() {
    router.replace({ pathname: "/login", params: { dishId, fromCart, fromProfile, fromFavorites, fromTracking } });
  }
  const { accounts, register } = useAuth();

  async function handleRegister(account) {
    const result = await register(account);
    if (result?.requiresVerification) {
      router.replace({ pathname: "/verify-email", params: { email: result.email, dishId, fromCart, fromProfile, fromFavorites, fromTracking } });
    } else { openLogin(); }
  }

  return (
    <RegisterScreen
      goToWelcome={() => router.dismissTo("/")}
      accounts={accounts}
      goToLogin={openLogin}
      onRegisterSuccess={handleRegister}
    />
  );
}

