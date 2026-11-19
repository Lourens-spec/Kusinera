import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { AppState } from "react-native";
import { supabase } from "./supabase";
import { useAuth } from "../context/AuthContext";
import { DEMO_PROMOTIONS, isPromotionActive } from "../utils/promotions";

const PromotionsContext = createContext(null);
export function PromotionsProvider({ children }) {
  const { currentUser } = useAuth();
  const owner = currentUser?.id || "guest";
  const [snapshot, setSnapshot] = useState({ owner: null, rows: [], loading: true, error: "" });
  const epoch = useRef(0);
  const reload = useCallback(async () => {
    const version = ++epoch.current;
    if (!supabase) { setSnapshot({ owner, rows: DEMO_PROMOTIONS, loading: false, error: "" }); return; }
    setSnapshot(current => ({ ...current, loading: true, error: "" }));
    try {
      const { data, error } = await supabase.from("promotions").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      if (version === epoch.current) setSnapshot({ owner, rows: data, loading: false, error: "" });
    } catch {
      if (version === epoch.current) setSnapshot(current => ({ owner, rows: current.owner === owner ? current.rows : [], loading: false, error: "Couldn’t load promos. Check your connection and try again." }));
    }
  }, [owner, currentUser?.role]);
  useEffect(() => {
    reload();
    const timer = setInterval(() => { if (AppState.currentState !== "background") reload(); }, 15000);
    const listener = AppState.addEventListener("change", state => { if (state === "active") reload(); });
    return () => { epoch.current++; clearInterval(timer); listener.remove(); };
  }, [reload]);
  const promotions = snapshot.owner === owner ? snapshot.rows : [];
  return <PromotionsContext.Provider value={{ promotions, activePromotions: promotions.filter(item => isPromotionActive(item)), promotionsLoading: snapshot.owner !== owner || snapshot.loading, promotionsError: snapshot.owner === owner ? snapshot.error : "", reloadPromotions: reload }}>{children}</PromotionsContext.Provider>;
}
export function usePromotions() { return useContext(PromotionsContext); }
