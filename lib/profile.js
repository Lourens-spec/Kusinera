import { supabase } from "./supabase";
import { uploadJpeg } from "./photos";

export async function saveAccountProfile(id, { displayName, photoUri, photoBase64 }) {
  let uri = photoUri || null;
  if (uri && !/^https?:/.test(uri)) {
    if (!photoBase64) throw new Error("Please choose your profile photo again before saving.");
    uri = await uploadJpeg("profile-photos", id, photoBase64);
  }
  const { data, error } = await supabase.from("profiles")
    .update({ display_name: displayName, photo_uri: uri }).eq("id", id)
    .select("display_name, photo_uri").single();
  if (error) throw error;
  return { displayName: data.display_name, photoUri: data.photo_uri };
}
