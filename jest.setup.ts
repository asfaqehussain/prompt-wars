import "@testing-library/jest-dom";

try {
  if (typeof Element !== "undefined" && Element.prototype && typeof Element.prototype.scrollIntoView === "undefined") {
    Element.prototype.scrollIntoView = () => {};
  }
} catch {
  // Not running in a DOM environment (e.g., Node API tests)
}
