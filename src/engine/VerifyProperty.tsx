import { prepareContractCall, Engine, readContract } from "thirdweb";
import { verifierWallet } from "./VerifierWallet";
import { rwaContract } from "./RWAcontract";
import { client } from "../client";

export interface VerifyPropertyResult {
  success: boolean;
  transactionHash?: string;
  transactionId?: string;
  executionStatus?: any;
  error?: string;
}

/**
 * Calls the verifyProperty function on the RWA contract to verify a property
 * @param tokenId The ID of the property to verify
 * @returns Result object with success status and transaction hash or error
 */
export const verifyProperty = async (
  tokenId: number
): Promise<VerifyPropertyResult> => {
  try {
    console.log(`Verifying property with token ID: ${tokenId}`);
    console.log(`Using verifier wallet address: ${verifierWallet.address}`);
    console.log(`Contract Address: ${rwaContract.address}`);

    // Prepare the transaction to verify the property
    const transaction = prepareContractCall({
      contract: rwaContract,
      method: "function verifyProperty(uint256)",
      params: [BigInt(tokenId)],
    });

    console.log("Transaction prepared successfully");

    try {
      // Log details right before sending
      console.log(
        "Sending transaction with verifier account:",
        verifierWallet.address
      );

      // Submit the transaction using the verifier wallet
      const { transactionId } = await verifierWallet.enqueueTransaction({
        transaction,
      });

      console.log("Transaction enqueued with ID:", transactionId);

      // Get execution status of the transaction
      const executionResult = await Engine.getTransactionStatus({
        client,
        transactionId,
      });

      console.log("Transaction status details:", executionResult);

      // Get transaction hash
      const result = await Engine.waitForTransactionHash({
        client,
        transactionId,
      });

      console.log("Transaction completed with hash:", result.transactionHash);

      return {
        success: true,
        transactionHash: result.transactionHash,
        transactionId: transactionId,
        executionStatus: executionResult,
      };
    } catch (error: any) {
      console.error("Engine API Error:", error);
      // Log more detailed error information
      if (error.response) {
        console.error("Response status:", error.response.status);
        console.error("Response data:", error.response.data);
      }

      let errorMessage = "Failed to verify property";

      // Try to extract more detailed error information
      if (error.response?.data?.error?.details) {
        errorMessage = error.response.data.error.details;
      } else if (error.message) {
        errorMessage = error.message;
      }

      return {
        success: false,
        error: errorMessage,
      };
    }
  } catch (error: any) {
    console.error("Contract preparation error:", error);
    return {
      success: false,
      error: error.message || "Unknown error preparing transaction",
    };
  }
};

/**
 * Check if an address is an approved verifier
 * @param address The address to check
 * @returns True if the address is an approved verifier, false otherwise
 */
export const isApprovedVerifier = async (address: string): Promise<boolean> => {
  try {
    if (!address) {
      console.error("Invalid address: address is undefined or empty");
      return false;
    }

    console.log("Checking if address is approved verifier:", address);
    const result = await readContract({
      contract: rwaContract,
      method: "function approvedVerifiers(address) view returns (bool)",
      params: [address],
    });
    return Boolean(result);
  } catch (error) {
    console.error("Error checking verifier status:", error);
    return false;
  }
};

/**
 * Utility function to check if the current verifier wallet is an approved verifier
 * @returns True if the verifier wallet is approved, false otherwise
 */
export const isVerifierWalletApproved = async (): Promise<boolean> => {
  try {
    if (!verifierWallet || !verifierWallet.address) {
      console.error("Verifier wallet or address is undefined");
      return false;
    }

    return await isApprovedVerifier(verifierWallet.address);
  } catch (error) {
    console.error("Error checking verifier wallet status:", error);
    return false;
  }
};
