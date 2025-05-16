import { useState } from "react";
import "./App.css";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Button from "@mui/material/Button";

import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import Divider from "@mui/material/Divider";

// Import all components
import { CreatePropertyForm } from "./components/CreatePropertyForm";
import { VerifyPropertyForm } from "./components/VerifyPropertyForm";
import { AddVerifierForm } from "./components/AddVerifierForm";
import { RemoveVerifierForm } from "./components/RemoveVerifierForm";

import { PropertyGrid } from "./components/PropertyGrid";

// Create a theme instance
const theme = createTheme({
  palette: {
    primary: {
      main: "#2E3B55",
    },
    secondary: {
      main: "#19857b",
    },
    background: {
      default: "#f5f5f5",
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: "2.5rem",
      fontWeight: 700,
    },
  },
});

// Available navigation tabs
const tabs = [
  { label: "Home", value: "home" },
  { label: "Properties", value: "properties" },
  { label: "Admin", value: "admin" },
];

function App() {
  const [currentTab, setCurrentTab] = useState("home");
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: string) => {
    setCurrentTab(newValue);
  };

  // Function to set current tab programmatically
  const navigateToTab = (tabValue: string) => {
    setCurrentTab(tabValue);
  };

  // Render the selected component based on tab value
  const renderContent = () => {
    switch (currentTab) {
      case "home":
        return <HomePage navigateToTab={navigateToTab} />;
      case "properties":
        return <PropertyGrid />;
      case "admin":
        return (
          <>
            <CreatePropertyForm />
            <Box sx={{ mt: 4 }} />
            <AddVerifierForm />
            <Box sx={{ mt: 4 }} />
            <RemoveVerifierForm />
            <Box sx={{ mt: 4 }} />
            <VerifyPropertyForm />
          </>
        );
      default:
        return <HomePage navigateToTab={navigateToTab} />;
    }
  };

  // Drawer content for mobile
  const drawer = (
    <Box onClick={handleDrawerToggle} sx={{ textAlign: "center" }}>
      <Typography variant="h6" sx={{ my: 2 }}>
        Real Estate RWA
      </Typography>
      <Divider />
      <List>
        {tabs.map((tab) => (
          <ListItem key={tab.value} disablePadding>
            <ListItemButton
              onClick={() => setCurrentTab(tab.value)}
              sx={{
                textAlign: "center",
                backgroundColor:
                  currentTab === tab.value
                    ? "rgba(46, 59, 85, 0.1)"
                    : "inherit",
              }}
            >
              <ListItemText primary={tab.label} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          minHeight: "100vh",
        }}
      >
        {/* AppBar / Navbar */}
        <AppBar position="static" color="primary" elevation={4}>
          <Toolbar>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2, display: { sm: "none" } }}
            >
              <MenuIcon />
            </IconButton>
            <Typography
              variant="h6"
              component="div"
              sx={{
                flexGrow: 1,
                fontWeight: "bold",
                mr: "auto",
                textAlign: "left",
                pl: { xs: 0, sm: 2 },
              }}
            >
              Real Estate RWA
            </Typography>

            {/* Desktop navigation */}
            <Tabs
              value={currentTab}
              onChange={handleTabChange}
              textColor="inherit"
              sx={{ display: { xs: "none", sm: "flex" } }}
            >
              {tabs.map((tab) => (
                <Tab key={tab.value} label={tab.label} value={tab.value} />
              ))}
            </Tabs>
          </Toolbar>
        </AppBar>

        {/* Mobile navigation drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better mobile performance
          }}
          sx={{
            display: { xs: "block", sm: "none" },
            "& .MuiDrawer-paper": { boxSizing: "border-box", width: 240 },
          }}
        >
          {drawer}
        </Drawer>

        {/* Main Content */}
        <Box sx={{ flexGrow: 1 }}>
          <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
            {renderContent()}
          </Container>
        </Box>

        {/* Footer */}
        <Box
          component="footer"
          sx={{
            py: 3,
            px: 2,
            mt: "auto",
            backgroundColor: (theme) => theme.palette.grey[200],
          }}
        >
          <Container maxWidth="md">
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
              <Box
                sx={{
                  flex: "1 1 300px",
                  minWidth: { xs: "100%", sm: "250px" },
                }}
              >
                <Typography variant="h6" color="textPrimary" gutterBottom>
                  About Us
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Real Estate RWA is a pioneering blockchain-based platform for
                  tokenizing real estate assets, enabling fractional ownership
                  and transparent property transactions.
                </Typography>
              </Box>
              <Box
                sx={{
                  flex: "1 1 300px",
                  minWidth: { xs: "100%", sm: "250px" },
                }}
              >
                <Typography variant="h6" color="textPrimary" gutterBottom>
                  Contact Us
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  123 Blockchain Avenue
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Email: info@realestate-rwa.com
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Phone: +1 234 567 8900
                </Typography>
              </Box>
              <Box
                sx={{
                  flex: "1 1 300px",
                  minWidth: { xs: "100%", sm: "250px" },
                }}
              >
                <Typography variant="h6" color="textPrimary" gutterBottom>
                  Legal
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Terms of Service
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Privacy Policy
                </Typography>
              </Box>
            </Box>
            <Box mt={3}>
              <Divider />
              <Typography
                variant="body2"
                color="textSecondary"
                align="center"
                sx={{ pt: 2 }}
              >
                © {new Date().getFullYear()} Real Estate RWA. All rights
                reserved.
              </Typography>
            </Box>
          </Container>
        </Box>
      </Box>
    </ThemeProvider>
  );
}

