import { useState, useEffect } from "react";
import {
  verifyProperty,
  isVerifierWalletApproved,
} from "../engine/VerifyProperty";
import { verifierWallet } from "../engine/VerifierWallet";
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Divider,
  Alert,
  AlertTitle,
  Stack,
  InputAdornment,
  CircularProgress,
  Tooltip,
  Chip,
} from "@mui/material";
import VerifiedIcon from "@mui/icons-material/Verified";
import InfoIcon from "@mui/icons-material/Info";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";

export function VerifyPropertyForm() {
  const [tokenId, setTokenId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [txHash, setTxHash] = useState("");
  const [transactionId, setTransactionId] = useState("");
  const [error, setError] = useState("");
  const [isVerifierApproved, setIsVerifierApproved] = useState<boolean | null>(
    null
  );
  const [isCheckingVerifier, setIsCheckingVerifier] = useState(true);

  // Check if the verifier wallet is approved when component mounts
  useEffect(() => {
    const checkVerifier = async () => {
      setIsCheckingVerifier(true);
      try {
        const approved = await isVerifierWalletApproved();
        setIsVerifierApproved(approved);
      } catch (err) {
        console.error("Error checking verifier status:", err);
        setIsVerifierApproved(false);
      } finally {
        setIsCheckingVerifier(false);
      }
    };

    checkVerifier();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");
    setTxHash("");
    setTransactionId("");

    try {
      // Convert tokenId to number
      const tokenIdNumber = parseInt(tokenId);

      if (isNaN(tokenIdNumber)) {
        throw new Error("Token ID must be a valid number");
      }

      // Verify the property
      const result = await verifyProperty(tokenIdNumber);

      if (!result.success) {
        throw new Error(result.error || "Verification failed");
      }

      setTxHash(result.transactionHash || "");
      setTransactionId(result.transactionId || "");
    } catch (err) {
      console.error("Error verifying property:", err);
      setError(
        err instanceof Error ? err.message : "Failed to verify property"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
      <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
        <VerifiedIcon sx={{ fontSize: 30, mr: 2, color: "primary.main" }} />
        <Typography variant="h5" component="h2" gutterBottom>
          Verify Property
        </Typography>
      </Box>

      <Divider sx={{ mb: 4 }} />

      {/* Verifier Wallet Status */}
      <Box sx={{ mb: 3 }}>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
          <AccountBalanceWalletIcon color="action" />
          <Typography variant="subtitle1">Verifier Wallet</Typography>
        </Stack>

        {verifierWallet.address ? (
          <Typography variant="body2" sx={{ fontFamily: "monospace", mb: 1 }}>
            {verifierWallet.address}
          </Typography>
        ) : (
          <Alert severity="error" sx={{ mt: 1, mb: 2 }}>
            <AlertTitle>Missing Verifier Address</AlertTitle>
            The VITE_VERIFIER_WALLET_ADDRESS environment variable is not set.
            Please check your .env file and restart the application.
          </Alert>
        )}

        {verifierWallet.address && (
          <>
            {isCheckingVerifier ? (
              <CircularProgress size={20} />
            ) : (
              <Chip
                label={
                  isVerifierApproved ? "Approved Verifier" : "Not Approved"
                }
                color={isVerifierApproved ? "success" : "error"}
                size="small"
              />
            )}

            {!isVerifierApproved && !isCheckingVerifier && (
              <Alert severity="warning" sx={{ mt: 2 }}>
                This wallet is not approved as a verifier. Verification
                transactions may fail. Please add this address as an approved
                verifier using the AddVerifierForm.
              </Alert>
            )}
          </>
        )}
      </Box>

      <Divider sx={{ mb: 4 }} />

      <Box component="form" onSubmit={handleSubmit} noValidate>
        <Stack spacing={3}>
          <TextField
            fullWidth
            label="Token ID"
            type="number"
            value={tokenId}
            onChange={(e) => setTokenId(e.target.value)}
            placeholder="1"
            required
            variant="outlined"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">🏠</InputAdornment>
              ),
              endAdornment: (
                <Tooltip
                  title="Enter the token ID of the property you want to verify"
                  arrow
                >
                  <InfoIcon color="action" fontSize="small" />
                </Tooltip>
              ),
            }}
            helperText="Enter the token ID of the property to verify"
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            size="large"
            disabled={isSubmitting || isVerifierApproved === false}
            sx={{ mt: 2, py: 1.5 }}
            startIcon={
              isSubmitting ? (
                <CircularProgress size={20} color="inherit" />
              ) : null
            }
          >
            {isSubmitting ? "Processing..." : "Verify Property"}
          </Button>
        </Stack>
      </Box>

      <Stack spacing={2} sx={{ mt: 4 }}>
        {error && (
          <Alert severity="error" variant="outlined">
            <AlertTitle>Error</AlertTitle>
            {error}
          </Alert>
        )}

        {txHash && (
          <Alert severity="success" variant="outlined">
            <AlertTitle>Property Verified Successfully!</AlertTitle>
            <Box sx={{ mt: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                Transaction ID:
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  wordBreak: "break-all",
                  fontFamily: "monospace",
                  bgcolor: "rgba(0, 0, 0, 0.04)",
                  p: 1,
                  borderRadius: 1,
                  mb: 2,
                }}
              >
                {transactionId}
              </Typography>

              <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                Transaction Hash:
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  wordBreak: "break-all",
                  fontFamily: "monospace",
                  bgcolor: "rgba(0, 0, 0, 0.04)",
                  p: 1,
                  borderRadius: 1,
                }}
              >
                {txHash}
              </Typography>
            </Box>
          </Alert>
        )}
      </Stack>
    </Paper>
  );
}
