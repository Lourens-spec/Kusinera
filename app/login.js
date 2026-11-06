import React from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import LoginScreen from "../screens/LoginScreen";
import { useAuth } from "../context/AuthContext";

export default function LoginRoute() {
  const router = useRouter();
  const { dishId, fromCart } = useLocalSearchParams();
  const { accounts, message, setMessage, login } = useAuth();

  function handleLogin(account) {
    login(account);
    if (typeof dishId === "string" && dishId) {
      router.dismissTo({ pathname: "/details/[id]", params: { id: dishId } });
    } else if (fromCart === "1") {
      router.dismissTo("/cart");
    } else {
      router.replace("/");
    }
  }

  function openRegistration() {
    setMessage("");
    router.replace({ pathname: "/register", params: { dishId, fromCart } });
  }

  return (
    <LoginScreen
      accounts={accounts}
      message={message}
      goToRegister={openRegistration}
      onLoginSuccess={handleLogin}
      goToHome={() => router.replace("/")}
    />
  );
}
