// Ethereum price formatter utilities

// ETH price in USD - in a production app, this would be fetched from an API
const ETH_PRICE_USD = 2100; // Current ETH price estimate

/**
 * Formats wei to a human-readable ETH string
 * @param wei The price in wei (as bigint)
 * @param decimals Number of decimal places to display (default: 4)
 * @returns Formatted ETH string
 */
export function formatWeiToETH(wei: bigint, decimals: number = 4): string {
  // Check if wei is undefined, null, or zero
  if (wei === undefined || wei === null || wei === BigInt(0)) {
    return `0.${"0".repeat(decimals)} ETH`;
  }

  try {
    // Use string operations to safely convert from wei to ETH without precision loss
    const weiValue = typeof wei === "bigint" ? wei : BigInt(String(wei));
    const weiString = weiValue.toString();

    // Handle values less than 1e18 (1 ETH)
    if (weiString.length <= 18) {
      // Pad with leading zeros to ensure we have at least 18 digits
      const paddedWei = weiString.padStart(18, "0");
      return `0.${paddedWei.slice(0, decimals).padEnd(decimals, "0")} ETH`;
    }

    // Handle values 1 ETH or greater
    const etherPart = weiString.slice(0, weiString.length - 18);
    const weiPart = weiString.slice(weiString.length - 18).padStart(18, "0");
    const decimalPart = weiPart.slice(0, decimals);

    return `${etherPart}.${decimalPart} ETH`;
  } catch (e) {
    console.error("Error formatting ETH value:", e);
    return `0.${"0".repeat(decimals)} ETH`;
  }
}

/**
 * Formats wei to a human-readable USD string
 * @param wei The price in wei (as bigint)
 * @param decimals Number of decimal places to display (default: 2)
 * @returns Formatted USD string
 */
export function formatWeiToUSD(wei: bigint, decimals: number = 2): string {
  // Check if wei is undefined, null, or zero
  if (wei === undefined || wei === null || wei === BigInt(0)) {
    return `$0.${"0".repeat(decimals)}`;
  }

  try {
    // First convert to ETH using string operations to preserve precision
    const weiValue = typeof wei === "bigint" ? wei : BigInt(String(wei));
    const weiString = weiValue.toString();

    let ethValueStr: string;

    // Handle values less than 1e18 (1 ETH)
    if (weiString.length <= 18) {
      // Pad with leading zeros to ensure we have at least 18 digits
      const paddedWei = weiString.padStart(18, "0");
      ethValueStr = `0.${paddedWei}`;
    } else {
      // Handle values 1 ETH or greater
      const etherPart = weiString.slice(0, weiString.length - 18);
      const weiPart = weiString.slice(weiString.length - 18).padStart(18, "0");
      ethValueStr = `${etherPart}.${weiPart}`;
    }

    // Now safely convert to number for USD calculation
    // For very large values, we might still have precision issues,
    // but this is much better than the previous approach
    const ethValue = parseFloat(ethValueStr);
    const usdValue = ethValue * ETH_PRICE_USD;

    return `$${usdValue.toFixed(decimals)}`;
  } catch (e) {
    console.error("Error formatting USD value:", e);
    return `$0.${"0".repeat(decimals)}`;
  }
}

/**
 * Returns both ETH and USD formatted values, plus the raw wei value
 * @param wei The price in wei (as bigint)
 * @returns Object with both ETH and USD formatted strings and raw wei value
 */
export function formatPrice(wei: bigint): {
  eth: string;
  usd: string;
  raw: string;
} {
  return {
    eth: formatWeiToETH(wei),
    usd: formatWeiToUSD(wei),
    raw: wei.toString() + " wei",
  };
}
