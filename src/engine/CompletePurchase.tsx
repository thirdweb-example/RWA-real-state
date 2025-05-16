import { prepareContractCall, Engine } from "thirdweb";
import { serverWallet } from "./ServerWallet";
import { rwaContract } from "./RWAcontract";
import { client } from "../client";

export const completePurchase = async (
  tokenId: number,
  success: boolean,
  reason: string = ""
) => {
  console.log("Preparing completePurchase transaction:", {
    tokenId,
    success,
    reason,
  });

  try {
    const transaction = prepareContractCall({
      contract: rwaContract,
      method: "function completePurchase(uint256,bool,string)",
      params: [BigInt(tokenId), success, reason],
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
