import { useState, useRef } from "react";
import { createNewProperty } from "../engine/MintNewAsset";
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
import InfoIcon from "@mui/icons-material/Info";
import HomeWorkIcon from "@mui/icons-material/HomeWork";
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import { client } from "../client";
import { upload } from "thirdweb/storage";

// Local implementation for IPFS functionality
async function uploadToIPFS(file: File): Promise<string> {
  try {
    // Upload file to IPFS using thirdweb storage
    const uris = await upload({
      client,
      files: [file],
    });

    console.log("Uploaded to IPFS:", uris);
    return uris;
  } catch (error) {
    console.error("Error uploading to IPFS:", error);
    throw new Error("Failed to upload file to IPFS");
  }
}

// Local implementation for creating and uploading metadata
async function createAndUploadMetadata(
  name: string,
  description: string,
  imageUri: string,
  attributes: Array<{ trait_type: string; value: string | number }>
): Promise<string> {
  try {
    // Create metadata object following ERC721 metadata standard
    const metadata = {
      name,
      description,
      image: imageUri,
      attributes,
    };

    // Upload metadata to IPFS
    const uris = await upload({
      client,
      files: [{ name: "metadata.json", data: metadata }],
    });

    console.log("Metadata uploaded to IPFS:", uris);
    return uris;
  } catch (error) {
    console.error("Error creating/uploading metadata:", error);
    throw new Error("Failed to create or upload metadata");
  }
}

