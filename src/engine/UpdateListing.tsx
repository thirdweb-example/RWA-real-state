import { prepareContractCall, Engine } from "thirdweb";
import { serverWallet } from "./ServerWallet";
import { rwaContract } from "./RWAcontract";
import { client } from "../client";

// Define PropertyState enum to match the contract
export const PropertyState = {
  INITIAL_OFFERING: 0,
  FOR_SALE: 1,
  PENDING_SALE: 2,
  SOLD: 3,
  NOT_FOR_SALE: 4,
} as const;

export type PropertyStateType =
  (typeof PropertyState)[keyof typeof PropertyState];

export const updatePropertyState = async (
  tokenId: number,
  newState: PropertyStateType,
  newPrice: bigint = BigInt(0)
) => {
  console.log("Preparing updatePropertyState transaction:", {
    tokenId,
    newState,
    newPrice: newPrice.toString(),
  });

  try {
    const transaction = prepareContractCall({
      contract: rwaContract,
      method: "function updatePropertyState(uint256,uint8,uint256)",
      params: [BigInt(tokenId), newState, newPrice],
    });

    console.log("Transaction prepared successfully");
    console.log(
      "Server Wallet Address (before transaction):",
      serverWallet.address
    );
    console.log("Contract Address:", rwaContract.address);

    try {
      // Log details right before sending
      console.log("Sending transaction with account:", serverWallet.address);
      const { transactionId } = await serverWallet.enqueueTransaction({
        transaction,
      });

      console.log("Transaction enqueued with ID:", transactionId);

      // Get execution status of the transaction
      const executionResult = await Engine.getTransactionStatus({
        client,
        transactionId,
      });

      console.log("Transaction status details:", executionResult);

      const txHash = await Engine.waitForTransactionHash({
        client,
        transactionId,
      });

      return txHash;
    } catch (error: any) {
      console.error("Engine API Error:", error);
      // Log more detailed error information
      if (error.response) {
        console.error("Response status:", error.response.status);
        console.error("Response data:", error.response.data);
      }
      throw error;
    }
  } catch (error: any) {
    console.error("Contract preparation error:", error);
    throw error;
  }
};
