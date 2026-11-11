import { Text } from "../components/Themed";
import React from "react";
import { Redirect, useLocalSearchParams, useRouter } from "expo-router";
import AuthButton from "../components/authButton";
import DishEditor from "../components/DishEditor";
import ScreenContainer from "../components/ScreenContainer";
import { useAuth } from "../context/AuthContext";
import { useMenu } from "../context/MenuContext";

export default function EditDishRoute() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { currentUser } = useAuth();
  const { menuItems, saveDish } = useMenu();
  const item = menuItems.find((dish) => dish.id === id);

  if (!currentUser) return <Redirect href="/login" />;
  if (currentUser.role !== "staff") return <Redirect href="/" />;
  if (id && !item) {
    return (
      <ScreenContainer>
        <Text style={{ color: "#292323" }}>Dish not found.</Text>
        <AuthButton title="Back to menu management" onPress={() => router.dismissTo("/manage-menu")} />
      </ScreenContainer>
    );
  }

  function save(draft) {
    const result = saveDish(draft, item?.id);
    if (!result.error) router.dismissTo("/manage-menu");
    return result.error;
  }

  return (
    <DishEditor
      key={item?.id ?? "new"}
      item={item}
      onSave={save}
      onCancel={() => router.dismissTo("/manage-menu")}
    />
  );
}
