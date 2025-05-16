// Cache clearing utility
// This is used to force a refresh of data when we know it has changed
// (for example after a transaction)

// Event listeners for cache invalidation
const listeners: (() => void)[] = [];

/**
 * Invalidates all data caches and forces components to refetch data
 */
export function invalidateDataCache(): void {
  console.log("Invalidating data cache and notifying all listeners");
  // Notify all listeners
  listeners.forEach((listener) => listener());
}

/**
 * Add a listener to be notified when data cache is invalidated
 * @param listener Function to call when cache is invalidated
 * @returns Function to remove the listener
 */
export function addDataRefreshListener(listener: () => void): () => void {
  listeners.push(listener);

  // Return a function to remove the listener
  return () => {
    const index = listeners.indexOf(listener);
    if (index > -1) {
      listeners.splice(index, 1);
    }
  };
}

// Used with the refresh button component
export function triggerDataRefresh(): void {
  invalidateDataCache();
}
