import React, { useState } from "react";
import { verifyProperty, isApprovedVerifier } from "../engine/VerifyProperty";
import { useActiveAccount } from "../hooks/useActiveAccount";

interface VerifyPropertyButtonProps {
  tokenId: number;
  isVerified: boolean;
  onVerificationComplete?: () => void;
}

export const VerifyPropertyButton: React.FC<VerifyPropertyButtonProps> = ({
  tokenId,
  isVerified,
  onVerificationComplete,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isVerifier, setIsVerifier] = useState<boolean | null>(null);
  const { address } = useActiveAccount();

  // Check if the current user is an approved verifier
  React.useEffect(() => {
    const checkVerifierStatus = async () => {
      if (address) {
        const verifierStatus = await isApprovedVerifier(address);
        setIsVerifier(verifierStatus);
      } else {
        setIsVerifier(false);
      }
    };

    checkVerifierStatus();
  }, [address]);

  const handleVerify = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await verifyProperty(tokenId);

      if (result.success) {
        // Notify parent component of successful verification
        if (onVerificationComplete) {
          onVerificationComplete();
        }
      } else {
        setError(result.error || "Verification failed");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred while verifying the property");
    } finally {
      setIsLoading(false);
    }
  };

  // Don't render anything if the property is already verified
  if (isVerified) {
    return (
      <div className="verified-badge bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
        Verified
      </div>
    );
  }

  // Don't render the button if the user is not an approved verifier
  if (isVerifier === false) {
    return null;
  }

  return (
    <div>
      <button
        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors duration-200 disabled:bg-gray-400"
        onClick={handleVerify}
        disabled={isLoading || !address || isVerifier !== true}
      >
        {isLoading ? "Verifying..." : "Verify Property"}
      </button>

      {error && <div className="text-red-500 mt-2 text-sm">{error}</div>}
    </div>
  );
};
