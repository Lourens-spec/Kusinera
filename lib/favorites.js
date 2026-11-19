import { useCallback, useEffect, useRef, useState } from "react";
import { Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { supabase } from "./supabase";

export async function readFavorites(userId) {
  const { data, error } = await supabase.from("customer_favorites").select("dish_id").eq("user_id", userId);
  if (error) throw error;
  return data.map(row => row.dish_id);
}

export async function writeFavorite(userId, dishId, selected) {
  const table = supabase.from("customer_favorites");
  const result = selected ? await table.insert({ user_id: userId, dish_id: dishId })
    : await table.delete().eq("user_id", userId).eq("dish_id", dishId);
  if (result.error && !(selected && result.error.code === "23505")) throw result.error;
}

export function useFavorites(user) {
  const key = user?.role === "customer" ? (user.id || "local:" + user.username) : null;
  const userId = user?.id;
  const [state, setState] = useState({ key: null, ids: [], ready: false, error: "" });
  const ids = useRef([]);
  const ready = useRef(false);
  const generation = useRef(0);
  const pending = useRef(new Set());
  const storageKey = "kusinera:favorites:" + key;

  const load = useCallback(async () => {
    if (pending.current.size) return;
    const version = ++generation.current;
    ready.current = false;
    ids.current = [];
    setState({ key, ids: [], ready: false, error: "" });
    if (!key) return;
    try {
      if (supabase && !userId) throw new Error("Sign in again to load your favorites.");
      const values = supabase ? await readFavorites(userId) : JSON.parse(await AsyncStorage.getItem(storageKey) || "[]");
      if (!Array.isArray(values) || !values.every(id => typeof id === "string")) throw new Error("Invalid favorites data.");
      if (version !== generation.current) return;
      ids.current = values;
      ready.current = true;
      setState({ key, ids: values, ready: true, error: "" });
    } catch {
      if (version === generation.current) setState({ key, ids: [], ready: false, error: "Couldn’t load favorites. Check your connection and try again." });
    }
  }, [key, userId, storageKey]);

  useEffect(() => {
    pending.current.clear();
    load();
    return () => { generation.current++; ready.current = false; };
  }, [load]);

  async function toggleFavorite(id) {
    if (!key || pending.current.has(id)) return;
    if (!ready.current) {
      Alert.alert("Favorites unavailable", "Wait for favorites to load, or try loading them again.", [{ text: "Cancel", style: "cancel" }, { text: "Retry", onPress: load }]);
      return;
    }
    const version = generation.current;
    const selected = !ids.current.includes(id);
    const apply = include => {
      ids.current = include ? [...new Set([...ids.current, id])] : ids.current.filter(value => value !== id);
      setState(current => ({ ...current, ids: ids.current }));
    };
    pending.current.add(id);
    apply(selected);
    try {
      if (supabase) await writeFavorite(userId, id, selected);
      else await AsyncStorage.setItem(storageKey, JSON.stringify(ids.current));
    } catch {
      if (version === generation.current) {
        apply(!selected);
        Alert.alert("Favorite wasn’t saved", "Check your connection and try again. If this is the first setup, run the favorites SQL file in Supabase.");
      }
    } finally { if (version === generation.current) pending.current.delete(id); }
  }

  return {
    favoriteIds: state.key === key ? state.ids : [], toggleFavorite,
    favoritesLoading: Boolean(key && (state.key !== key || (!state.ready && !state.error))),
    favoritesError: state.key === key ? state.error : "", reloadFavorites: load,
  };
}
