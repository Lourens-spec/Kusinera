import { useEffect, useState } from "react";
import { AppState } from "react-native";
import { supabase } from "./supabase";

export function toDineInOrder(row, user) {
  return {
    id: `DI-${row.id}`,
    cloudId: row.id,
    customerUsername: row.customer_id === user.id ? user.username : undefined,
    type: "dine-in",
    table: row.table_number,
    status: row.status,
    paid: row.paid,
    subtotal: Number(row.subtotal),
    discount: Number(row.discount),
    voucherCode: row.voucher_code,
    total: Number(row.total),
    lines: row.lines,
    rating: row.dine_in_ratings ?? undefined,
  };
}

export function toDeliveryOrder(row, user, address = row.delivery_order_addresses) {
  return {
    ...toDineInOrder(row, user),
    id: `DL-${row.id}`,
    type: "delivery",
    rating: row.delivery_ratings ?? undefined,
    delivery: address,
    deliveryFee: Number(row.delivery_fee),
    riderId: row.rider_id,
    cashRemitted: row.cash_remitted,
    cancellationReason: row.cancellation_reason,
    deliveryIssue: row.delivery_issue,
  };
}

export function useDineInOrders(ownerId, delivery = false) {
  const [snapshot, setSnapshot] = useState(null);
  const [revision, setRevision] = useState(0);
  const ratingsTable = delivery ? "delivery_ratings" : "dine_in_ratings";

  useEffect(() => {
    if (!ownerId || !supabase) return;
    let active = true;
    let fetching = false;

    async function load() {
      if (fetching || AppState.currentState === "background") return;
      fetching = true;
      try {
        const { data, error } = await supabase.from(delivery ? "delivery_orders" : "dine_in_orders")
          .select(`*, ${ratingsTable}(stars, comment)${delivery ? ", delivery_order_addresses(*)" : ""}`)
          .order("id", { ascending: false });
        if (active && !error) setSnapshot({ ownerId, rows: data, error: "" });
        if (active && error) throw error;
      } catch {
        if (active) setSnapshot(previous => ({
          ownerId,
          rows: previous?.ownerId === ownerId ? previous.rows : [],
          error: "Shared orders couldn’t load. The app will retry.",
        }));
      } finally {
        fetching = false;
      }
    }

    load();
    const timer = setInterval(load, 5000);
    const listener = AppState.addEventListener("change", state => {
      if (state === "active") load();
    });
    return () => {
      active = false;
      clearInterval(timer);
      listener.remove();
    };
  }, [ownerId, revision, delivery, ratingsTable]);

  return {
    rows: ownerId && snapshot?.ownerId === ownerId ? snapshot.rows : [],
    syncError: ownerId && snapshot?.ownerId === ownerId ? snapshot.error : "",
    refresh: () => setRevision(value => value + 1),
    applyRating: (orderId, rating) => {
      setSnapshot(previous => previous?.ownerId === ownerId ? {
        ...previous,
        rows: previous.rows.map(row => row.id === orderId ? { ...row, [ratingsTable]: rating } : row),
      } : previous);
      setRevision(value => value + 1);
    },
  };
}


export async function saveSharedRating(order, rating) {
  const table = supabase.from(order.type === "delivery" ? "delivery_ratings" : "dine_in_ratings");
  const orderId = order.cloudId;
  const inserted = await table.insert({ order_id: orderId, ...rating }).select("stars, comment").single();
  if (inserted.error?.code !== "23505") return inserted;

  return table.update(rating).eq("order_id", orderId).select("stars, comment").single();
}
