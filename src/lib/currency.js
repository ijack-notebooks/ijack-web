/**
 * Format price in Indian Rupee
 * @param {number} price - Price in INR
 * @returns {string} Formatted price with ₹ symbol
 */
export function formatPrice(price) {
  return `₹${price.toLocaleString("en-IN")}`;
}

/**
 * Format price with decimals (for calculations)
 * @param {number} price - Price in INR
 * @returns {string} Formatted price with ₹ symbol and 2 decimals
 */
export function formatPriceWithDecimals(price) {
  return `₹${price.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

