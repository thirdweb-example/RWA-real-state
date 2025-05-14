import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import { getContract, Engine, createThirdwebClient } from "thirdweb";
import { arbitrumSepolia } from "thirdweb/chains";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Initialize ThirdWeb client
const client = createThirdwebClient({
  clientId: process.env.THIRDWEB_CLIENT_ID || "default-client-id",
});

// Initialize server wallet
const serverWallet = Engine.serverWallet({
  client,
  address: process.env.SERVER_WALLET_ADDRESS,
  vaultAccessToken: process.env.VAULT_ACCESS_TOKEN,
});

// Initialize contract
const realEstateContract = getContract({
  client,
  address: process.env.RWA_DEPLOYED_CONTRACT_ADDRESS,
  chain: arbitrumSepolia,
});

// API endpoint to createa propperty
app.post("/api/properties", async (req, res) => {
  try {
    // Validate request body
    const {
      recipientAddress,
      propertyAddress,
      price,
      squareMeters,
      legalIdentifier,
      documentHash,
    } = req.body;

    // Prepare the transaction
    const transaction = realEstateContract.prepareContractCall({
      method: "createProperty",
      params: [
        recipientAddress,
        propertyAddress,
        price,
        squareMeters,
        legalIdentifier,
        documentHash,
      ],
    });

    // IMPORTANT: enqueue the transaction via ENGINE
    const { transactionId } = await serverWallet.enqueueTransaction({
      transaction,
    });

    // Get the tx hash
    const txHash = await Engine.waitForTransactionHash({
      client,
      transactionId,
    });

    // set the response json
    // IMPORTANT: set the transactionId and txHash in the response
    res.json({ transactionId, txHash });
  } catch (error) {
    console.error("Error creating property:", error);
    res.status(500).json({ error: "Failed to create property" });
  }
});

// API endpoint to verify a property
app.post("/api/properties/verify", async (req, res) => {
  try {
    const { tokenId } = req.body;

    // Prepare the transaction

    const transaction = realEstateContract.prepareContractCall({
      method: "verifyProperty",
      params: [tokenId],
    });

    // Enqueue the transaction via ENGINE
    const { transactionId } = await serverWallet.enqueueTransaction({
      transaction,
    });

    // Get the transaction hash
    const txHash = await Engine.waitForTransactionHash({
      client,
      transactionId,
    });

    res.json({ transactionId, txHash });
  } catch (error) {
    console.error("Error verifying property:", error);
    res.status(500).json({ error: "Failed to verify property" });
  }
});

// API endpoint to complete a purchase
app.post("/api/purchases/complete", async (req, res) => {
  try {
    const { tokenId, success, reason } = req.body;

    // Prepare the transaction
    const transaction = realEstateContract.prepareContractCall({
      method: "completePurchase",
      params: [tokenId, success, reason || ""],
    });

    // Enqueue the transaction via Engine
    const { transactionId } = await serverWallet.enqueueTransaction({
      transaction,
    });

    // Get the transaction hash
    const txHash = await Engine.waitForTransactionHash({
      client,
      transactionId,
    });

    res.json({ transactionId, txHash });
  } catch (error) {
    console.error("Error completing purchase:", error);
    res.status(500).json({ error: "Failed to complete purchase" });
  }
});

// Start the server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
