import { Text, View } from "./Themed";
import React from "react";
import sharedStyles from "../styles/sharedStyles";
import MealNotes from "./MealNotes";

export default function TicketDishes({ lines }) {
  return lines.map((line) => (
    <View key={line.key ?? line.item.id}>
      <View style={sharedStyles.ticketRow}>
        <Text style={sharedStyles.dishName}>{line.item.name}</Text>
        <Text style={sharedStyles.quantity}>×{line.quantity}</Text>
      </View>
      <MealNotes line={line} />
    </View>
  ));
}
