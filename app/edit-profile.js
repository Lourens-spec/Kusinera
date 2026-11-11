import React, { useState } from "react";
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
  const [error, setError] = useState("");

  const close = () => router.dismissTo(fromSettings === "1" ? "/settings" : "/profile");

  function save() {
    updateProfile({ displayName, photoUri });
    close();
  }

  async function choosePhoto() {
    setError("");
    try {
      const { canceled, assets } = await launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.6,
      });
      if (!canceled) setPhotoUri(assets[0].uri);
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
      onNameChange={setDisplayName}
      onChangePhoto={choosePhoto}
      onRemovePhoto={() => setPhotoUri(null)}
      onSave={save}
      onCancel={close}
    />
  );
}
