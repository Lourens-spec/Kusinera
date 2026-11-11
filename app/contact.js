import React from "react";
import SupportPage, { SupportText } from "../components/SupportPage";
import { restaurantContact } from "../data/restaurantContact";

export default function ContactRoute() {
  return <SupportPage title="Contact us">
    <SupportText heading="Phone number">{restaurantContact.phone || "Not set yet"}</SupportText>
    <SupportText heading="Opening hours">{restaurantContact.hours || "Not set yet"}</SupportText>
    <SupportText heading="Email">{restaurantContact.email || "Not set yet"}</SupportText>
    <SupportText heading="Delivery area">Cagayan de Oro City only. Choose your barangay in Tray when placing a delivery order.</SupportText>
  </SupportPage>;
}
