import React, { createContext, useContext, useState } from "react";
import { useAuth } from "./AuthContext";
import { useMenu } from "./MenuContext";
import { DELIVERY_CITY, EMPTY_CHECKOUT, SAMPLE_DELIVERY_FEE, isCustomer, validateDelivery } from "../utils/delivery";
import { SAMPLE_VOUCHER, mealAddOns, mealKey, mealTotal, voucherDiscount } from "../utils/mealOptions";

import { canRateOrder, popularDishIds } from "../utils/orderReviews";

const CartContext = createContext(null);

export function getNextOrderStatus(role, status, type = "dine-in") {
  if (role === "kitchen" && (status === "Accepted" || (type !== "delivery" && status === "Placed"))) return "Preparing";
  if (role === "kitchen" && status === "Preparing") return "Ready";
  if (role === "staff" && type !== "delivery" && status === "Ready") return "Served";
  return undefined;
}

function getLines(menuItems, quantities, customizations = {}) {
  return Object.entries(quantities).flatMap(([key, quantity]) => {
    const options = customizations[key];
    const item = menuItems.find((dish) => dish.id === (options?.itemId ?? key));
    if (!item || quantity <= 0) return [];
    const addOns = options?.addOns ?? [];
    const unitPrice = (Math.round(item.price * 100) + addOns.reduce((sum, addon) => sum + Math.round(addon.price * 100), 0)) / 100;
    return [{ key, item, quantity, addOns, notes: options?.notes ?? "", unitPrice }];
  });
}

function withMeal(current, item, quantity, addOns, notes) {
  const key = mealKey(item.id, addOns.map((addon) => addon.id), notes);
  const newQuantity = (current.quantities[key] ?? 0) + quantity;
  if (newQuantity > 99) return { ...current, notice: "Each meal option is limited to 99 servings. Review your tray." };
  return {
    ...current,
    quantities: { ...current.quantities, [key]: newQuantity },
    customizations: { ...current.customizations, [key]: { itemId: item.id, addOns, notes } },
  };
}

