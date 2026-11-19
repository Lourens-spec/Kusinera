import { useEffect, useRef, useState } from "react";
import { Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const orderHistoryKey = order => [order.cloudId ? "cloud" : "local", order.type, order.id].join(":");
export const canHideOrder = order => order.status === "Cancelled" || (order.paid && ["Served", "Delivered"].includes(order.status));

export function useOrderHistory(account) {
  const storageKey = "kusinera:hidden-orders:" + (account.id || account.username);
  const [hiddenIds, setHiddenIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);
  const locked = useRef(false);
  useEffect(() => {
    let active = true;
    setLoading(true); setError("");
    AsyncStorage.getItem(storageKey).then(value => {
      const ids = JSON.parse(value || "[]");
      if (!Array.isArray(ids) || !ids.every(id => typeof id === "string")) throw new Error("Invalid order history.");
      if (active) setHiddenIds(ids);
    }).catch(() => { if (active) setError("Couldn’t load your hidden orders. Please try again."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [storageKey, retry]);

  async function saveHidden(orders, hide) {
    if (loading || error || locked.current) return;
    const keys = orders.filter(canHideOrder).map(orderHistoryKey);
    if (!keys.length) return;
    const next = hide ? [...new Set([...hiddenIds, ...keys])] : hiddenIds.filter(id => !keys.includes(id));
    locked.current = true; setSaving(true);
    try { await AsyncStorage.setItem(storageKey, JSON.stringify(next)); setHiddenIds(next); }
    catch { Alert.alert("Couldn’t update your list", "Your orders have not changed. Please try again."); }
    finally { locked.current = false; setSaving(false); }
  }
  return { isHidden: order => canHideOrder(order) && hiddenIds.includes(orderHistoryKey(order)), saveHidden, loading, saving, error, retry: () => setRetry(value => value + 1) };
}
