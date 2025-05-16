import { prepareContractCall, Engine } from "thirdweb";
import { serverWallet } from "./ServerWallet";
import { rwaContract } from "./RWAcontract";
import { client } from "../client";

/**
 * Creates a new property NFT token in the RWA contract
 *
 * @param propertyAddress - The physical address of the property
 * @param price - The price in wei
 * @param squareMeters - The size in square meters
 * @param legalIdentifier - Legal identifier (deed number, etc)
 * @param documentHash - IPFS hash of legal documents
 * @param imageURI - IPFS URI pointing to the property image (not full metadata)
 * @returns The transaction hash if successful
 *
 * @note This function creates an unverified property. Verification requires a separate step
 * by an approved verifier calling the verifyProperty function.
 * @note All property data is stored on-chain for compliance. Only the image and document hash
 * references are stored off-chain as IPFS URIs.
 */
export const createNewProperty = async (
  propertyAddress: string,
  price: bigint,
  squareMeters: number,
  legalIdentifier: string,
  documentHash: string,
  imageURI: string
) => {
  // Log the exact values being sent to the contract
  console.log("CREATING PROPERTY WITH RAW VALUES:", {
    propertyAddress,
    price: {
      value: price.toString(),
      asBigInt: price,
      asHex: "0x" + price.toString(16),
      inEth: Number(price) / 1e18 + " ETH",
    },
    squareMeters,
    legalIdentifier,
    documentHash,
    imageURI,
  });

  try {
    const transaction = prepareContractCall({
      contract: rwaContract,
      method:
        "function createProperty(string, uint256, uint256, string, string, string)",
      params: [
        propertyAddress,
        price,
        BigInt(squareMeters),
        legalIdentifier,
        documentHash,
        imageURI,
      ],
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

/**
 * IMPORTANT: Properties created via createNewProperty are initially UNVERIFIED
 *
 * Per the RealEstateRWA contract, newly created properties have these attributes:
 * 1. The verifier field is set to address(0), meaning not verified
 * 2. Only approved verifiers can call verifyProperty() to verify a property
 * 3. Certain operations like purchasing require the property to be verified first
 *
 * The contract implements a separate verification step to ensure authenticity:
 * - Verification is done by a trusted authority (approved verifier)
 * - This provides an additional security check beyond the initial creation
 * - The UI should clearly indicate when a property is unverified
 */
