import { supabase } from "./supabase";
import { uploadJpeg } from "./photos";
import initialMenu from "../data/menuItems";

export function fromMenuRow(row) {
  return { ...row.dish, id: row.id, image: row.dish.image ?? initialMenu.find(item => item.id === row.id)?.image ?? null };
}

export async function storeMenuDish(dish, id, existing = false) {
  const bundled = initialMenu.find(item => item.id === id)?.image;
  let image = typeof dish.image === "number" || dish.image === bundled ? null : dish.image;
  if (image?.uri && !/^https?:/.test(image.uri)) {
    if (!image.base64) throw new Error("Choose the dish photo again before saving.");
    image = { uri: await uploadJpeg("menu-photos", id || "new", image.base64) };
  }
  const table = supabase.from("menu_dishes");
  const payload = { ...dish, image };
  const result = await (existing ? table.update({ dish: payload }).eq("id", id) : table.insert({ dish: payload })).select().single();
  if (result.error) throw result.error;
  return fromMenuRow(result.data);
}
