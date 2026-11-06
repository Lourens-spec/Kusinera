import React, { createContext, useContext, useState } from "react";
import menuItems from "../data/menuItems";

const CartContext = createContext(null);

export const orderStatuses = ["Placed", "Preparing", "Ready", "Served"];

function getLines(quantities) {
  return menuItems
    .filter((item) => quantities[item.id] > 0)
    .map((item) => ({ item, quantity: quantities[item.id] }));
}

function getTotal(lines) {
  return lines.reduce((sum, { item, quantity }) => sum + item.price * quantity, 0);
}

export function CartProvider({ children }) {
  const [cart, setCart] = useState({ quantities: {}, tableNumber: "", orders: [] });
  const { quantities, tableNumber, orders } = cart;
  const lines = getLines(quantities);
  const count = lines.reduce((sum, { quantity }) => sum + quantity, 0);
  const total = getTotal(lines);

  function setTableNumber(value) {
    setCart((current) => ({ ...current, tableNumber: value }));
  }

  function changeQuantity(id, amount) {
    setCart((current) => {
      const next = { ...current.quantities };
      const quantity = (next[id] ?? 0) + amount;
      if (quantity > 0) {
        next[id] = quantity;
      } else {
        delete next[id];
      }
      return { ...current, quantities: next };
    });
  }

  function placeOrder() {
    setCart((current) => {
      const table = current.tableNumber.trim();
      const orderLines = getLines(current.quantities);
      if (!table || orderLines.length === 0) {
        return current;
      }

      const order = {
        id: current.orders.length + 1,
        table,
        status: orderStatuses[0],
        paid: false,
        lines: orderLines,
        total: getTotal(orderLines),
      };
      return { ...current, quantities: {}, orders: [order, ...current.orders] };
    });
  }

  function recordCashPayment(id) {
    setCart((current) => ({
      ...current,
      orders: current.orders.map((order) =>
        order.id === id && !order.paid ? { ...order, paid: true } : order
      ),
    }));
  }

  function advanceOrder(id, expectedStatus) {
    const nextStatus = orderStatuses[orderStatuses.indexOf(expectedStatus) + 1];
    if (!orderStatuses.includes(expectedStatus) || !nextStatus) {
      return;
    }

    setCart((current) => ({
      ...current,
      orders: current.orders.map((order) =>
        order.id === id && order.status === expectedStatus ? { ...order, status: nextStatus } : order
      ),
    }));
  }

  return (
    <CartContext.Provider value={{
      lines, count, total, changeQuantity, tableNumber, setTableNumber, orders, placeOrder, advanceOrder, recordCashPayment,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
