import React, { createContext, useContext, useRef, useState } from "react";
import { useAuth } from "./AuthContext";
import initialMenu from "../data/menuItems";

const MenuContext = createContext(null);
export const menuGroups = ["Mains", "Noodles", "Dessert"];

export function validateDishBasics(draft) {
  const name = draft.name.trim();
  const price = String(draft.price).trim();
  if (!name || name.length > 80) return "Enter a dish name of up to 80 characters.";
  if (!/^\d{1,7}(\.\d{1,2})?$/.test(price) || Number(price) <= 0) {
    return "Enter a price above zero with up to two decimal places.";
  }
  if (!menuGroups.includes(draft.menuGroup)) return "Choose a menu group.";
  return null;
}

export function prepareDish(draft) {
  const name = draft.name.trim();
  const price = String(draft.price).trim();
  const description = draft.description.trim();
  const ingredients = [...new Set(draft.ingredients.map((ingredient) => ingredient.trim()).filter(Boolean))];

  const basicsError = validateDishBasics(draft);
  if (basicsError) return { error: basicsError };
  if (!description || ingredients.length === 0 || !draft.serving.trim() || !draft.preparationTime.trim()) {
    return { error: "Add a description, ingredients, serving size, and preparation time." };
  }

  return {
    dish: {
      name, price: Number(price), description, ingredients,
      menuGroup: draft.menuGroup,
      category: draft.category.trim() || draft.menuGroup,
      serving: draft.serving.trim(),
      preparationTime: draft.preparationTime.trim(),
      image: draft.image ?? null,
      available: draft.available !== false,
    },
  };
}

export function MenuProvider({ children }) {
  const { currentUser } = useAuth();
  const [menuItems, setMenuItems] = useState(initialMenu);
  const nextId = useRef(Math.max(...initialMenu.map((item) => Number(item.id))) + 1);

  function saveDish(draft, id) {
    if (currentUser?.role !== "staff") return { error: "Staff access is required." };
    if (id && !menuItems.some((item) => item.id === id)) return { error: "This dish could not be found." };
    const result = prepareDish(draft);
    if (result.error) return result;
    const dish = { ...result.dish, id: id || String(nextId.current++) };
    setMenuItems((current) => id
      ? current.map((item) => item.id === id ? dish : item)
      : [...current, dish]);
    return { id: dish.id };
  }

  function setDishAvailable(id, available) {
    if (currentUser?.role !== "staff") return;
    setMenuItems((current) => current.map((item) => item.id === id ? { ...item, available } : item));
  }

  return (
    <MenuContext.Provider value={{ menuItems, saveDish, setDishAvailable }}>
      {children}
    </MenuContext.Provider>
  );
}

export function useMenu() {
  return useContext(MenuContext);
}
