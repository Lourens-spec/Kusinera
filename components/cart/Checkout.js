import { Feather, Pressable, Text, TextInput, View } from "../Themed";
import React from "react";
import styles from "./styles";
import { useMenuGlass } from "../../styles/menuGlass";

export function TableIdentification({ tableNumber, setTableNumber, hasTable }) {
  const glass = useMenuGlass();
  return (
    <View style={[styles.card, glass.surface]}>
      <View style={styles.row}>
        <View style={styles.iconLabel}>
          <Feather name="map-pin" size={16} color="#6D0808" />
          <Text style={styles.name}>Table number</Text>
        </View>
        <Text accessibilityLiveRegion="polite" style={hasTable ? styles.saved : styles.missing}>
          {hasTable ? "Entered" : "Required"}
        </Text>
      </View>
      <TextInput
        accessibilityLabel="Table number"
        placeholder="Enter your table number"
        placeholderTextColor="#625B5B"
        value={tableNumber}
        onChangeText={setTableNumber}
        autoCapitalize="characters"
        autoCorrect={false}
        style={styles.input}
      />
    </View>
  );
}

export function OrderPlacement({ total, subtotal, deliveryFee, discount, isDelivery, detailsMessage, hasItems, hasTable, hasUnavailableItems, placeOrder, placing }) {
  const glass = useMenuGlass();
  const canPlaceOrder = hasItems && hasTable && !hasUnavailableItems && !placing;

  return (
    <View style={[styles.card, glass.surface]}>
      {(isDelivery || discount > 0) && hasItems && (
        <>
          <View style={styles.row}><Text style={styles.description}>Subtotal</Text><Text style={styles.description}>₱{subtotal.toFixed(2)}</Text></View>
          {isDelivery && <View style={styles.row}><Text style={styles.description}>Sample delivery fee</Text><Text style={styles.description}>₱{deliveryFee.toFixed(2)}</Text></View>}
          {discount > 0 && <View style={styles.row}><Text style={styles.description}>Voucher discount</Text><Text style={styles.description}>−₱{discount.toFixed(2)}</Text></View>}
        </>
      )}
      <View style={styles.row}>
        <Text style={styles.name}>Total</Text>
        <Text accessibilityLiveRegion="polite" style={styles.total}>₱{total.toFixed(2)}</Text>
      </View>
      <Text style={styles.description}>{isDelivery ? "Cash on delivery · pay the rider on arrival" : "Pay cash at the counter"}</Text>
      {hasUnavailableItems && (
        <Text accessibilityRole="alert" style={styles.accent}>Remove sold-out dishes from your tray to continue.</Text>
      )}
      {(!hasItems || !hasTable) && (
        <Text style={styles.description}>
          {hasItems ? detailsMessage || "Enter your table number to place an order." : "Add a dish to place an order."}
        </Text>
      )}
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ disabled: !canPlaceOrder }}
        disabled={!canPlaceOrder}
        onPress={placeOrder}
        style={[styles.place, !canPlaceOrder && styles.disabledPlace]}
      >
        <Text style={[styles.placeLabel, !canPlaceOrder && styles.disabledLabel]}>{placing ? "Placing order…" : isDelivery ? "Place delivery order" : "Place order"}</Text>
      </Pressable>
    </View>
  );
}
