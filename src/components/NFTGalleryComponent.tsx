import { useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Divider,
  Card,
  CardContent,
  CardMedia,
} from "@mui/material";
import CollectionsIcon from "@mui/icons-material/Collections";
import HouseIcon from "@mui/icons-material/House";

// Mock data for display
const mockNFTs = [
  {
    id: "1",
    name: "Property #1",
    price: "0.0000 ETH",
    usdValue: "$0.00",
    area: "224 m²",
    propertyId: "ID-1",
  },
  {
    id: "2",
    name: "Property #2",
    price: "0.0000 ETH",
    usdValue: "$0.00",
    area: "224 m²",
    propertyId: "ID-2",
  },
];

export function NFTGalleryComponent() {
  const [selectedNft, setSelectedNft] = useState<string | null>(null);

  const handleCardClick = (tokenId: string) => {
    setSelectedNft(tokenId === selectedNft ? null : tokenId);
  };

  return (
    <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
      <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
        <CollectionsIcon sx={{ fontSize: 30, mr: 2, color: "primary.main" }} />
        <Typography variant="h5" component="h2" gutterBottom>
          NFT Marketplace
        </Typography>
      </Box>

      <Divider sx={{ mb: 4 }} />

      <Typography variant="h6" gutterBottom>
        Showing 1 - 2 of 2 properties
      </Typography>

      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, mt: 2 }}>
        {mockNFTs.map((nft) => (
          <Box
            key={nft.id}
            sx={{
              width: {
                xs: "100%",
                sm: "calc(50% - 8px)",
                md: "calc(50% - 8px)",
              },
            }}
          >
            <Card
              variant="outlined"
              sx={{
                height: "100%",
                cursor: "pointer",
                border: selectedNft === nft.id ? "2px solid" : "1px solid",
                borderColor:
                  selectedNft === nft.id ? "primary.main" : "divider",
              }}
              onClick={() => handleCardClick(nft.id)}
            >
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
                <HouseIcon sx={{ fontSize: 80, color: "text.secondary" }} />
                <Box
                  sx={{
                    position: "absolute",
                    top: 10,
                    right: 10,
                    bgcolor: "success.main",
                    color: "white",
                    px: 1,
                    py: 0.5,
                    borderRadius: 1,
                    fontSize: "0.75rem",
                    fontWeight: "bold",
                  }}
                >
                  For Sale
                </Box>
              </Box>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {nft.name}
                </Typography>

                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mb: 1,
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    ID: #{nft.id}
                  </Typography>
                </Box>

                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mb: 0.5,
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    Price:
                  </Typography>
                  <Typography variant="body2">{nft.price}</Typography>
                </Box>

                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mb: 0.5,
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    USD Value:
                  </Typography>
                  <Typography variant="body2">{nft.usdValue}</Typography>
                </Box>

                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mb: 0.5,
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    Area:
                  </Typography>
                  <Typography variant="body2">{nft.area}</Typography>
                </Box>

                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography variant="body2" color="text.secondary">
                    ID:
                  </Typography>
                  <Typography variant="body2">{nft.propertyId}</Typography>
                </Box>
              </CardContent>
            </Card>
          </Box>
        ))}
      </Box>

      {selectedNft && (
        <Box sx={{ mt: 4, textAlign: "center" }}>
          <Paper
            variant="outlined"
            sx={{
              p: 2,
              display: "inline-block",
              minWidth: "200px",
            }}
          >
            <Typography variant="body1" gutterBottom>
              <strong>
                {mockNFTs.find((nft) => nft.id === selectedNft)?.name}
              </strong>
            </Typography>
            <Typography variant="body2" color="primary">
              BUY NOW
            </Typography>
          </Paper>
        </Box>
      )}
    </Paper>
  );
}
