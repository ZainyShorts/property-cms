import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
export function formatDate(dateString: string | undefined) {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

export function formatCurrency(value: number | string | undefined) {
  if (!value) return "N/A";
  const numValue = typeof value === "string" ? Number.parseFloat(value) : value;
  return new Intl.NumberFormat("en-AE", { style: "currency", currency: "AED" }).format(numValue);
}