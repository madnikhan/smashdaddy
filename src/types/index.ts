// User and Authentication Types
export interface User {
  id: string;
  email: string;
  name?: string;
  image?: string;
  emailVerified?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Customer {
  id: string;
  userId: string;
  phone?: string;
  loyaltyPoints: number;
  createdAt: Date;
  updatedAt: Date;
  user: User;
  addresses: Address[];
  orders: Order[];
  reviews: Review[];
}

export interface Driver {
  id: string;
  userId: string;
  phone: string;
  vehicleInfo?: any;
  isAvailable: boolean;
  currentLocation?: any;
  rating: number;
  totalDeliveries: number;
  earnings: number;
  createdAt: Date;
  updatedAt: Date;
  user: User;
  deliveries: Order[];
}

export interface Restaurant {
  id: string;
  userId: string;
  name: string;
  description?: string;
  logo?: string;
  banner?: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  coordinates?: any;
  isActive: boolean;
  isApproved: boolean;
  rating: number;
  totalOrders: number;
  deliveryFee: number;
  minimumOrder: number;
  deliveryRadius: number;
  cuisineType: string[];
  openingHours?: any;
  createdAt: Date;
  updatedAt: Date;
  user: User;
  categories: Category[];
  orders: Order[];
  reviews: Review[];
}

export interface Admin {
  id: string;
  userId: string;
  role: string;
  createdAt: Date;
  updatedAt: Date;
  user: User;
}

// Menu and Restaurant Types
export interface Category {
  id: string;
  name: string;
  description?: string;
  image?: string;
  isActive: boolean;
  sortOrder: number;
  restaurantId: string;
  createdAt: Date;
  updatedAt: Date;
  restaurant: Restaurant;
  items: MenuItem[];
}

export interface MenuItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  image?: string;
  isAvailable: boolean;
  isVegetarian: boolean;
  isVegan: boolean;
  isGlutenFree: boolean;
  isSpicy: boolean;
  allergens: string[];
  calories?: number;
  preparationTime?: number;
  sortOrder: number;
  categoryId: string;
  restaurantId: string;
  createdAt: Date;
  updatedAt: Date;
  category: Category;
  restaurant: Restaurant;
  orderItems: OrderItem[];
  customizations: MenuItemCustomization[];
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
}

// Order and Delivery Types
export type OrderStatus = 
  | "PENDING"
  | "CONFIRMED"
  | "PREPARING"
  | "READY_FOR_PICKUP"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED"
  | "CANCELLED"
  | "REFUNDED";

export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  restaurantId: string;
  driverId?: string;
  status: OrderStatus;
  subtotal: number;
  tax: number;
  deliveryFee: number;
  tip: number;
  total: number;
  estimatedDelivery?: Date;
  actualDelivery?: Date;
  specialInstructions?: string;
  isDelivery: boolean;
  createdAt: Date;
  updatedAt: Date;
  customer: Customer;
  restaurant: Restaurant;
  driver?: Driver;
  items: OrderItem[];
  payment?: Payment;
  deliveryAddress: Address;
  deliveryAddressId: string;
}

export interface OrderItem {
  id: string;
  orderId: string;
  menuItemId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  specialInstructions?: string;
  customizations?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
  order: Order;
  menuItem: MenuItem;
}

export interface Address {
  id: string;
  customerId: string;
  label: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  coordinates?: any;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
  customer: Customer;
  orders: Order[];
}

// Payment Types
export type PaymentStatus = 
  | "PENDING"
  | "PROCESSING"
  | "COMPLETED"
  | "FAILED"
  | "REFUNDED"
  | "CANCELLED";

export type PaymentMethod = 
  | "CARD"
  | "CASH"
  | "DIGITAL_WALLET";

export interface Payment {
  id: string;
  orderId: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  method: PaymentMethod;
  stripePaymentIntentId?: string;
  stripeRefundId?: string;
  createdAt: Date;
  updatedAt: Date;
  order: Order;
}

