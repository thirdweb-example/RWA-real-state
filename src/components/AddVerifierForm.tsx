import { useState } from "react";
import { addVerifier } from "../engine/AddVerifier";
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
} from "@mui/material";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import InfoIcon from "@mui/icons-material/Info";

export function AddVerifierForm() {
  const [verifierAddress, setVerifierAddress] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [txHash, setTxHash] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");
    setTxHash("");

    try {
      // Check if address looks valid (simple check)
      if (!verifierAddress.startsWith("0x") || verifierAddress.length !== 42) {
        throw new Error("Please enter a valid Ethereum address");
      }

      const hash = await addVerifier(verifierAddress);
      setTxHash(typeof hash === "string" ? hash : hash.transactionHash);
    } catch (err) {
      console.error("Error adding verifier:", err);
      setError(err instanceof Error ? err.message : "Failed to add verifier");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
      <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
        <PersonAddIcon sx={{ fontSize: 30, mr: 2, color: "primary.main" }} />
        <Typography variant="h5" component="h2" gutterBottom>
          Add Verifier
        </Typography>
      </Box>

      <Divider sx={{ mb: 4 }} />

      <Box component="form" onSubmit={handleSubmit} noValidate>
        <Stack spacing={3}>
          <TextField
            fullWidth
            label="Verifier Address"
            value={verifierAddress}
            onChange={(e) => setVerifierAddress(e.target.value)}
            placeholder="0x..."
            required
            variant="outlined"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">👤</InputAdornment>
              ),
              endAdornment: (
                <Tooltip
                  title="Ethereum address of the account to add as a verifier"
                  arrow
                >
                  <InfoIcon color="action" fontSize="small" />
                </Tooltip>
              ),
            }}
            helperText="Enter the wallet address to grant verification privileges"
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            size="large"
            disabled={isSubmitting}
            sx={{ mt: 2, py: 1.5 }}
            startIcon={
              isSubmitting ? (
                <CircularProgress size={20} color="inherit" />
              ) : null
            }
          >
            {isSubmitting ? "Processing..." : "Add Verifier"}
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
            <AlertTitle>Verifier Added Successfully!</AlertTitle>
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
            </Box>
          </Alert>
        )}
      </Stack>
    </Paper>
  );
}
