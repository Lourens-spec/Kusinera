export const SAMPLE_EXTRA_RICE_PRICE = 25;

export function mealAddOns(item) {
  return item.menuGroup === "Mains"
    ? [{ id: "extra-rice", name: "Extra rice", price: SAMPLE_EXTRA_RICE_PRICE }]
    : [];
}

export function mealKey(id, addOnIds = [], notes = "") {
  return addOnIds.length || notes
    ? "meal:" + JSON.stringify([id, [...addOnIds].sort(), notes])
    : id;
}

export function lineUnitPrice(line) {
  return line.unitPrice ?? line.item.price;
}

export function mealTotal(lines) {
  return lines.reduce((sum, line) => sum + Math.round(lineUnitPrice(line) * 100) * line.quantity, 0) / 100;
}

export function matchesDish(item, query) {
  const text = [item.name, item.category, item.menuGroup, ...(item.ingredients ?? [])].join(" ").toLowerCase();
  return query.trim().toLowerCase().split(/\s+/).every((word) => text.includes(word));
}
