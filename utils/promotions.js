export const DEMO_PROMOTIONS = [{ id: "demo-kusi50", title: "A little comfort, for less", description: "₱50 off your food order.", code: "KUSI50", minimum: 300, discount: 50, active: true, starts_on: null, ends_on: null }];

export function manilaDate(now = new Date()) {
  return new Date(now.getTime() + 8 * 60 * 60 * 1000).toISOString().slice(0, 10);
}

export function isPromotionActive(promo, now = new Date()) {
  const start = promo.starts_on ? Date.parse(promo.starts_on + "T" + (promo.start_time || "00:00") + "+08:00") : -Infinity;
  const end = promo.ends_on ? (promo.end_time
    ? Date.parse(promo.ends_on + "T" + promo.end_time + "+08:00")
    : Date.parse(promo.ends_on + "T00:00:00+08:00") + 86400000) : Infinity;
  return promo.active && now.getTime() >= start && now.getTime() < end;
}

export function promotionSchedule(promo) {
  const time = value => {
    const [hour, minute] = value.split(":").map(Number);
    return (hour % 12 || 12) + ":" + String(minute).padStart(2, "0") + (hour >= 12 ? " PM" : " AM");
  };
  const start = promo.starts_on ? promo.starts_on + " " + time(promo.start_time || "00:00") : "Immediately";
  const end = promo.ends_on ? promo.ends_on + (promo.end_time ? " " + time(promo.end_time) : " (end of day)") : "No expiry";
  return start + " → " + end + " · Philippine time";
}

export function promotionDiscount(subtotal, code, promos) {
  const promo = promos.find(item => item.code === code && isPromotionActive(item));
  return promo && subtotal >= Number(promo.minimum) ? Math.min(Math.round(subtotal * 100), Math.round(Number(promo.discount) * 100)) / 100 : 0;
}

export function preparePromotion(draft) {
  const title = draft.title.trim();
  const description = draft.description.trim();
  const voucher = draft.kind === "Voucher";
  const code = voucher ? draft.code.trim().toUpperCase() : null;
  if (!title || title.length > 80) return { error: "Enter a title of up to 80 characters." };
  if (description.length > 500) return { error: "Keep the description within 500 characters." };
  if (voucher && !/^[A-Z0-9_-]{3,20}$/.test(code)) return { error: "Use 3–20 letters, numbers, hyphens or underscores for the code." };
  const validMoney = value => /^\d{1,7}(\.\d{1,2})?$/.test(String(value).trim());
  if (voucher && (!validMoney(draft.discount) || Number(draft.discount) <= 0 || !validMoney(draft.minimum))) return { error: "Enter a positive peso discount and a minimum order of zero or more, with up to two decimals." };
  for (const value of [draft.starts_on, draft.ends_on]) {
    if (value && (!/^\d{4}-\d{2}-\d{2}$/.test(value) || !Number.isFinite(Date.parse(value)) || new Date(value).toISOString().slice(0, 10) !== value)) return { error: "Use a real date in YYYY-MM-DD format." };
  }
  if (draft.starts_on && draft.ends_on && draft.ends_on < draft.starts_on) return { error: "The end date must be on or after the start date." };
  const startTime = draft.start_time || null;
  const endTime = draft.end_time || null;
  for (const value of [startTime, endTime]) {
    if (value && !/^([01]\d|2[0-3]):[0-5]\d$/.test(value)) return { error: "Use 24-hour time in HH:mm format, for example 08:00 or 20:00." };
  }
  if ((startTime && !draft.starts_on) || (endTime && !draft.ends_on)) return { error: "Choose the matching date when setting a start or end time." };
  if (draft.starts_on && draft.ends_on) {
    const start = Date.parse(draft.starts_on + "T" + (startTime || "00:00") + "+08:00");
    const end = endTime ? Date.parse(draft.ends_on + "T" + endTime + "+08:00") : Date.parse(draft.ends_on + "T00:00+08:00") + 86400000;
    if (end <= start) return { error: "The end date and time must be after the start." };
  }
  return { promo: { title, description, code, minimum: voucher ? Number(draft.minimum) : 0, discount: voucher ? Number(draft.discount) : 0, starts_on: draft.starts_on || null, ends_on: draft.ends_on || null, start_time: startTime, end_time: endTime, active: draft.active, one_per_account: voucher && draft.one_per_account === true } };
}
