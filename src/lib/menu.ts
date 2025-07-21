export interface MenuItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  category: string;
  subcategory?: string;
  image?: string;
  isAvailable: boolean;
  isVegetarian?: boolean;
  isVegan?: boolean;
  isGlutenFree?: boolean;
  isSpicy?: boolean;
  allergens?: string[];
  calories?: number;
  preparationTime?: number; // in minutes
  customizations?: MenuItemCustomization[];
  mealDeal?: boolean;
  kidsMeal?: boolean;
}

export interface MenuItemCustomization {
  id: string;
  name: string;
  type: "single" | "multiple";
  required: boolean;
  options: CustomizationOption[];
  price?: number;
}

export interface CustomizationOption {
  id: string;
  name: string;
  price: number;
  available: boolean;
}

export interface MenuCategory {
  id: string;
  name: string;
  description?: string;
  image?: string;
  sortOrder: number;
  items: MenuItem[];
}

export const menuData: MenuCategory[] = [
  {
    id: "grilled-chicken",
    name: "🔥 GRILLED CHICKEN (Peri Style)",
    description: "All chicken is roasted, then flame-grilled with your choice of peri sauce.",
    sortOrder: 1,
    items: [
      {
        id: "quarter-chicken",
        name: "1/4 Grilled Chicken",
        price: 5.99,
        category: "grilled-chicken",
        isAvailable: true,
        preparationTime: 15,
        customizations: [
          {
            id: "peri-sauce",
            name: "Peri Sauce",
            type: "single",
            required: true,
            options: [
              { id: "lemon-herb", name: "Lemon & Herb", price: 0, available: true },
              { id: "mango-lime", name: "Mango & Lime", price: 0, available: true },
              { id: "mild", name: "Mild", price: 0, available: true },
              { id: "hot", name: "Hot", price: 0, available: true },
              { id: "extra-hot", name: "Extra Hot", price: 0, available: true },
            ]
          }
        ]
      },
      {
        id: "half-chicken",
        name: "1/2 Grilled Chicken",
        price: 8.99,
        category: "grilled-chicken",
        isAvailable: true,
        preparationTime: 15,
        customizations: [
          {
            id: "peri-sauce",
            name: "Peri Sauce",
            type: "single",
            required: true,
            options: [
              { id: "lemon-herb", name: "Lemon & Herb", price: 0, available: true },
              { id: "mango-lime", name: "Mango & Lime", price: 0, available: true },
              { id: "mild", name: "Mild", price: 0, available: true },
              { id: "hot", name: "Hot", price: 0, available: true },
              { id: "extra-hot", name: "Extra Hot", price: 0, available: true },
            ]
          }
        ]
      },
      {
        id: "full-chicken",
        name: "Full Grilled Chicken",
        price: 14.99,
        category: "grilled-chicken",
        isAvailable: true,
        preparationTime: 20,
        customizations: [
          {
            id: "peri-sauce",
            name: "Peri Sauce",
            type: "single",
            required: true,
            options: [
              { id: "lemon-herb", name: "Lemon & Herb", price: 0, available: true },
              { id: "mango-lime", name: "Mango & Lime", price: 0, available: true },
              { id: "mild", name: "Mild", price: 0, available: true },
              { id: "hot", name: "Hot", price: 0, available: true },
              { id: "extra-hot", name: "Extra Hot", price: 0, available: true },
            ]
          }
        ]
      },
      {
        id: "chicken-strips",
        name: "Chicken Strips (5 pcs)",
        price: 6.99,
        category: "grilled-chicken",
        isAvailable: true,
        preparationTime: 12,
        customizations: [
          {
            id: "peri-sauce",
            name: "Peri Sauce",
            type: "single",
            required: true,
            options: [
              { id: "lemon-herb", name: "Lemon & Herb", price: 0, available: true },
              { id: "mango-lime", name: "Mango & Lime", price: 0, available: true },
              { id: "mild", name: "Mild", price: 0, available: true },
              { id: "hot", name: "Hot", price: 0, available: true },
              { id: "extra-hot", name: "Extra Hot", price: 0, available: true },
            ]
          }
        ]
      },
      {
        id: "peri-wings-5",
        name: "Peri Chicken Wings (5 pcs)",
        price: 6.49,
        category: "grilled-chicken",
        isAvailable: true,
        preparationTime: 12,
        customizations: [
          {
            id: "peri-sauce",
            name: "Peri Sauce",
            type: "single",
            required: true,
            options: [
              { id: "lemon-herb", name: "Lemon & Herb", price: 0, available: true },
              { id: "mango-lime", name: "Mango & Lime", price: 0, available: true },
              { id: "mild", name: "Mild", price: 0, available: true },
              { id: "hot", name: "Hot", price: 0, available: true },
              { id: "extra-hot", name: "Extra Hot", price: 0, available: true },
            ]
          }
        ]
      },
      {
        id: "peri-wings-10",
        name: "Peri Chicken Wings (10 pcs)",
        price: 9.99,
        category: "grilled-chicken",
        isAvailable: true,
        preparationTime: 15,
        customizations: [
          {
            id: "peri-sauce",
            name: "Peri Sauce",
            type: "single",
            required: true,
            options: [
              { id: "lemon-herb", name: "Lemon & Herb", price: 0, available: true },
              { id: "mango-lime", name: "Mango & Lime", price: 0, available: true },
              { id: "mild", name: "Mild", price: 0, available: true },
              { id: "hot", name: "Hot", price: 0, available: true },
              { id: "extra-hot", name: "Extra Hot", price: 0, available: true },
            ]
          }
        ]
      },
    ]
  },
  {
    id: "burgers",
    name: "🍔 BURGERS",
    sortOrder: 2,
    items: [
      {
        id: "single-smash",
        name: "Single Smash Burger",
        description: "Served with smashed patties, STACK'D sauce, American cheese & pickles.",
        price: 6.99,
        category: "burgers",
        subcategory: "smash-beef",
        isAvailable: true,
        preparationTime: 10,
      },
      {
        id: "double-smash",
        name: "Double Smash Burger",
        description: "Served with smashed patties, STACK'D sauce, American cheese & pickles.",
        price: 8.49,
        category: "burgers",
        subcategory: "smash-beef",
        isAvailable: true,
        preparationTime: 12,
      },
      {
        id: "triple-smash",
        name: "Triple Smash Burger",
        description: "Served with smashed patties, STACK'D sauce, American cheese & pickles.",
        price: 9.99,
        category: "burgers",
        subcategory: "smash-beef",
        isAvailable: true,
        preparationTime: 15,
      },
      {
        id: "zinger-chicken",
        name: "Zinger Chicken Burger (Fried)",
        price: 6.99,
        category: "burgers",
        subcategory: "chicken",
        isAvailable: true,
        preparationTime: 10,
      },
      {
        id: "peri-chicken-burger",
        name: "Peri Grilled Chicken Burger",
        price: 7.49,
        category: "burgers",
        subcategory: "chicken",
        isAvailable: true,
        preparationTime: 12,
        customizations: [
          {
            id: "peri-sauce",
            name: "Peri Sauce",
            type: "single",
            required: true,
            options: [
              { id: "lemon-herb", name: "Lemon & Herb", price: 0, available: true },
              { id: "mango-lime", name: "Mango & Lime", price: 0, available: true },
              { id: "mild", name: "Mild", price: 0, available: true },
              { id: "hot", name: "Hot", price: 0, available: true },
              { id: "extra-hot", name: "Extra Hot", price: 0, available: true },
            ]
          }
        ]
      },
      {
        id: "meat-free-classic",
        name: "Meat-Free Classic Burger",
        price: 6.99,
        category: "burgers",
        subcategory: "vegan",
        isAvailable: true,
        isVegetarian: true,
        preparationTime: 10,
      },
      {
        id: "veggie-patty",
        name: "Veggie Patty Burger",
        price: 6.49,
        category: "burgers",
        subcategory: "vegan",
        isAvailable: true,
        isVegetarian: true,
        preparationTime: 10,
      },
    ]
  },
  {
    id: "wraps",
    name: "🌯 WRAPS",
    description: "Served with salad and house sauce in toasted tortilla.",
    sortOrder: 3,
    items: [
      {
        id: "grilled-chicken-wrap",
        name: "Grilled Chicken Wrap (Peri)",
        price: 6.49,
        category: "wraps",
        isAvailable: true,
        preparationTime: 8,
        customizations: [
          {
            id: "peri-sauce",
            name: "Peri Sauce",
            type: "single",
            required: true,
            options: [
              { id: "lemon-herb", name: "Lemon & Herb", price: 0, available: true },
              { id: "mango-lime", name: "Mango & Lime", price: 0, available: true },
              { id: "mild", name: "Mild", price: 0, available: true },
              { id: "hot", name: "Hot", price: 0, available: true },
              { id: "extra-hot", name: "Extra Hot", price: 0, available: true },
            ]
          }
        ]
      },
      {
        id: "lamb-kofta-wrap",
        name: "Lamb Kofta Wrap",
        price: 6.99,
        category: "wraps",
        isAvailable: true,
        preparationTime: 8,
      },
      {
        id: "beef-kofta-wrap",
        name: "Beef Kofta Wrap",
        price: 6.99,
        category: "wraps",
        isAvailable: true,
        preparationTime: 8,
      },
    ]
  },
  {
    id: "rice-boxes",
    name: "🍚 RICE BOXES",
    sortOrder: 4,
    items: [
      {
        id: "peri-chicken-rice",
        name: "Peri Chicken Rice Box",
        description: "Grilled chicken pieces over herbed rice, salad, and sauce of choice.",
        price: 7.99,
        category: "rice-boxes",
        isAvailable: true,
        preparationTime: 12,
        customizations: [
          {
            id: "peri-sauce",
            name: "Peri Sauce",
            type: "single",
            required: true,
            options: [
              { id: "lemon-herb", name: "Lemon & Herb", price: 0, available: true },
              { id: "mango-lime", name: "Mango & Lime", price: 0, available: true },
              { id: "mild", name: "Mild", price: 0, available: true },
              { id: "hot", name: "Hot", price: 0, available: true },
              { id: "extra-hot", name: "Extra Hot", price: 0, available: true },
            ]
          }
        ]
      },
    ]
  },
  {
    id: "kids-meals",
    name: "🧒 KIDS MEALS",
    description: "All kids meals include fries & juice drink.",
    sortOrder: 5,
    items: [
      {
        id: "kids-popcorn",
        name: "Kids Chicken Popcorn",
        price: 5.49,
        category: "kids-meals",
        isAvailable: true,
        kidsMeal: true,
        preparationTime: 8,
      },
      {
        id: "kids-cheeseburger",
        name: "Kids Cheeseburger",
        price: 5.49,
        category: "kids-meals",
        isAvailable: true,
        kidsMeal: true,
        preparationTime: 8,
      },
      {
        id: "kids-chicken-burger",
        name: "Kids Chicken Burger (Grilled/Fried)",
        price: 5.99,
        category: "kids-meals",
        isAvailable: true,
        kidsMeal: true,
        preparationTime: 8,
      },
    ]
  },
  {
    id: "sides",
    name: "🥤 SIDES & EXTRAS",
    sortOrder: 6,
    items: [
      {
        id: "regular-fries",
        name: "Regular Fries",
        price: 2.49,
        category: "sides",
        isAvailable: true,
        preparationTime: 5,
      },
      {
        id: "peri-fries",
        name: "Peri Salted Fries",
        price: 2.99,
        category: "sides",
        isAvailable: true,
        preparationTime: 5,
      },
      {
        id: "cheesy-fries",
        name: "Cheesy Loaded Fries",
        price: 4.49,
        category: "sides",
        isAvailable: true,
        preparationTime: 8,
      },
      {
        id: "coleslaw",
        name: "Coleslaw (Pot)",
        price: 1.49,
        category: "sides",
        isAvailable: true,
        preparationTime: 2,
      },
      {
        id: "garlic-mayo",
        name: "Garlic Mayo",
        price: 0.99,
        category: "sides",
        isAvailable: true,
        preparationTime: 1,
      },
      {
        id: "peri-dip",
        name: "Peri Dip",
        price: 0.99,
        category: "sides",
        isAvailable: true,
        preparationTime: 1,
      },
      {
        id: "bbq-sauce",
        name: "BBQ Sauce",
        price: 0.99,
        category: "sides",
        isAvailable: true,
        preparationTime: 1,
      },
    ]
  },
  {
    id: "drinks",
    name: "🧃 DRINKS",
    sortOrder: 7,
    items: [
      {
        id: "cans",
        name: "Cans (Coke, Fanta, 7Up)",
        price: 1.49,
        category: "drinks",
        isAvailable: true,
        preparationTime: 1,
      },
      {
        id: "bottles",
        name: "Bottles (1.5L)",
        price: 2.99,
        category: "drinks",
        isAvailable: true,
        preparationTime: 1,
      },
      {
        id: "juice-cartons",
        name: "Juice Cartons (Kids)",
        price: 0.99,
        category: "drinks",
        isAvailable: true,
        preparationTime: 1,
      },
    ]
  },
  {
    id: "meal-deals",
    name: "🥡 MEAL DEALS (Best Value)",
    sortOrder: 8,
    items: [
      {
        id: "smash-burger-meal",
        name: "Smash Burger Meal",
        description: "Any beef burger + Fries + Drink",
        price: 9.99,
        category: "meal-deals",
        isAvailable: true,
        mealDeal: true,
        preparationTime: 12,
      },
      {
        id: "chicken-burger-meal",
        name: "Chicken Burger Meal",
        description: "Fried or Peri Burger + Fries + Drink",
        price: 9.99,
        category: "meal-deals",
        isAvailable: true,
        mealDeal: true,
        preparationTime: 12,
      },
      {
        id: "wrap-meal",
        name: "Wrap Meal",
        description: "Any wrap + Fries + Drink",
        price: 9.49,
        category: "meal-deals",
        isAvailable: true,
        mealDeal: true,
        preparationTime: 10,
      },
      {
        id: "rice-box-meal",
        name: "Rice Box Meal",
        description: "Rice box + Drink + Pot of coleslaw",
        price: 9.99,
        category: "meal-deals",
        isAvailable: true,
        mealDeal: true,
        preparationTime: 15,
      },
      {
        id: "wings-combo-meal",
        name: "Wings Combo Meal",
        description: "5 Wings + Fries + Drink",
        price: 9.99,
        category: "meal-deals",
        isAvailable: true,
        mealDeal: true,
        preparationTime: 15,
      },
    ]
  },
];

// Helper functions
export function getMenuCategories(): MenuCategory[] {
  return menuData;
}

export function getMenuItemById(id: string): MenuItem | undefined {
  for (const category of menuData) {
    const item = category.items.find(item => item.id === id);
    if (item) return item;
  }
  return undefined;
}

export function getMenuItemsByCategory(categoryId: string): MenuItem[] {
  const category = menuData.find(cat => cat.id === categoryId);
  return category ? category.items : [];
}

export function getAllMenuItems(): MenuItem[] {
  return menuData.flatMap(category => category.items);
}

export function getAvailableMenuItems(): MenuItem[] {
  return getAllMenuItems().filter(item => item.isAvailable);
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
  }).format(price);
} 