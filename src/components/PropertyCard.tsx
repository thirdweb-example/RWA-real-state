import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardMedia,
  Chip,
  Divider,
} from "@mui/material";
import HouseIcon from "@mui/icons-material/House";
import VerifiedIcon from "@mui/icons-material/Verified";
import type { Property } from "../engine/GetPropertiesUtils";

// Map from PropertyState enum values to human-readable status and colors
const propertyStates = {
  0: { label: "Initial Offering", color: "info" },
  1: { label: "For Sale", color: "success" },
  2: { label: "Pending Sale", color: "warning" },
  3: { label: "Sold", color: "error" },
  4: { label: "Not For Sale", color: "default" },
};

interface PropertyCardProps {
  property: Property;
  onCardClick?: (property: Property) => void;
  isSelected?: boolean;
}

// Helper function to convert IPFS URLs to CDN URLs
const convertIPFSToCDN = (ipfsUrl: string): string => {
  const clientId = import.meta.env.VITE_THIRDWEB_CLIENT_ID;
  return ipfsUrl.replace("ipfs://", `https://${clientId}.ipfscdn.io/ipfs/`);
};

// Helper function to fetch metadata from IPFS
const fetchMetadataFromIPFS = async (ipfsUri: string): Promise<any> => {
  try {
    const url = convertIPFSToCDN(ipfsUri);
    const response = await fetch(url);
    return await response.json();
  } catch (error) {
    console.error("Error fetching metadata:", error);
    return null;
  }
};