// Review Types
export interface Review {
  id: string;
  customerId: string;
  restaurantId: string;
  orderId?: string;
  rating: number;
  comment?: string;
  isAnonymous: boolean;
  createdAt: Date;
  updatedAt: Date;
  customer: Customer;
  restaurant: Restaurant;
}

// Promotion Types
export type DiscountType = "PERCENTAGE" | "FIXED_AMOUNT";

export interface Promotion {
  id: string;
  code: string;
  name: string;
  description?: string;
  discountType: DiscountType;
  discountValue: number;
  minimumOrder?: number;
  maximumDiscount?: number;
  usageLimit?: number;
  usedCount: number;
  isActive: boolean;
  validFrom: Date;
  validUntil: Date;
  applicableRestaurants: string[];
  createdAt: Date;
  updatedAt: Date;
}

// Support Types
export type TicketStatus = "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";
export type TicketPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";
export type TicketCategory = 
  | "ORDER_ISSUE"
  | "PAYMENT_PROBLEM"
  | "DELIVERY_ISSUE"
  | "TECHNICAL_SUPPORT"
  | "GENERAL_INQUIRY"
  | "COMPLAINT"
  | "FEEDBACK";

export interface SupportTicket {
  id: string;
  customerId: string;
  subject: string;
  message: string;
  status: TicketStatus;
  priority: TicketPriority;
  category: TicketCategory;
  assignedTo?: string;
  createdAt: Date;
  updatedAt: Date;
  customer: Customer;
}

// Cart Types
export interface CartItem {
  id: string;
  menuItemId: string;
  menuItem: MenuItem;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  specialInstructions?: string;
  customizations?: Record<string, unknown>;
}

export interface Cart {
  id: string;
  items: CartItem[];
  total: number;
  itemCount: number;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Form Types
export interface LoginForm {
  email: string;
  password: string;
}

export interface RegisterForm {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: "customer" | "driver" | "restaurant";
}

export interface RestaurantForm {
  name: string;
  description?: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  cuisineType: string[];
  deliveryFee: number;
  minimumOrder: number;
  deliveryRadius: number;
}

export interface AddressForm {
  label: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isDefault: boolean;
}

// Component Props Types
export interface ButtonProps {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  className?: string;
}

export interface InputProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  type?: "text" | "email" | "password" | "number" | "tel";
  required?: boolean;
  disabled?: boolean;
  className?: string;
  minLength?: number;
  id?: string;
}

export interface CardProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  className?: string;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  contentClassName?: string;
}

// Navigation Types
export interface NavItem {
  label: string;
  href: string;
  icon?: React.ComponentType<{ className?: string }>;
  badge?: string | number;
  children?: NavItem[];
}

// Dashboard Types
export interface DashboardStats {
  totalOrders: number;
  totalRevenue: number;
  averageRating: number;
  totalCustomers: number;
  pendingOrders: number;
  completedOrders: number;
}

export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string;
    borderColor?: string;
  }[];
}

export interface CustomerDetails {
  name: string;
  email: string;
  phone: string;
  address?: string;
  city?: string;
  postcode?: string;
  specialInstructions?: string;
}

export type OrderType = 'delivery' | 'collection' | 'takeaway';

export interface SumUpPaymentRequest {
  amount: number;
  currency: string;
  orderNumber: string;
  customerEmail: string;
  customerName: string;
  description: string;
}

export interface SumUpPaymentResponse {
  success: boolean;
  transactionId?: string;
  checkoutId?: string;
  error?: string;
  checkoutUrl?: string;
  amount?: number;
  currency?: string;
  description?: string;
}

export interface SumUpTransaction {
  id: string;
  amount: number;
  currency: string;
  status: string;
  transaction_code: string;
  merchant_code: string;
  description: string;
  timestamp: string;
  payment_type: string;
} 