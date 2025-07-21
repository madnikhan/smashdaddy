export const config = {
  business: {
    name: "SmashDaddy",
    description: "Premium smashed burgers, grilled chicken, and wings in Daventry",
    address: "St John's Square, Daventry NN11 4HY",
    phone: "+44 (0) 1327 123 4567",
    email: "hello@smashdaddy-daventry.co.uk",
    website: "https://smashdaddy-daventry.co.uk",
    currency: "GBP",
    country: "GB",
    locale: "en-GB",
  },
  
  payment: {
    // SumUp Configuration
    sumup: {
      apiKey: process.env.SUMUP_API_KEY,
      merchantCode: process.env.SUMUP_MERCHANT_CODE,
      accessToken: process.env.SUMUP_ACCESS_TOKEN,
      environment: process.env.SUMUP_ENVIRONMENT || "sandbox",
      baseUrl: process.env.SUMUP_ENVIRONMENT === "production" 
        ? "https://api.sumup.com" 
        : "https://api.sumup.com",
    },
    
    // Stripe Configuration (for online payments)
    stripe: {
      publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
      secretKey: process.env.STRIPE_SECRET_KEY,
      webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
    },
    
    // Payment Methods
    methods: {
      delivery: ["card"], // Card only for delivery
      collection: ["card", "cash"], // Card and cash for collection
      takeaway: ["card", "cash"], // Card and cash for takeaway
    },
  },
  
  delivery: {
    enabled: true,
    radius: 5, // miles
    baseFee: 2.50, // £2.50 base delivery fee
    freeDeliveryThreshold: 15.00, // Free delivery over £15
    estimatedTime: "20-30 minutes",
  },
  
  collection: {
    enabled: true,
    estimatedTime: "10-15 minutes",
    address: "St John's Square, Daventry NN11 4HY",
  },
  
  takeaway: {
    enabled: true,
    address: "St John's Square, Daventry NN11 4HY",
  },
  
  menu: {
    categories: [
      "Smashed Burgers",
      "Grilled Chicken",
      "Wings",
      "Sides",
      "Drinks",
      "Desserts",
    ],
  },
  
  openingHours: {
    monday: { open: "11:00", close: "22:00" },
    tuesday: { open: "11:00", close: "22:00" },
    wednesday: { open: "11:00", close: "22:00" },
    thursday: { open: "11:00", close: "22:00" },
    friday: { open: "11:00", close: "23:00" },
    saturday: { open: "11:00", close: "23:00" },
    sunday: { open: "12:00", close: "21:00" },
  },
  
  features: {
    onlineOrdering: true,
    delivery: true,
    collection: true,
    takeaway: true,
    realTimeTracking: true,
    loyaltyProgram: true,
    reviews: true,
  },
};

export type Config = typeof config; 