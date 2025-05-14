import { createThirdwebClient } from "thirdweb";

// In Vite, use import.meta.env instead of process.env
const clientId = import.meta.env.VITE_THIRDWEB_CLIENT_ID || "default-client-id";

export const client = createThirdwebClient({
  clientId: clientId,
});
