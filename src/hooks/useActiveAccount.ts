import { useEffect, useState } from "react";
import { serverWallet } from "../engine/ServerWallet";

interface UseActiveAccountResult {
  address: string | null;
  isLoading: boolean;
  error: Error | null;
}

/**
 * Custom hook to get the currently active wallet account
 * For simplicity, we're using the serverWallet address as the active account
 * In a real application, you would use a wallet connection provider
 */
export const useActiveAccount = (): UseActiveAccountResult => {
  const [address, setAddress] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const getAddress = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // In a real application, you would get the user's connected wallet
        // For this demo, we'll use the serverWallet address
        const walletAddress = serverWallet.address;

        setAddress(walletAddress);
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error("Failed to get wallet address")
        );
      } finally {
        setIsLoading(false);
      }
    };

    getAddress();
  }, []);

  return { address, isLoading, error };
};
