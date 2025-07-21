import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: (string | undefined | null | false)[]): string {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
  }).format(price);
}

export function formatDate(date: Date | string) {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(date));
}

export function formatDateTime(date: Date | string) {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

export function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `STACKD-${timestamp}-${random}`;
}

export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
) {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in kilometers
  return distance;
}

export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export function throttle<T extends (...args: unknown[]) => unknown>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validatePhone(phone: string): boolean {
  // UK phone number validation (basic)
  const phoneRegex = /^(\+44|0)[1-9]\d{1,4}\s?\d{3,4}\s?\d{3,4}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
}

export function validatePostcode(postcode: string): boolean {
  // UK postcode validation (basic)
  const postcodeRegex = /^[A-Z]{1,2}\d[A-Z\d]?\s?\d[A-Z]{2}$/i;
  return postcodeRegex.test(postcode);
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
}

export function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function getRatingColor(rating: number): string {
  if (rating >= 4.5) return "text-success";
  if (rating >= 4.0) return "text-warning";
  if (rating >= 3.0) return "text-secondary";
  return "text-error";
}

export function getOrderStatusColor(status: string): string {
  switch (status) {
    case "PENDING":
      return "text-warning";
    case "CONFIRMED":
    case "PREPARING":
      return "text-info";
    case "READY_FOR_PICKUP":
    case "OUT_FOR_DELIVERY":
      return "text-secondary";
    case "DELIVERED":
      return "text-success";
    case "CANCELLED":
    case "REFUNDED":
      return "text-error";
    default:
      return "text-text-secondary";
  }
}

export function getOrderStatusBadge(status: string): string {
  switch (status) {
    case "PENDING":
      return "badge-warning";
    case "CONFIRMED":
    case "PREPARING":
      return "badge-info";
    case "READY_FOR_PICKUP":
    case "OUT_FOR_DELIVERY":
      return "badge-secondary";
    case "DELIVERED":
      return "badge-success";
    case "CANCELLED":
    case "REFUNDED":
      return "badge-error";
    default:
      return "badge-secondary";
  }
} 