export function CreatePropertyForm() {
  const [formData, setFormData] = useState({
    propertyAddress: "",
    price: "",
    squareMeters: "",
    legalIdentifier: "",
    propertyName: "",
    propertyDescription: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [txHash, setTxHash] = useState("");
  const [error, setError] = useState("");

  // Image handling
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const imageInputRef = useRef<HTMLInputElement | null>(null);

  // Document handling
  const [selectedDocument, setSelectedDocument] = useState<File | null>(null);
  const [documentName, setDocumentName] = useState<string>("");
  const documentInputRef = useRef<HTMLInputElement | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setSelectedImage(file);

      // Create a preview URL
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDocumentSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setSelectedDocument(file);
      setDocumentName(file.name);
    }
  };

  const triggerImageInput = () => {
    if (imageInputRef.current) {
      imageInputRef.current.click();
    }
  };

  const triggerDocumentInput = () => {
    if (documentInputRef.current) {
      documentInputRef.current.click();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");
    setTxHash("");

    try {
      // Check if image is selected
      if (!selectedImage) {
        throw new Error("Property image is required");
      }

      // Check if document is selected
      if (!selectedDocument) {
        throw new Error("Property document is required");
      }

      // 1. Upload image to IPFS
      console.log("Uploading image to IPFS...");
      const imageUri = await uploadToIPFS(selectedImage);

      // 2. Upload document to IPFS
      console.log("Uploading document to IPFS...");
      const documentUri = await uploadToIPFS(selectedDocument);

      // 3. Create and upload metadata (following ERC721 metadata standards)
      console.log("Creating and uploading metadata...");
      const attributes = [
        { trait_type: "Square Meters", value: formData.squareMeters },
        { trait_type: "Legal Identifier", value: formData.legalIdentifier },
        { trait_type: "Property Address", value: formData.propertyAddress },
      ];

      const tokenUri = await createAndUploadMetadata(
        formData.propertyName || "Property NFT",
        formData.propertyDescription ||
          `Property located at ${formData.propertyAddress}`,
        imageUri,
        attributes
      );

      // 4. Convert values to appropriate types
      const priceInWei = BigInt(formData.price);
      const squareMeters = parseInt(formData.squareMeters);

      // 5. Mint the new property with metadata URI
      console.log("Minting new property with tokenURI:", tokenUri);
      const hash = await createNewProperty(
        formData.propertyAddress,
        priceInWei,
        squareMeters,
        formData.legalIdentifier,
        documentUri,
        tokenUri
      );

      setTxHash(typeof hash === "string" ? hash : hash.transactionHash);
    } catch (err) {
      console.error("Error creating property:", err);
      setError(
        err instanceof Error ? err.message : "Failed to create property"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
      <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
        <HomeWorkIcon sx={{ fontSize: 30, mr: 2, color: "primary.main" }} />
        <Typography variant="h5" component="h2" gutterBottom>
          Create New Property
        </Typography>
      </Box>

      <Divider sx={{ mb: 4 }} />

      <Box component="form" onSubmit={handleSubmit} noValidate>
        <Stack spacing={3}>
          {/* Property Image Upload */}
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              mb: 2,
              border: "1px dashed #ccc",
              borderRadius: 2,
              p: 3,
              cursor: "pointer",
              backgroundColor: "#f8f8f8",
              "&:hover": {
                backgroundColor: "#f0f0f0",
              },
            }}
            onClick={triggerImageInput}
          >
            <input
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={handleImageSelect}
              ref={imageInputRef}
            />
            {imagePreview ? (
              <Box
                sx={{
                  width: "100%",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <img
                  src={imagePreview}
                  alt="Property Preview"
                  style={{
                    maxWidth: "100%",
                    maxHeight: "200px",
                    objectFit: "contain",
                    borderRadius: "8px",
                  }}
                />
                <Typography
                  variant="caption"
                  color="textSecondary"
                  sx={{ mt: 1 }}
                >
                  Click to change image
                </Typography>
              </Box>
            ) : (
              <>
                <AddPhotoAlternateIcon
                  sx={{ fontSize: 60, color: "text.secondary", mb: 1 }}
                />
                <Typography variant="body1" align="center" gutterBottom>
                  Upload Property Image
                </Typography>
                <Typography
                  variant="caption"
                  color="textSecondary"
                  align="center"
                >
                  Click to select an image file (JPG, PNG)
                </Typography>
              </>
            )}
          </Box>

          {/* Document Upload */}
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              mb: 2,
              border: "1px dashed #ccc",
              borderRadius: 2,
              p: 3,
              cursor: "pointer",
              backgroundColor: "#f8f8f8",
              "&:hover": {
                backgroundColor: "#f0f0f0",
              },
            }}
            onClick={triggerDocumentInput}
          >
            <input
              type="file"
              accept=".pdf,.doc,.docx,.txt"
              style={{ display: "none" }}
              onChange={handleDocumentSelect}
              ref={documentInputRef}
            />
            {selectedDocument ? (
              <Box
                sx={{
                  width: "100%",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <AttachFileIcon
                  sx={{ fontSize: 40, color: "primary.main", mb: 1 }}
                />
                <Typography variant="body2" align="center">
                  {documentName}
                </Typography>
                <Typography
                  variant="caption"
                  color="textSecondary"
                  sx={{ mt: 1 }}
                >
                  Click to change document
                </Typography>
              </Box>
            ) : (
              <>
                <AttachFileIcon
                  sx={{ fontSize: 60, color: "text.secondary", mb: 1 }}
                />
                <Typography variant="body1" align="center" gutterBottom>
                  Upload Property Document
                </Typography>
                <Typography
                  variant="caption"
                  color="textSecondary"
                  align="center"
                >
                  Click to select a document file (PDF, DOC, DOCX, TXT)
                </Typography>
              </>
            )}
          </Box>

          {/* Property Name & Description */}
          <TextField
            fullWidth
            label="Property Name"
            name="propertyName"
            value={formData.propertyName}
            onChange={handleChange}
            placeholder="Luxury Beachfront Condo"
            variant="outlined"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">📝</InputAdornment>
              ),
            }}
          />

          <TextField
            fullWidth
            label="Property Description"
            name="propertyDescription"
            value={formData.propertyDescription}
            onChange={handleChange}
            placeholder="Beautiful property with ocean views..."
            multiline
            rows={3}
            variant="outlined"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">📋</InputAdornment>
              ),
            }}
          />

          <TextField
            fullWidth
            label="Property Address"
            name="propertyAddress"
            value={formData.propertyAddress}
            onChange={handleChange}
            placeholder="123 Main St, City, Country"
            required
            variant="outlined"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">🏠</InputAdornment>
              ),
            }}
          />

          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <TextField
              fullWidth
              label="Price (in wei)"
              name="price"
              value={formData.price}
              onChange={handleChange}
              placeholder="1000000000000000000"
              required
              variant="outlined"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">💰</InputAdornment>
                ),
                endAdornment: (
                  <Tooltip title="1 ETH = 1000000000000000000 wei" arrow>
                    <InfoIcon color="action" fontSize="small" />
                  </Tooltip>
                ),
              }}
              helperText="1 ETH = 1000000000000000000 wei"
            />

            <TextField
              fullWidth
              label="Square Meters"
              name="squareMeters"
              type="number"
              value={formData.squareMeters}
              onChange={handleChange}
              placeholder="100"
              required
              variant="outlined"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">📏</InputAdornment>
                ),
              }}
            />
          </Stack>

          <TextField
            fullWidth
            label="Legal Identifier"
            name="legalIdentifier"
            value={formData.legalIdentifier}
            onChange={handleChange}
            placeholder="DEED-123456"
            required
            variant="outlined"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">📄</InputAdornment>
              ),
            }}
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
            {isSubmitting ? "Processing..." : "Create Property"}
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
            <AlertTitle>Transaction Successful!</AlertTitle>
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
