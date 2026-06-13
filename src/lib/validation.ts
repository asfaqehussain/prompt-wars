/**
 * Input validation and sanitization utilities for API routes.
 * Enforces maximum lengths and strips potentially dangerous content
 * to harden against prompt injection and XSS vectors.
 */

/** Maximum allowed lengths for different input types. */
export const INPUT_LIMITS = {
  JOURNAL_TEXT: 5000,
  CHAT_MESSAGE: 2000,
  FORM_FIELD: 500,
  MAX_CHAT_HISTORY: 20,
  HOURS_PER_DAY_MIN: 1,
  HOURS_PER_DAY_MAX: 16,
} as const;

/**
 * Strips HTML tags from a string to prevent XSS in stored/displayed data.
 * Preserves markdown formatting (bold, italic) which is safe for rendering.
 */
export function stripHtmlTags(input: string): string {
  return input.replace(/<[^>]*>/g, "");
}

/**
 * Validates that a string input is non-empty and within the allowed length.
 * Returns a sanitized (trimmed, HTML-stripped) string or an error message.
 */
export function validateTextInput(
  input: unknown,
  fieldName: string,
  maxLength: number
): { valid: true; sanitized: string } | { valid: false; error: string } {
  if (typeof input !== "string" || input.trim().length === 0) {
    return { valid: false, error: `${fieldName} cannot be empty.` };
  }

  const trimmed = input.trim();

  if (trimmed.length > maxLength) {
    return {
      valid: false,
      error: `${fieldName} exceeds the maximum length of ${maxLength} characters.`,
    };
  }

  return { valid: true, sanitized: stripHtmlTags(trimmed) };
}

/**
 * Validates a numeric input is within the expected range.
 */
export function validateNumericRange(
  input: unknown,
  fieldName: string,
  min: number,
  max: number
): { valid: true; value: number } | { valid: false; error: string } {
  const num = Number(input);

  if (isNaN(num)) {
    return { valid: false, error: `${fieldName} must be a valid number.` };
  }

  if (num < min || num > max) {
    return {
      valid: false,
      error: `${fieldName} must be between ${min} and ${max}.`,
    };
  }

  return { valid: true, value: num };
}
