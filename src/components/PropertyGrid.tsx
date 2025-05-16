import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Divider,
  Grid,
  CircularProgress,
  Alert,
  IconButton,
  Tooltip,
  Link,
} from "@mui/material";
import CollectionsIcon from "@mui/icons-material/Collections";
import RefreshIcon from "@mui/icons-material/Refresh";
import { PropertyCard } from "./PropertyCard";
import type { Property } from "../engine/GetPropertiesUtils";
import { getAllProperties } from "../engine/GetPropertiesUtils";

export function PropertyGrid() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(
    null
  );

  // Fetch all properties on component mount
  const fetchProperties = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const propertiesData = await getAllProperties();
      console.log("Fetched properties:", propertiesData);
      setProperties(propertiesData);
    } catch (err) {
      console.error("Error fetching properties:", err);
      setError("Failed to fetch properties. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  const handlePropertyClick = (property: Property) => {
    setSelectedProperty(
      selectedProperty?.propertyAddress === property.propertyAddress
        ? null
        : property
    );
  };

  // Convert IPFS URL to gateway URL
  const getIpfsUrl = (ipfsUrl: string): string => {
    // Check if it's already an HTTP URL
    if (ipfsUrl.startsWith("http")) {
      return ipfsUrl;
    }

    // Get the client ID from env or use a default one
    const clientId = import.meta.env.VITE_THIRDWEB_CLIENT_ID || "default";

    // Handle ipfs:// protocol URLs
    if (ipfsUrl.startsWith("ipfs://")) {
      const ipfsHash = ipfsUrl.replace("ipfs://", "");
      return `https://${clientId}.ipfscdn.io/ipfs/${ipfsHash}`;
    }

    // Return as is if not an IPFS URL
    return ipfsUrl;
  };

  return (
    <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 3,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <CollectionsIcon
            sx={{ fontSize: 30, mr: 2, color: "primary.main" }}
          />
          <Typography variant="h5" component="h2">
            Real Estate Properties
          </Typography>
        </Box>
        <Tooltip title="Refresh properties">
          <IconButton onClick={fetchProperties} disabled={isLoading}>
            {isLoading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              <RefreshIcon />
            )}
          </IconButton>
        </Tooltip>
      </Box>

      <Divider sx={{ mb: 4 }} />

      {isLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      ) : properties.length === 0 ? (
        <Alert severity="info" sx={{ mb: 3 }}>
          No properties found. Create some properties in the Admin section.
        </Alert>
      ) : (
        <>
          <Typography variant="h6" gutterBottom>
            Showing {properties.length}{" "}
            {properties.length === 1 ? "property" : "properties"}
          </Typography>

          <Grid container spacing={3} sx={{ mt: 1 }}>
            {properties.map((property, index) => (
              <Grid
                size={{ xs: 12, sm: 6, md: 4 }}
                key={`${property.propertyAddress}-${index}`}
              >
                <PropertyCard
                  property={property}
                  onCardClick={handlePropertyClick}
                  isSelected={
                    selectedProperty?.propertyAddress ===
                    property.propertyAddress
                  }
                />
              </Grid>
            ))}
          </Grid>
        </>
      )}

      {selectedProperty && (
        <Box sx={{ mt: 4 }}>
          <Divider sx={{ mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            Selected Property
          </Typography>
          <Box
            sx={{
              p: 2,
              bgcolor: "background.paper",
              borderRadius: 1,
              border: "1px solid",
              borderColor: "divider",
            }}
          >
            <Typography variant="body1" gutterBottom>
              <strong>Address:</strong> {selectedProperty.propertyAddress}
            </Typography>
            <Typography variant="body1" gutterBottom>
              <strong>Price:</strong> {Number(selectedProperty.price) / 1e18}{" "}
              ETH
            </Typography>
            <Typography variant="body1" gutterBottom>
              <strong>Area:</strong> {selectedProperty.squareMeters.toString()}{" "}
              m²
            </Typography>
            <Typography variant="body1" gutterBottom>
              <strong>Legal Identifier:</strong>{" "}
              {selectedProperty.legalIdentifier}
            </Typography>
            <Typography variant="body1" gutterBottom>
              <strong>Document Hash:</strong>{" "}
              {selectedProperty.documentHash.startsWith("ipfs://") ? (
                <Link
                  href={getIpfsUrl(selectedProperty.documentHash)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View Documents
                </Link>
              ) : (
                selectedProperty.documentHash
              )}
            </Typography>
            <Typography variant="body1">
              <strong>Verification Status:</strong>{" "}
              {selectedProperty.verifier &&
              selectedProperty.verifier !==
                "0x0000000000000000000000000000000000000000"
                ? `Verified by ${selectedProperty.verifier.substring(
                    0,
                    6
                  )}...${selectedProperty.verifier.substring(38)}`
                : "Not Verified"}
            </Typography>
          </Box>
        </Box>
      )}
    </Paper>
  );
}
