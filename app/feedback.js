import React from "react";
import { useLocalSearchParams } from "expo-router";
import SupportPage, { FeedbackForm } from "../components/SupportPage";
export default function FeedbackRoute() {
  const { topic } = useLocalSearchParams();
  const ratingMode = topic === "rating";
  return <SupportPage title={ratingMode ? "Rate us" : "Send feedback"}><FeedbackForm key={ratingMode ? "rating" : "feedback"} ratingMode={ratingMode} /></SupportPage>;
}
