import { Image, Text, View } from "./Themed";
import React, { useState } from "react";
import { StyleSheet } from "react-native";

export default function ProfileAvatar({ name, uri, size = 56 }) {
  const [failedUri, setFailedUri] = useState(null);

  return (
    <View style={[styles.avatar, { width: size, height: size, borderRadius: size / 2 }]}>
      {uri && uri !== failedUri ? (
        <Image
          accessibilityLabel="Profile picture"
          source={{ uri }}
          style={styles.photo}
          onError={() => setFailedUri(uri)}
        />
      ) : (
        <Text style={[styles.initial, { fontSize: size * 0.375 }]}>{Array.from(name)[0]?.toUpperCase()}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: { overflow: "hidden", backgroundColor: "#F8ECE8", alignItems: "center", justifyContent: "center" },
  photo: { width: "100%", height: "100%" },
  initial: { color: "#6D0808", fontWeight: "800" },
});
