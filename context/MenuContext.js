import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { useAuth } from "./AuthContext";
import { AppState } from "react-native";
import { supabase } from "../lib/supabase";
import { fromMenuRow, storeMenuDish } from "../lib/menu";
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
  const [syncError, setSyncError] = useState("");
  const nextId = useRef(Math.max(...initialMenu.map(item => Number(item.id))) + 1);
  const revision = useRef(0);

  useEffect(() => {
    if (!supabase) return;
    let active = true;
    let fetching = false;
    async function load() {
      if (fetching || AppState.currentState === "background") return;
      fetching = true;
      const version = revision.current;
      try {
        const result = await supabase.from("menu_dishes").select("id, dish").order("created_at");
        if (result.error) throw result.error;
        if (active && version === revision.current) {
          setMenuItems(result.data.map(fromMenuRow));
          setSyncError("");
        }
      } catch {
        if (active) setSyncError("Shared menu unavailable. Check the connection and run the menu SQL setup.");
      } finally { fetching = false; }
    }
    load();
    const timer = setInterval(load, 5000);
    const listener = AppState.addEventListener("change", state => { if (state === "active") load(); });
    return () => { active = false; clearInterval(timer); listener.remove(); };
  }, [currentUser?.id]);

  async function saveDish(draft, id) {
    if (currentUser?.role !== "staff") return { error: "Staff access is required." };
    if (id && !menuItems.some(item => item.id === id)) return { error: "This dish could not be found." };
    const result = prepareDish(draft);
    if (result.error) return result;
    if (supabase && !currentUser.id) return { error: "Sign in with your Supabase staff account to publish dishes. Demo accounts cannot publish." };
    const dishId = id || (supabase ? null : String(nextId.current++));
    revision.current++;
    try {
      const dish = supabase ? await storeMenuDish(result.dish, dishId, Boolean(id)) : { ...result.dish, id: dishId };
      revision.current++;
      setMenuItems(current => current.some(item => item.id === dish.id)
        ? current.map(item => item.id === dish.id ? dish : item) : [...current, dish]);
      setSyncError("");
      return { id: dish.id };
    } catch (failure) {
      return { error: failure.message || "Couldn’t publish this dish. Please try again." };
    }
  }

  async function setDishAvailable(id, available) {
    if (currentUser?.role !== "staff") return;
    revision.current++;
    try {
      if (supabase) {
        if (!currentUser.id) throw new Error("Sign in with your Supabase staff account to change availability.");
        const { error } = await supabase.rpc("set_menu_dish_available", { p_id: id, p_available: available });
        if (error) throw error;
      }
      revision.current++;
      setMenuItems(current => current.map(item => item.id === id ? { ...item, available } : item));
      setSyncError("");
    } catch (failure) { setSyncError(failure.message || "Couldn’t update dish availability."); }
  }

  return (
    <MenuContext.Provider value={{ menuItems, saveDish, setDishAvailable, syncError }}>
      {children}
    </MenuContext.Provider>
  );
}

export function useMenu() {
  return useContext(MenuContext);
}
