import { Pressable, Text, TextInput, View } from "../Themed";
import React, { useState } from "react";
import { useCart } from "../../context/CartContext";
import AuthButton from "../authButton";
import styles from "./styles";
import { useMenuGlass } from "../../styles/menuGlass";

export default function VoucherPanel() {
  const glass = useMenuGlass();
  const { checkout, discount, applyVoucher, removeVoucher } = useCart();
  const [code, setCode] = useState(checkout.voucherCode ?? "");
  const message = checkout.voucherCode && discount === 0
    ? "KUSI50 needs at least ₱300 of food. The discount is currently unavailable."
    : checkout.voucherMessage;

  return (
    <View style={[styles.card, glass.surface]}>
      <Text style={styles.name}>Sample voucher</Text>
      <Text style={styles.description}>KUSI50 · ₱50 off food with a minimum food subtotal of ₱300.</Text>
      <TextInput accessibilityLabel="Voucher code" value={code} onChangeText={setCode} placeholder="Enter KUSI50" placeholderTextColor="#625B5B" autoCapitalize="characters" autoCorrect={false} maxLength={20} style={styles.input} />
      <AuthButton title="Apply voucher" onPress={() => applyVoucher(code)} />
      {checkout.voucherCode && (
        <Pressable accessibilityRole="button" onPress={() => { removeVoucher(); setCode(""); }} style={styles.voucherRemove}>
          <Text style={styles.accent}>Remove {checkout.voucherCode}</Text>
        </Pressable>
      )}
      {message ? <Text accessibilityLiveRegion="polite" style={styles.description}>{message}</Text> : null}
    </View>
  );
}
