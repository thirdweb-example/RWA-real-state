import { rwaContract } from "./RWAcontract";
import { readContract } from "thirdweb";

export const getPendingPurchase = async (tokenId: number) => {
  console.log("Fetching pending purchase for token ID:", tokenId);

  try {
    // For read operations in thirdweb v5, we use the readContract function
    const pendingPurchase = await readContract({
      contract: rwaContract,
      method:
        "function pendingPurchases(uint256) returns (address, uint256, bool)",
      params: [BigInt(tokenId)],
    });

    return {
      buyer: pendingPurchase[0],
      amount: pendingPurchase[1],
      exists: pendingPurchase[2],
    };
  } catch (error: any) {
    console.error("Error fetching pending purchase:", error);
    throw error;
  }
};
