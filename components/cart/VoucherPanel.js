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
    ? "This voucher is no longer available or the food minimum has not been reached."
    : checkout.voucherMessage;

  return (
    <View style={[styles.card, glass.surface]}>
      <Text style={styles.name}>Voucher</Text>
      <Text style={styles.description}>Enter a code from Promos & vouchers. One voucher per order; delivery fees are excluded.</Text>
      <TextInput accessibilityLabel="Voucher code" value={code} onChangeText={setCode} placeholder="Enter voucher code" placeholderTextColor="#625B5B" autoCapitalize="characters" autoCorrect={false} maxLength={20} style={styles.input} />
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
