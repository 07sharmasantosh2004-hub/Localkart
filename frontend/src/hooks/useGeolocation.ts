import { useLocationContext } from "../context/LocationContext";

export function useGeolocation() {
  const { location, error, loading, requestCurrentLocation, searchTerm, displayLabel } = useLocationContext();
  return {
    location:
      typeof location?.lat === "number" && typeof location.lng === "number"
        ? { lat: location.lat, lng: location.lng }
        : null,
    selectedLocation: location,
    error,
    loading,
    searchTerm,
    displayLabel,
    requestCurrentLocation,
  };
}
