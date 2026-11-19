import { supabase } from "./supabase";

export async function uploadJpeg(bucket, folder, base64) {
  const bytes = Uint8Array.from(atob(base64), char => char.charCodeAt(0));
  const path = folder + "/" + Date.now() + "-" + Math.random().toString(36).slice(2) + ".jpg";
  const storage = supabase.storage.from(bucket);
  const { error } = await storage.upload(path, bytes.buffer, { contentType: "image/jpeg" });
  if (error) throw error;
  return storage.getPublicUrl(path).data.publicUrl;
}
