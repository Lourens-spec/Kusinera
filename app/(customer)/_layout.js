import React from "react";
import { Tabs } from "expo-router";
import BottomNavigation from "../../components/BottomNavigation";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";

export default function CustomerTabs() {
  const { darkMode } = useTheme();
  const { currentUser, browsingMenu } = useAuth();
  return (
    <Tabs backBehavior="initialRoute" screenOptions={{ headerShown: false, animation: "none", sceneStyle: { backgroundColor: darkMode ? "#211819" : "#FFF8ED" } }} tabBar={(props) => {
      const welcome = !currentUser && !browsingMenu && props.state.routes[props.state.index].name === "index";
      const employee = currentUser?.role && currentUser.role !== "customer";
      return welcome || employee ? null : <BottomNavigation {...props} />;
    }}>
      <Tabs.Screen name="index" options={{ title: "Menu" }} />
      <Tabs.Screen name="cart" options={{ title: "Tray" }} />
      <Tabs.Screen name="tracking" options={{ title: "Orders" }} />
      <Tabs.Screen name="profile" options={{ title: "Profile" }} />
    </Tabs>
  );
}