export function CartProvider({ children }) {
  const { currentUser, accounts } = useAuth();
  const { menuItems } = useMenu();
  const [cart, setCart] = useState({ quantities: {}, tableNumber: "", orders: [], checkouts: new Map(), error: "" });
  const { quantities, tableNumber, orders, error = "", notice = "" } = cart;
  const checkout = cart.checkouts?.get(currentUser?.username) ?? EMPTY_CHECKOUT;
  const lines = getLines(menuItems, quantities, cart.customizations);
  const count = lines.reduce((sum, { quantity }) => sum + quantity, 0);
  const total = mealTotal(lines);
  const discount = voucherDiscount(total, checkout.voucherCode);
  const deliveryFee = checkout.type === "delivery" && count > 0 ? SAMPLE_DELIVERY_FEE : 0;
  const orderTotal = (Math.round(total * 100) + deliveryFee * 100 - discount * 100) / 100;
  const customerOrders = orders.filter((order) => !order.customerUsername || order.customerUsername === currentUser?.username);

  function setTableNumber(value) {
    setCart((current) => ({ ...current, tableNumber: value, error: "" }));
  }

  function updateCheckout(patch) {
    if (!isCustomer(currentUser)) return;
    setCart((current) => {
      const previous = current.checkouts?.get(currentUser.username) ?? EMPTY_CHECKOUT;
      return { ...current, error: "", checkouts: new Map(current.checkouts).set(currentUser.username, { ...previous, ...patch }) };
    });
  }

  function setOrderType(type) {
    if (type === "dine-in" || type === "delivery") updateCheckout({ type });
  }

  function setDeliveryDetails(details) {
    updateCheckout({ delivery: details });
  }

  function changeQuantity(id, amount) {
    setCart((current) => {
      const itemId = current.customizations?.[id]?.itemId ?? id;
      const item = menuItems.find((dish) => dish.id === itemId);
      if (!item || (amount > 0 && (!currentUser || item.available === false))) return current;
      const next = { ...current.quantities };
      const quantity = (next[id] ?? 0) + amount;
      if (quantity > 99) return { ...current, notice: "Each meal option is limited to 99 servings." };
      if (quantity > 0) next[id] = quantity;
      else delete next[id];
      const customizations = { ...current.customizations };
      if (quantity <= 0) delete customizations[id];
      return { ...current, quantities: next, customizations, error: "", notice: "" };
    });
  }

  function addMeal(id, quantity, addOnIds = [], request = "") {
    if (!isCustomer(currentUser)) return "Log in with a customer account to order.";
    const item = menuItems.find((dish) => dish.id === id);
    if (!item || item.available === false) return "This dish is currently unavailable.";
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 99) return "Choose between 1 and 99 servings.";
    const notes = request.trim();
    if (notes.length > 150) return "Keep meal requests within 150 characters.";
    const options = mealAddOns(item);
    const uniqueIds = [...new Set(addOnIds)];
    if (uniqueIds.some((addonId) => !options.some((option) => option.id === addonId))) return "This add-on is no longer available.";
    const addOns = options.filter((option) => uniqueIds.includes(option.id));
    const key = mealKey(id, uniqueIds, notes);
    if ((cart.quantities[key] ?? 0) + quantity > 99) return "This meal option already has too many servings in your tray.";
    setCart((current) => withMeal({ ...current, error: "", notice: "Meal added to your tray." }, item, quantity, addOns, notes));
    return null;
  }

  function reorderOrder(id) {
    if (!isCustomer(currentUser)) return;
    setCart((current) => {
      const previous = current.orders.find((order) => order.id === id);
      if (!previous || !["Served", "Delivered"].includes(previous.status) ||
        (previous.customerUsername && previous.customerUsername !== currentUser.username)) return current;
      let next = { ...current, error: "" };
      let skipped = 0;
      let added = 0;
      for (const line of previous.lines) {
        const item = menuItems.find((dish) => dish.id === line.item.id);
        const options = item ? mealAddOns(item) : [];
        const ids = (line.addOns ?? []).map((addon) => addon.id);
        const notes = line.notes ?? "";
        const key = mealKey(line.item.id, ids, notes);
        if (!item || item.available === false || ids.some((addonId) => !options.some((option) => option.id === addonId)) ||
          (next.quantities[key] ?? 0) + line.quantity > 99) {
          skipped++;
          continue;
        }
        next = withMeal(next, item, line.quantity, options.filter((option) => ids.includes(option.id)), notes);
        added++;
      }
      const notice = added === 0 ? "No dishes were added. The dishes or options are unavailable, or the quantity limit was reached."
        : skipped ? "Available dishes were added at current prices. Some unavailable dishes or options were skipped. Review your tray."
        : "Meal added again at current prices. Review your tray before ordering.";
      return { ...next, notice };
    });
  }

  function applyVoucher(value) {
    if (!isCustomer(currentUser)) return;
    const code = value.trim().toUpperCase();
    setCart((current) => {
      const selected = current.checkouts?.get(currentUser.username) ?? EMPTY_CHECKOUT;
      const subtotal = mealTotal(getLines(menuItems, current.quantities, current.customizations));
      const voucherMessage = code !== SAMPLE_VOUCHER.code
        ? "Use the sample code KUSI50."
        : subtotal < SAMPLE_VOUCHER.minimum ? "Add at least ₱300 of food to use KUSI50." : "₱50 sample discount applied.";
      const voucherCode = code === SAMPLE_VOUCHER.code && subtotal >= SAMPLE_VOUCHER.minimum ? code : selected.voucherCode;
      return { ...current, checkouts: new Map(current.checkouts).set(currentUser.username, { ...selected, voucherCode, voucherMessage }) };
    });
  }

  function removeVoucher() {
    updateCheckout({ voucherCode: null, voucherMessage: "" });
  }

  function placeOrder() {
    if (!isCustomer(currentUser)) return;
    setCart((current) => {
      const selected = current.checkouts?.get(currentUser.username) ?? EMPTY_CHECKOUT;
      const delivery = selected.type === "delivery";
      const orderLines = getLines(menuItems, current.quantities, current.customizations);
      if (orderLines.length === 0) return current;
      const detailsError = delivery ? validateDelivery(selected.delivery) : !current.tableNumber.trim() && "Enter your table number.";
      if (detailsError) return { ...current, error: detailsError };
      if (orderLines.some(({ item }) => item.available === false)) {
        return { ...current, error: "Add available dishes to your tray before placing an order." };
      }

      const subtotal = mealTotal(orderLines);
      const orderDiscount = voucherDiscount(subtotal, selected.voucherCode);
      const fee = delivery ? SAMPLE_DELIVERY_FEE : 0;
      const order = {
        id: current.orders.length + 1,
        customerUsername: currentUser.username,
        type: selected.type,
        table: delivery ? null : current.tableNumber.trim(),
        delivery: delivery ? { ...selected.delivery, recipient: selected.delivery.recipient.trim(), street: selected.delivery.street.trim(), city: DELIVERY_CITY } : null,
        deliveryFee: fee, subtotal, discount: orderDiscount,
        voucherCode: orderDiscount > 0 ? selected.voucherCode : null,
        total: (Math.round(subtotal * 100) + fee * 100 - orderDiscount * 100) / 100,
        lines: orderLines, status: "Placed", paid: false,
        rider: null, cashRemitted: false, deliveryIssue: "",
      };
      const checkouts = new Map(current.checkouts).set(currentUser.username, { ...selected, voucherCode: null, voucherMessage: "" });
      return { ...current, quantities: {}, customizations: {}, checkouts, orders: [order, ...current.orders], error: "", notice: "" };
    });
  }

  function updateOrder(id, update) {
    setCart((current) => ({ ...current, orders: current.orders.map((order) => order.id === id ? update(order) : order) }));
  }

  function rateOrder(id, stars, comment = "") {
    const order = orders.find((entry) => entry.id === id);
    if (!order || !canRateOrder(order, currentUser)) return "Only your completed orders can be rated.";
    if (!Number.isInteger(stars) || stars < 1 || stars > 5) return "Choose a rating from 1 to 5 stars.";
    if (typeof comment !== "string" || comment.length > 300) return "Keep your review within 300 characters.";
    updateOrder(id, (entry) => canRateOrder(entry, currentUser)
      ? { ...entry, rating: { stars, comment: comment.trim() } } : entry);
    return null;
  }
  function recordCashPayment(id) {
    if (currentUser?.role !== "staff") return;
    updateOrder(id, (order) => order.type !== "delivery" && !order.paid ? { ...order, paid: true } : order);
  }

  function advanceOrder(id, expectedStatus) {
    updateOrder(id, (order) => {
      const next = getNextOrderStatus(currentUser?.role, order.status, order.type);
      return next && order.status === expectedStatus ? { ...order, status: next } : order;
    });
  }

  function reviewDelivery(id, accepted) {
    if (currentUser?.role !== "staff") return;
    updateOrder(id, (order) => order.type === "delivery" && order.status === "Placed"
      ? { ...order, status: accepted ? "Accepted" : "Cancelled", cancellationReason: accepted ? null : "Declined by restaurant" }
      : order);
  }

  function cancelDelivery(id) {
    if (!isCustomer(currentUser)) return;
    updateOrder(id, (order) => order.type === "delivery" && order.status === "Placed" && order.customerUsername === currentUser.username
      ? { ...order, status: "Cancelled", cancellationReason: "Cancelled by customer" } : order);
  }

  function assignRider(id, username) {
    if (currentUser?.role !== "staff" || !accounts.some((account) => account.username === username && account.role === "rider")) return;
    updateOrder(id, (order) => order.type === "delivery" && ["Accepted", "Preparing", "Ready"].includes(order.status)
      ? { ...order, rider: username } : order);
  }

  function startDelivery(id) {
    if (currentUser?.role !== "rider") return;
    updateOrder(id, (order) => order.type === "delivery" && order.rider === currentUser.username && order.status === "Ready"
      ? { ...order, status: "Out for delivery" } : order);
  }

  function completeDelivery(id, cashReceived) {
    if (currentUser?.role !== "rider" || cashReceived !== true) return;
    updateOrder(id, (order) => order.type === "delivery" && order.rider === currentUser.username && order.status === "Out for delivery"
      ? { ...order, status: "Delivered", paid: true } : order);
  }

  function reportDeliveryIssue(id, message) {
    if (currentUser?.role !== "rider" || !message.trim() || message.length > 200) return;
    updateOrder(id, (order) => order.type === "delivery" && order.rider === currentUser.username && order.status === "Out for delivery"
      ? { ...order, deliveryIssue: message.trim() } : order);
  }

  function recordRiderCash(id) {
    if (currentUser?.role !== "staff") return;
    updateOrder(id, (order) => order.type === "delivery" && order.status === "Delivered" && order.paid && !order.cashRemitted
      ? { ...order, cashRemitted: true } : order);
  }

  return (
    <CartContext.Provider value={{
      lines, count, total, orderTotal, deliveryFee, discount, tableNumber, orders, customerOrders, checkout, error, notice,
      addMeal, reorderOrder, applyVoucher, removeVoucher, rateOrder, popularIds: popularDishIds(orders),
      setTableNumber, setOrderType, setDeliveryDetails, changeQuantity, placeOrder, recordCashPayment, advanceOrder,
      reviewDelivery, cancelDelivery, assignRider, startDelivery, completeDelivery, reportDeliveryIssue, recordRiderCash,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}