// Home page component with hero and featured properties
const HomePage = ({
  navigateToTab,
}: {
  navigateToTab: (tab: string) => void;
}) => {
  return (
    <>
      {/* Hero Section */}
      <Box
        sx={{
          position: "relative",
          height: "400px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
          backgroundImage:
            "linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.7)), url(https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          borderRadius: 2,
          mb: 6,
          p: 4,
          textAlign: "center",
        }}
      >
        <Typography
          variant="h3"
          component="h1"
          sx={{ fontWeight: "bold", mb: 2 }}
        >
          Real Estate on the Blockchain
        </Typography>
        <Typography variant="h6" sx={{ mb: 4, maxWidth: "800px" }}>
          Discover tokenized properties with transparent ownership and seamless
          transactions
        </Typography>
        <Box sx={{ display: "flex", gap: 2 }}>
          <Button
            variant="contained"
            size="large"
            color="secondary"
            onClick={() => navigateToTab("properties")}
          >
            Explore Properties
          </Button>
        </Box>
      </Box>

      {/* Features Section */}
      <Box sx={{ mb: 6 }}>
        <Typography
          variant="h4"
          component="h2"
          gutterBottom
          align="center"
          sx={{ mb: 4 }}
        >
          Why Choose Tokenized Real Estate
        </Typography>
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
          <Box
            sx={{
              flex: "1 1 300px",
              minWidth: { xs: "100%", sm: "calc(33.33% - 16px)" },
              textAlign: "center",
              p: 2,
            }}
          >
            <Box sx={{ fontSize: 60, color: "primary.main", mb: 1 }}>🔒</Box>
            <Typography variant="h6" gutterBottom>
              Security & Transparency
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Immutable blockchain records ensure transparent ownership and
              transaction history.
            </Typography>
          </Box>
          <Box
            sx={{
              flex: "1 1 300px",
              minWidth: { xs: "100%", sm: "calc(33.33% - 16px)" },
              textAlign: "center",
              p: 2,
            }}
          >
            <Box sx={{ fontSize: 60, color: "primary.main", mb: 1 }}>💰</Box>
            <Typography variant="h6" gutterBottom>
              Fractional Ownership
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Own a piece of premium real estate with lower capital
              requirements.
            </Typography>
          </Box>
          <Box
            sx={{
              flex: "1 1 300px",
              minWidth: { xs: "100%", sm: "calc(33.33% - 16px)" },
              textAlign: "center",
              p: 2,
            }}
          >
            <Box sx={{ fontSize: 60, color: "primary.main", mb: 1 }}>🚀</Box>
            <Typography variant="h6" gutterBottom>
              Global Liquidity
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Buy, sell, and trade real estate assets from anywhere in the
              world.
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* CTA Section */}
      <Box
        sx={{
          bgcolor: "primary.light",
          p: 6,
          borderRadius: 2,
          color: "white",
          textAlign: "center",
          mb: 6,
        }}
      >
        <Typography variant="h4" gutterBottom>
          Ready to Start Your Property Tokenization Journey?
        </Typography>
        <Typography
          variant="body1"
          paragraph
          sx={{ maxWidth: 700, mx: "auto", mb: 4 }}
        >
          Join our platform today and discover how blockchain technology is
          revolutionizing the real estate market.
        </Typography>
        <Box sx={{ display: "flex", justifyContent: "center", gap: 2 }}>
          <Button
            variant="contained"
            color="secondary"
            size="large"
            onClick={() => navigateToTab("properties")}
          >
            Get Started
          </Button>
        </Box>
      </Box>
    </>
  );
};

export default App;
