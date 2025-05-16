import { getContract } from "thirdweb";
import { client } from "../client";
import { arbitrumSepolia } from "thirdweb/chains";

// Log contract address to check if it's being loaded correctly
console.log(
  "RWA Contract Address:",
  import.meta.env.VITE_RWA_DEPLOYED_CONTRACT_ADDRESS ? "Defined" : "Undefined"
);

export const rwaContract = getContract({
  client,
  chain: arbitrumSepolia,
  address: import.meta.env.VITE_RWA_DEPLOYED_CONTRACT_ADDRESS,
});
