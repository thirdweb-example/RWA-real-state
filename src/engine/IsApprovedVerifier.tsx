import { rwaContract } from "./RWAcontract";
import { readContract } from "thirdweb";

export const isApprovedVerifier = async (verifierAddress: string) => {
  console.log("Checking if address is an approved verifier:", verifierAddress);

  try {
    // For read operations in thirdweb v5, we use the readContract function
    const isVerifier = await readContract({
      contract: rwaContract,
      method: "function approvedVerifiers(address) returns (bool)",
      params: [verifierAddress],
    });

    return isVerifier;
  } catch (error: any) {
    console.error("Error checking verifier status:", error);
    throw error;
  }
};