export const PropertyCard = ({
  property,
  onCardClick,
  isSelected = false,
}: PropertyCardProps) => {
  // State to track image loading status
  const [imageError, setImageError] = useState(false);
  const [imageUrl, setImageUrl] = useState<string>("");
  const [isLoadingMetadata, setIsLoadingMetadata] = useState(false);

  // Load and process the metadata
  useEffect(() => {
    if (!property.imageURI) {
      setImageUrl("");
      return;
    }

    const loadImage = async () => {
      setIsLoadingMetadata(true);
      console.log("Raw imageURI:", property.imageURI);

      try {
        // First check if the imageURI is a direct IPFS path
        if (property.imageURI.startsWith("ipfs://")) {
          // Try to fetch metadata first - the URI might point to a metadata JSON
          try {
            const metadata = await fetchMetadataFromIPFS(property.imageURI);
            console.log("Fetched metadata:", metadata);

            // Check for expected metadata structure
            if (metadata && metadata.data && metadata.data.image) {
              const url = convertIPFSToCDN(metadata.data.image);
              console.log("Using metadata.data.image URL:", url);
              setImageUrl(url);
            } else if (metadata && metadata.image) {
              const url = convertIPFSToCDN(metadata.image);
              console.log("Using metadata.image URL:", url);
              setImageUrl(url);
            } else {
              // Just use the original URI as the image source
              const url = convertIPFSToCDN(property.imageURI);
              console.log(
                "Using direct imageURI URL (no image in metadata):",
                url
              );
              setImageUrl(url);
            }
          } catch (metadataError) {
            console.log(
              "Error fetching metadata, using URI directly:",
              metadataError
            );
            const url = convertIPFSToCDN(property.imageURI);
            console.log(
              "Using direct imageURI URL (failed to fetch metadata):",
              url
            );
            setImageUrl(url);
          }
        } else {
          // Non-IPFS URI, use directly
          console.log("Using non-IPFS imageURI directly:", property.imageURI);
          setImageUrl(property.imageURI);
        }
      } catch (error) {
        console.error("Error processing imageURI:", error);
      } finally {
        setIsLoadingMetadata(false);
      }
    };

    loadImage();
    setImageError(false);
  }, [property.imageURI]);

  // Log the final image URL when it changes
  useEffect(() => {
    console.log("Final image URL being used:", imageUrl);
  }, [imageUrl]);

  // Format Ethereum price for display with proper decimals
  const formatEthPrice = (price: bigint): string => {
    // Convert to a string showing proper ETH value (convert wei to ETH)
    return `${Number(price) / 1e18} ETH`;
  };

  // Get property state info
  const stateInfo = propertyStates[
    property.state as keyof typeof propertyStates
  ] || { label: "Unknown", color: "default" };

  return (
    <Card
      variant="outlined"
      sx={{
        height: "100%",
        cursor: onCardClick ? "pointer" : "default",
        border: isSelected ? "2px solid" : "1px solid",
        borderColor: isSelected ? "primary.main" : "divider",
        transition: "transform 0.2s ease-in-out",
        "&:hover": onCardClick ? { transform: "scale(1.02)" } : {},
        position: "relative",
        overflow: "visible",
      }}
      onClick={() => onCardClick?.(property)}
    >
      {/* Show verification status with badge */}
      {property.verifier &&
        property.verifier !== "0x0000000000000000000000000000000000000000" && (
          <Box
            sx={{
              position: "absolute",
              top: -10,
              right: -10,
              zIndex: 1,
              backgroundColor: "#fff",
              borderRadius: "50%",
              boxShadow: 2,
            }}
          >
            <VerifiedIcon color="primary" fontSize="medium" />
          </Box>
        )}

      {/* Property Image or Placeholder */}
      {!imageError && imageUrl ? (
        <CardMedia
          component="img"
          height="140"
          image={imageUrl}
          alt={property.propertyAddress}
          sx={{ objectFit: "cover" }}
          onError={() => setImageError(true)}
        />
      ) : (
        <Box
          sx={{
            position: "relative",
            height: 140,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: "action.hover",
          }}
        >
          {isLoadingMetadata ? (
            <Typography variant="body2" color="text.secondary">
              Loading...
            </Typography>
          ) : (
            <HouseIcon sx={{ fontSize: 80, color: "text.secondary" }} />
          )}
        </Box>
      )}

      {/* Status Badge */}
      <Chip
        label={stateInfo.label}
        color={
          stateInfo.color as
            | "success"
            | "info"
            | "warning"
            | "error"
            | "default"
        }
        size="small"
        sx={{
          position: "absolute",
          top: 10,
          right: 10,
          fontWeight: "bold",
        }}
      />

      <CardContent>
        {/* Property Address */}
        <Typography
          variant="h6"
          gutterBottom
          noWrap
          title={property.propertyAddress}
        >
          {property.propertyAddress}
        </Typography>

        <Divider sx={{ my: 1 }} />

        {/* Property Details */}
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
          <Typography variant="body2" color="text.secondary">
            Price:
          </Typography>
          <Typography variant="body2" fontWeight="bold">
            {formatEthPrice(property.price)}
          </Typography>
        </Box>

        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
          <Typography variant="body2" color="text.secondary">
            Area:
          </Typography>
          <Typography variant="body2">
            {property.squareMeters.toString()} m²
          </Typography>
        </Box>

        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
          <Typography variant="body2" color="text.secondary">
            Legal ID:
          </Typography>
          <Typography
            variant="body2"
            noWrap
            sx={{ maxWidth: "150px" }}
            title={property.legalIdentifier}
          >
            {property.legalIdentifier}
          </Typography>
        </Box>

        {/* Document Hash */}
        {property.documentHash && (
          <Box
            sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}
          >
            <Typography variant="body2" color="text.secondary">
              Document:
            </Typography>
            <Typography
              variant="body2"
              noWrap
              sx={{
                maxWidth: "150px",
                cursor: property.documentHash.startsWith("ipfs://")
                  ? "pointer"
                  : "default",
                color: property.documentHash.startsWith("ipfs://")
                  ? "primary.main"
                  : "text.primary",
                textDecoration: property.documentHash.startsWith("ipfs://")
                  ? "underline"
                  : "none",
              }}
              title={property.documentHash}
              onClick={() => {
                if (property.documentHash.startsWith("ipfs://")) {
                  const url = convertIPFSToCDN(property.documentHash);
                  window.open(url, "_blank");
                }
              }}
            >
              View Document
            </Typography>
          </Box>
        )}

        {/* Conditionally show verification status */}
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
          <Typography variant="body2" color="text.secondary">
            Verified:
          </Typography>
          <Typography variant="body2">
            {property.verifier &&
            property.verifier !== "0x0000000000000000000000000000000000000000"
              ? "Yes"
              : "No"}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};
