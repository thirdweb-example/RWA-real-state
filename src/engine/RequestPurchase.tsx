import { prepareContractCall, Engine } from "thirdweb";
import { serverWallet } from "./ServerWallet";
import { rwaContract } from "./RWAcontract";
import { client } from "../client";

export const requestPurchase = async (tokenId: number, value: bigint) => {
  console.log("Preparing requestPurchase transaction:", {
    tokenId,
    value: value.toString(),
  });

  try {
    const transaction = prepareContractCall({
      contract: rwaContract,
      method: "function requestPurchase(uint256)",
      params: [BigInt(tokenId)],
      value,
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
