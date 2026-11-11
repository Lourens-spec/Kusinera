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

  function handleRegister(account) {
    register(account);
    openLogin();
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

