import { client } from "../client";
import { Engine } from "thirdweb";

// Create the server wallet
export const serverWallet = Engine.serverWallet({
  client,
  address: import.meta.env.VITE_SERVER_WALLET_ADDRESS,
  vaultAccessToken: import.meta.env.VITE_VAULT_ACCESS_TOKEN,
});


