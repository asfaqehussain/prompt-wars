/**
 * Unit tests for input validation and sanitization utilities.
 * Covers: text validation, HTML stripping, numeric range validation.
 */
import {
  validateTextInput,
  validateNumericRange,
  stripHtmlTags,
  INPUT_LIMITS,
} from "@/lib/validation";

describe("stripHtmlTags", () => {
  it("should remove HTML tags from input", () => {
    expect(stripHtmlTags("<script>alert('xss')</script>")).toBe("alert('xss')");
  });

  it("should preserve plain text", () => {
    expect(stripHtmlTags("I feel stressed about JEE")).toBe(
      "I feel stressed about JEE"
    );
  });

  it("should handle nested tags", () => {
    expect(stripHtmlTags("<div><b>bold</b></div>")).toBe("bold");
  });

  it("should handle empty string", () => {
    expect(stripHtmlTags("")).toBe("");
  });
});

describe("validateTextInput", () => {
  it("should reject empty strings", () => {
    const result = validateTextInput("", "Journal", 5000);
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.error).toContain("cannot be empty");
    }
  });

  it("should reject whitespace-only strings", () => {
    const result = validateTextInput("   ", "Journal", 5000);
    expect(result.valid).toBe(false);
  });

  it("should reject non-string inputs", () => {
    const result = validateTextInput(123, "Journal", 5000);
    expect(result.valid).toBe(false);
  });

  it("should reject null inputs", () => {
    const result = validateTextInput(null, "Journal", 5000);
    expect(result.valid).toBe(false);
  });

  it("should accept valid text within limits", () => {
    const result = validateTextInput("I had a tough day studying", "Journal", 5000);
    expect(result.valid).toBe(true);
    if (result.valid) {
      expect(result.sanitized).toBe("I had a tough day studying");
    }
  });

  it("should reject text exceeding max length", () => {
    const longText = "a".repeat(5001);
    const result = validateTextInput(longText, "Journal", 5000);
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.error).toContain("exceeds the maximum length");
    }
  });

  it("should strip HTML tags from valid input", () => {
    const result = validateTextInput(
      '<img src="x" onerror="alert(1)">Hello',
      "Journal",
      5000
    );
    expect(result.valid).toBe(true);
    if (result.valid) {
      expect(result.sanitized).toBe("Hello");
    }
  });

  it("should trim whitespace from input", () => {
    const result = validateTextInput("  hello world  ", "Journal", 5000);
    expect(result.valid).toBe(true);
    if (result.valid) {
      expect(result.sanitized).toBe("hello world");
    }
  });
});

describe("validateNumericRange", () => {
  it("should accept a number within range", () => {
    const result = validateNumericRange(4, "Hours", 1, 16);
    expect(result.valid).toBe(true);
    if (result.valid) {
      expect(result.value).toBe(4);
    }
  });

  it("should accept boundary values", () => {
    expect(validateNumericRange(1, "Hours", 1, 16).valid).toBe(true);
    expect(validateNumericRange(16, "Hours", 1, 16).valid).toBe(true);
  });

  it("should reject values below minimum", () => {
    const result = validateNumericRange(0, "Hours", 1, 16);
    expect(result.valid).toBe(false);
  });

  it("should reject values above maximum", () => {
    const result = validateNumericRange(17, "Hours", 1, 16);
    expect(result.valid).toBe(false);
  });

  it("should reject non-numeric strings", () => {
    const result = validateNumericRange("abc", "Hours", 1, 16);
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.error).toContain("valid number");
    }
  });

  it("should accept numeric strings", () => {
    const result = validateNumericRange("8", "Hours", 1, 16);
    expect(result.valid).toBe(true);
    if (result.valid) {
      expect(result.value).toBe(8);
    }
  });
});

describe("INPUT_LIMITS constants", () => {
  it("should have expected limit values", () => {
    expect(INPUT_LIMITS.JOURNAL_TEXT).toBe(5000);
    expect(INPUT_LIMITS.CHAT_MESSAGE).toBe(2000);
    expect(INPUT_LIMITS.FORM_FIELD).toBe(500);
    expect(INPUT_LIMITS.MAX_CHAT_HISTORY).toBe(20);
    expect(INPUT_LIMITS.HOURS_PER_DAY_MIN).toBe(1);
    expect(INPUT_LIMITS.HOURS_PER_DAY_MAX).toBe(16);
  });
});
