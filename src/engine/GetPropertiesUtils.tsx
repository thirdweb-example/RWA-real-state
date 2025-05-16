import { rwaContract } from "./RWAcontract";
import { readContract } from "thirdweb";

// Define the Property type based on the contract structure
export type Property = {
  propertyAddress: string;
  price: bigint;
  squareMeters: bigint;
  legalIdentifier: string;
  documentHash: string; // IPFS hash of legal documents
  state: number;
  verifier: string;
  imageURI: string; // IPFS URI pointing to the property image
};

/**
 * Get the total number of properties in the RealEstateRWA contract
 * @returns The total number of properties as a bigint
 */
export const getTotalProperties = async (): Promise<bigint> => {
  try {
    const totalProperties = await readContract({
      contract: rwaContract,
      method: "function getTotalProperties() view returns (uint256)",
      params: [],
    });

    return totalProperties;
  } catch (error) {
    console.error("Error fetching total properties:", error);
    throw error;
  }
};

/**
 * Get details of a specific property by its ID
 * @param tokenId The ID of the property to fetch
 * @returns Property details
 */
export const getProperty = async (tokenId: bigint): Promise<Property> => {
  try {
    const property = await readContract({
      contract: rwaContract,
      method:
        "function getProperty(uint256) view returns ((string,uint256,uint256,string,string,uint8,address,string))",
      params: [tokenId],
    });

    // Convert the returned tuple to an object with named properties
    // The contract returns a struct which comes through as a tuple with numbered indices
    const propertyWithNamedFields = {
      propertyAddress: property[0],
      price: property[1],
      squareMeters: property[2],
      legalIdentifier: property[3],
      documentHash: property[4],
      state: property[5],
      verifier: property[6],
      imageURI: property[7], // In contract this is tokenURI, but we rename for clarity
    };

    return propertyWithNamedFields;
  } catch (error) {
    console.error(`Error fetching property ${tokenId}:`, error);
    throw error;
  }
};

/**
 * Get all properties registered in the RealEstateRWA contract
 * @returns Array of all properties
 */
export const getAllProperties = async (): Promise<Property[]> => {
  try {
    const properties = await readContract({
      contract: rwaContract,
      method:
        "function getAllProperties() view returns ((string,uint256,uint256,string,string,uint8,address,string)[])",
      params: [],
    });

    // Map each property tuple to our Property type with named fields
    const propertiesWithNamedFields = Array.isArray(properties)
      ? properties.map((property) => ({
          propertyAddress: property[0],
          price: property[1],
          squareMeters: property[2],
          legalIdentifier: property[3],
          documentHash: property[4],
          state: property[5],
          verifier: property[6],
          imageURI: property[7], // In contract this is tokenURI, but we rename for clarity
        }))
      : [];

    return propertiesWithNamedFields;
  } catch (error) {
    console.error("Error fetching all properties:", error);
    throw error;
  }
};

/**
 * Example usage function that demonstrates how to use all property getters
 */
export const demonstratePropertyGetters = async () => {
  try {
    // 1. Get total properties
    const totalProperties = await getTotalProperties();
    console.log(`Total properties: ${totalProperties}`);

    // 2. Get all properties
    const allProperties = await getAllProperties();
    console.log("All properties:", allProperties);

    // 3. If properties exist, get details of the first one
    if (totalProperties > 0n) {
      const firstProperty = await getProperty(1n);
      console.log("First property details:", firstProperty);
    }

    return {
      totalProperties,
      allProperties,
    };
  } catch (error) {
    console.error("Error in property getters demonstration:", error);
    throw error;
  }
};
