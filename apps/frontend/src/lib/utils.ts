export function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(' ');
}

/**
 * Formats a number or numeric string to Malaysian Ringgit (RM) format.
 * Includes thousands separators and 2 decimal places.
 * Example: 1234.5 -> "RM 1,234.50"
 *
 * @param value - The numeric value to format
 * @returns The formatted money string
 */
export function fmtMoney(value: string | number): string {
  return `RM ${Number(value).toLocaleString('en-MY', { minimumFractionDigits: 2 })}`;
}

/**
 * Formats a date string, timestamp, or Date object into a localized date string.
 * Currently uses 'zh-CN' locale representation (e.g. YYYY/MM/DD).
 *
 * @param value - The date to format
 * @returns The formatted date string
 */
export function fmtDate(value: string | number | Date): string {
  if (!value) return '';
  return new Date(value).toLocaleDateString('zh-CN');
}

/**
 * Capitalizes the first letter of a string.
 * Example: "pending" -> "Pending"
 *
 * @param str - The string to capitalize
 * @returns The capitalized string
 */
export function capitalize(str: string): string {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/**
 * Suspends execution for the specified number of milliseconds.
 * Useful for mocking API delays or debouncing actions.
 *
 * @param ms - The number of milliseconds to sleep
 * @returns A promise that resolves after the specified time
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
