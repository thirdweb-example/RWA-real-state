import { useState, useEffect } from "react";
import { completePurchase } from "../engine/CompletePurchase";
import { getPendingPurchase } from "../engine/GetPendingPurchase";
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
  FormControlLabel,
  Radio,
  RadioGroup,
  FormControl,
  FormLabel,
} from "@mui/material";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import InfoIcon from "@mui/icons-material/Info";

export function CompletePurchaseForm() {
  const [tokenId, setTokenId] = useState("");
  const [success, setSuccess] = useState<boolean>(true);
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [txHash, setTxHash] = useState("");
  const [error, setError] = useState("");
  const [pendingPurchase, setPendingPurchase] = useState<{
    exists: boolean;
    buyer: string;
    amount: bigint;
  } | null>(null);

  const fetchPendingPurchase = async (id: string) => {
    if (!id) return;

    try {
      setIsLoading(true);
      setPendingPurchase(null);
      setError("");

      const tokenIdNumber = parseInt(id);
      if (isNaN(tokenIdNumber)) {
        throw new Error("Token ID must be a valid number");
      }

      const purchase = await getPendingPurchase(tokenIdNumber);
      setPendingPurchase(purchase);

      if (!purchase.exists) {
        setError("No pending purchase found for this property");
      }
    } catch (err) {
      console.error("Error fetching pending purchase:", err);
      setError(
        err instanceof Error ? err.message : "Failed to fetch pending purchase"
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch pending purchase when token ID changes
  useEffect(() => {
    const timer = setTimeout(() => {
      if (tokenId) {
        fetchPendingPurchase(tokenId);
      }
    }, 500); // Add debounce of 500ms

    return () => clearTimeout(timer);
  }, [tokenId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");
    setTxHash("");

    try {
      // Convert values to appropriate types
      const tokenIdNumber = parseInt(tokenId);

      if (isNaN(tokenIdNumber)) {
        throw new Error("Token ID must be a valid number");
      }

      if (!pendingPurchase?.exists) {
        throw new Error("No pending purchase exists for this property");
      }

      const hash = await completePurchase(tokenIdNumber, success, reason);
      setTxHash(typeof hash === "string" ? hash : hash.transactionHash);
    } catch (err) {
      console.error("Error completing purchase:", err);
      setError(
        err instanceof Error ? err.message : "Failed to complete purchase"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
      <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
        <DoneAllIcon sx={{ fontSize: 30, mr: 2, color: "primary.main" }} />
        <Typography variant="h5" component="h2" gutterBottom>
          Complete Property Purchase
        </Typography>
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
                  title="Enter the token ID of the property with a pending purchase"
                  arrow
                >
                  <InfoIcon color="action" fontSize="small" />
                </Tooltip>
              ),
            }}
            helperText="Enter the token ID of the property to complete purchase"
          />

          {isLoading && (
            <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>
              <CircularProgress size={24} />
            </Box>
          )}

          {pendingPurchase && pendingPurchase.exists && (
            <Paper
              variant="outlined"
              sx={{ p: 2, bgcolor: "rgba(0, 0, 0, 0.02)" }}
            >
              <Typography variant="subtitle2" gutterBottom>
                Pending Purchase Details:
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                <Box>
                  <Typography variant="body2">
                    <strong>Buyer:</strong> {pendingPurchase.buyer}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2">
                    <strong>Amount:</strong> {pendingPurchase.amount.toString()}{" "}
                    wei
                  </Typography>
                </Box>
              </Box>
            </Paper>
          )}

          <FormControl component="fieldset">
            <FormLabel component="legend">Purchase Decision</FormLabel>
            <RadioGroup
              name="purchase-decision"
              value={success ? "approve" : "reject"}
              onChange={(e) => setSuccess(e.target.value === "approve")}
            >
              <FormControlLabel
                value="approve"
                control={<Radio />}
                label="Approve and complete purchase"
              />
              <FormControlLabel
                value="reject"
                control={<Radio />}
                label="Reject purchase"
              />
            </RadioGroup>
          </FormControl>

          {!success && (
            <TextField
              fullWidth
              label="Rejection Reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Reason for rejecting the purchase"
              variant="outlined"
              multiline
              rows={2}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">📝</InputAdornment>
                ),
              }}
              helperText="Enter the reason for rejecting this purchase (optional)"
            />
          )}

          <Button
            type="submit"
            fullWidth
            variant="contained"
            color={success ? "primary" : "error"}
            size="large"
            disabled={isSubmitting || isLoading || !pendingPurchase?.exists}
            sx={{ mt: 2, py: 1.5 }}
            startIcon={
              isSubmitting ? (
                <CircularProgress size={20} color="inherit" />
              ) : null
            }
          >
            {isSubmitting
              ? "Processing..."
              : !pendingPurchase?.exists
              ? "No Pending Purchase"
              : success
              ? "Complete Purchase"
              : "Reject Purchase"}
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
          <Alert severity={success ? "success" : "info"} variant="outlined">
            <AlertTitle>
              {success ? "Purchase Completed!" : "Purchase Rejected"}
            </AlertTitle>
            <Box sx={{ mt: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                Transaction hash:
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
              <Typography variant="body2" sx={{ mt: 2 }}>
                {success
                  ? "Purchase has been completed. The property ownership has been transferred and the payment has been sent to the seller."
                  : "Purchase has been rejected. The buyer's funds have been refunded."}
              </Typography>
            </Box>
          </Alert>
        )}
      </Stack>
    </Paper>
  );
}
