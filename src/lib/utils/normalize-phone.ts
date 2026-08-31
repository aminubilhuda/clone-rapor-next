/**
 * Normalizes Indonesian phone numbers to 62XXXXXXXXXX format.
 *
 * Handles:
 *  - +6285707357080  → 6285707357080
 *  - +62857-0735-7080 → 6285707357080
 *  - 0867-0735-7080   → 6286707357080
 *  - 085707357080     → 6285707357080
 *  - 6285707357080    → 6285707357080
 *  - empty / non-digit → ''
 */
export function normalizePhone(input: string | null | undefined): string {
  if (!input) return '';

  // Strip everything except digits
  const digits = input.replace(/\D/g, '');

  if (!digits) return '';

  // If starts with 62, keep as-is
  if (digits.startsWith('62')) return digits;

  // If starts with 0, replace leading 0 with 62
  if (digits.startsWith('0')) return '62' + digits.slice(1);

  // If starts with 8, prefix with 62
  if (digits.startsWith('8')) return '62' + digits;

  // Otherwise return as-is (edge case: user typed without prefix)
  return digits;
}
