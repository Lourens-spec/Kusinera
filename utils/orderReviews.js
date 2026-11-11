export function canRateOrder(order, user) {
  return Boolean(user && (!user.role || user.role === "customer") && order.customerUsername === user.username && ["Served", "Delivered"].includes(order.status));
}

export function popularDishIds(orders) {
  const counts = new Map();
  for (const order of orders) {
    if (!["Served", "Delivered"].includes(order.status)) continue;
    for (const { item, quantity } of order.lines) counts.set(item.id, (counts.get(item.id) || 0) + quantity);
  }
  return [...counts].sort((a, b) => b[1] - a[1] || String(a[0]).localeCompare(String(b[0]))).slice(0, 3).map(([id]) => id);
}
