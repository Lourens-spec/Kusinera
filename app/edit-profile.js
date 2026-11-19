import React, { useRef, useState } from "react";
import { Redirect, useLocalSearchParams, useRouter } from "expo-router";
import { launchImageLibraryAsync } from "expo-image-picker";
import EditProfileForm from "../components/EditProfileForm";
import { useAuth } from "../context/AuthContext";

export default function EditProfileRoute() {
  const { currentUser, updateProfile } = useAuth();

  if (!currentUser) return <Redirect href="/profile" />;
  if (currentUser.role === "rider") return <Redirect href="/rider" />;
  if (currentUser.role !== "customer") return <Redirect href="/kitchen" />;

  return <ProfileEditor key={currentUser.username} account={currentUser} updateProfile={updateProfile} />;
}

function ProfileEditor({ account, updateProfile }) {
  const router = useRouter();
  const { fromSettings } = useLocalSearchParams();
  const [displayName, setDisplayName] = useState(account.displayName ?? "");
  const [photoUri, setPhotoUri] = useState(account.photoUri ?? null);
  const [photoBase64, setPhotoBase64] = useState(null);
  const [saving, setSaving] = useState(false);
  const savingRef = useRef(false);
  const [error, setError] = useState("");

  const close = () => router.dismissTo(fromSettings === "1" ? "/settings" : "/profile");

  async function save() {
    if (savingRef.current) return;
    savingRef.current = true;
    setSaving(true);
    setError("");
    try {
      await updateProfile({ displayName, photoUri, photoBase64 });
      close();
    } catch (failure) {
      setError(failure.message || "Couldn’t save your profile. Please try again.");
    } finally { savingRef.current = false; setSaving(false); }
  }

  async function choosePhoto() {
    setError("");
    try {
      const { canceled, assets } = await launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.6,
        base64: true,
      });
      if (!canceled && assets[0]) { setPhotoUri(assets[0].uri); setPhotoBase64(assets[0].base64); }
    } catch {
      setError("Couldn’t open that photo. Please try another image.");
    }
  }

  return (
    <EditProfileForm
      username={account.username}
      displayName={displayName}
      photoUri={photoUri}
      error={error}
      saving={saving}
      onNameChange={setDisplayName}
      onChangePhoto={choosePhoto}
      onRemovePhoto={() => { setPhotoUri(null); setPhotoBase64(null); }}
      onSave={save}
      onCancel={close}
    />
  );
}
