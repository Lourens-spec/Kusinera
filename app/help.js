import React from "react";
import SupportPage, { SupportText } from "../components/SupportPage";
import { SAMPLE_DELIVERY_FEE } from "../utils/delivery";

const faqs = [
  ["Where do you deliver?", "Delivery is available within Cagayan de Oro City only. Enter your recipient, mobile number, street and barangay in Tray. No table number is needed for delivery."],
  ["How can I pay?", "Dine-in orders use cash payment recorded by staff. Delivery orders use cash on delivery, collected by the rider. Online payments are not available."],
  ["Can I cancel my order?", "You can cancel a delivery order in Orders while it is still awaiting restaurant acceptance. After acceptance, contact the restaurant. For dine-in changes or cancellations, speak to staff."],
  ["How much is delivery?", `The current prototype uses a sample delivery fee of ₱${SAMPLE_DELIVERY_FEE}. Review the final total in Tray before placing your order.`],
  ["Where can I check my order?", "Open Orders in the bottom navigation to see your order status. Delivery orders also show rider details after a rider is assigned."],
];
export default function HelpRoute() {
  return <SupportPage title="Help & FAQs">{faqs.map(([question, answer]) => <SupportText key={question} heading={question}>{answer}</SupportText>)}</SupportPage>;
}
