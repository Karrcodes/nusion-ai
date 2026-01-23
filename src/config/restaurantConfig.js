export const currentConfig = {
  restaurantName: "Ikoyi",
  currency: "£",
  defaultBudget: 50,
  theme: {
    // HSL values for easier manipulation
    primaryColor: "30, 80%, 50%", // Gold/Orange
    secondaryColor: "210, 20%, 20%", // Deep Slate
    glassColor: "255, 255, 255",
    glassOpacity: "0.05",
    backgroundColor: "10, 10%, 10%", // Very dark grey/black
    fontFamily: "'Inter', sans-serif"
  },
  // Toggle feature availability if we scale
  features: {
    narrative: true,
    images: false // MVP uses no images, just text/icons? Or we can add placeholders.
  }
};
