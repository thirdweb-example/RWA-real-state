import { useState } from "react";
import { IconButton, Tooltip, CircularProgress } from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import { triggerDataRefresh } from "../utils/cacheUtils";

interface RefreshButtonProps {
  tooltip?: string;
  size?: "small" | "medium" | "large";
  color?: "inherit" | "primary" | "secondary" | "default";
}

export function RefreshButton({
  tooltip = "Refresh data",
  size = "medium",
  color = "inherit",
}: RefreshButtonProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);

    // Trigger the global data refresh
    triggerDataRefresh();

    // Reset the refreshing state after a delay
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1000);
  };

  return (
    <Tooltip title={tooltip}>
      <IconButton
        onClick={handleRefresh}
        disabled={isRefreshing}
        size={size}
        color={color}
      >
        {isRefreshing ? (
          <CircularProgress size={24} color="inherit" />
        ) : (
          <RefreshIcon />
        )}
      </IconButton>
    </Tooltip>
  );
}
