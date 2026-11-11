export const DELIVERY_CITY = "Cagayan de Oro City";
export const SAMPLE_DELIVERY_FEE = 40;

// Barangay names follow the PSA PSGC listing for Cagayan de Oro.
export const CDO_BARANGAYS = [
  ...Array.from({ length: 40 }, (_, index) => "Barangay " + (index + 1)),
  "Agusan", "Baikingon", "Balubal", "Balulang", "Bayabas", "Bayanga",
  "Besigan", "Bonbon", "Bugo", "Bulua", "Camaman-an", "Canito-an",
  "Carmen", "Consolacion", "Cugman", "Dansolihon", "F. S. Catanico",
  "Gusa", "Indahag", "Iponan", "Kauswagan", "Lapasan", "Lumbia",
  "Macabalan", "Macasandig", "Mambuaya", "Nazareth", "Pagalungan",
  "Pagatpat", "Patag", "Pigsag-an", "Puerto", "Puntod", "San Simon",
  "Tablon", "Taglimao", "Tagpangi", "Tignapoloan", "Tuburan", "Tumpagon",
];

export const EMPTY_CHECKOUT = {
  type: "dine-in",
  delivery: { recipient: "", phone: "", street: "", barangay: "", notes: "" },
};

export function validateDelivery(details) {
  if (!details.recipient.trim() || details.recipient.length > 60) return "Enter the recipient’s name (up to 60 characters).";
  if (!/^(09\d{9}|\+639\d{9})$/.test(details.phone.replace(/[\s()-]/g, ""))) {
    return "Enter a Philippine mobile number, such as 09XXXXXXXXX.";
  }
  if (!details.street.trim() || details.street.length > 300) return "Enter a house number and street (up to 300 characters).";
  if (!CDO_BARANGAYS.includes(details.barangay)) return "Choose a barangay within Cagayan de Oro City.";
  if (details.notes.length > 300) return "Keep delivery instructions within 300 characters.";
  return null;
}

export function deliveryAddress(delivery) {
  return [delivery.street, delivery.barangay, delivery.city].filter(Boolean).join(", ");
}

export function isCustomer(account) {
  return Boolean(account) && (!account.role || account.role === "customer");
}
