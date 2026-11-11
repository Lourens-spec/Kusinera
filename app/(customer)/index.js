import React from "react";
import { Redirect, useRouter } from "expo-router";
import HomeScreen from "../../screens/HomeScreen";
import WelcomeScreen from "../../screens/WelcomeScreen";
import { useAuth } from "../../context/AuthContext";

export default function HomeRoute() {
  const router = useRouter();
  const { currentUser, browsingMenu, exploreMenu } = useAuth();

  if (currentUser?.role === "rider") return <Redirect href="/rider" />;
  if (currentUser?.role === "kitchen") return <Redirect href="/kitchen" />;

  if (!currentUser && !browsingMenu) return <WelcomeScreen onExplore={exploreMenu} />;

  function openItem(id) {
    router.push({ pathname: "/details/[id]", params: { id } });
  }

  return (
    <HomeScreen
      username={currentUser?.displayName || currentUser?.username}
      onSelectItem={openItem}
    />
  );
}

