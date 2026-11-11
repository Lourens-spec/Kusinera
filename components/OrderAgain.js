import React from "react";
import { useRouter } from "expo-router";
import { useCart } from "../context/CartContext";
import { DeliveryAction } from "./delivery/DeliveryTicket";

export default function OrderAgain({ order }) {
  const router = useRouter();
  const { reorderOrder } = useCart();
  if (!["Served", "Delivered"].includes(order.status)) return null;

  function reorder() {
    reorderOrder(order.id);
    router.navigate("/cart");
  }

  return <DeliveryAction label="Order again" onPress={reorder} />;
}
