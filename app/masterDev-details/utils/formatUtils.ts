// Utility functions for formatting data

// Format a value or return "N/A" if it's null, undefined, or empty
export function formatValue(value: any): string {
  if (value === null || value === undefined || value === '') {
    return 'N/A';
  }

  return String(value);
}

// Format a number with comma separators
export function formatNumber(value: number | undefined | null): string {
  if (value === null || value === undefined) {
    return 'N/A';
  }

  return value.toLocaleString();
}

// Format area values with sq ft suffix
export function formatArea(value: number | undefined | null): string {
  if (value === null || value === undefined) {
    return 'N/A';
  }

  return `${value.toLocaleString()} sq ft`;
}

// Format floors
export function formatFloors(value: number | undefined | null): string {
  if (value === null || value === undefined) {
    return 'N/A';
  }

  return `${value} ${value === 1 ? 'floor' : 'floors'}`;
}

// Get property value safely
export function getPropertyValue<T, K extends keyof T>(obj: T | null | undefined, key: K): T[K] | undefined {
  if (!obj) return undefined;
  return obj[key];
}