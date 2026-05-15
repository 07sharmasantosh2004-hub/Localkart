/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type LocationSource = "gps" | "manual" | "none";
export type LocationPermissionState = "idle" | "prompt" | "granted" | "denied" | "unsupported";

export interface SelectedLocation {
  lat?: number;
  lng?: number;
  area?: string;
  city?: string;
  state?: string;
  pincode?: string;
  label: string;
  source: LocationSource;
}

interface LocationContextValue {
  location: SelectedLocation | null;
  loading: boolean;
  error: string | null;
  permission: LocationPermissionState;
  manualModalOpen: boolean;
  displayLabel: string;
  searchTerm: string;
  requestCurrentLocation: () => Promise<void>;
  saveManualLocation: (value: string) => void;
  openManualLocation: () => void;
  closeManualLocation: () => void;
}

const STORAGE_KEY = "localkart.selectedLocation";
const LocationContext = createContext<LocationContextValue | undefined>(undefined);

function readStoredLocation() {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as SelectedLocation) : null;
  } catch {
    return null;
  }
}

function persistLocation(location: SelectedLocation | null) {
  if (typeof window === "undefined") return;
  if (!location) {
    window.localStorage.removeItem(STORAGE_KEY);
    return;
  }
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(location));
}

function parseManualLocation(value: string): SelectedLocation {
  const parts = value.split(",").map((part) => part.trim()).filter(Boolean);
  const pincode = value.match(/\b\d{6}\b/)?.[0];
  const [area, city] = parts;
  return {
    area: area || value.trim(),
    city: city || undefined,
    pincode,
    label: value.trim(),
    source: "manual",
  };
}

function formatAddress(address: {
  suburb?: string;
  neighbourhood?: string;
  quarter?: string;
  city?: string;
  town?: string;
  village?: string;
  state?: string;
  postcode?: string;
}) {
  const area = address.suburb || address.neighbourhood || address.quarter;
  const city = address.city || address.town || address.village;
  return {
    area,
    city,
    state: address.state,
    pincode: address.postcode,
    label: [area, city || address.state, address.postcode].filter(Boolean).join(", "),
  };
}

async function reverseGeocode(lat: number, lng: number): Promise<Partial<SelectedLocation> & { label: string } | null> {
  const provider = import.meta.env.VITE_REVERSE_GEOCODING_PROVIDER || "nominatim";
  if (provider === "none") return null;

  if (provider !== "nominatim") return null;

  const response = await fetch(
    `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&addressdetails=1`,
    { headers: { Accept: "application/json" } },
  );
  if (!response.ok) throw new Error("Could not reverse-geocode your location.");
  const data = (await response.json()) as { display_name?: string; address?: Parameters<typeof formatAddress>[0] };
  const parsed = data.address ? formatAddress(data.address) : null;
  return parsed?.label ? parsed : { label: data.display_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}` };
}

export function LocationProvider({ children }: { children: ReactNode }) {
  const [location, setLocation] = useState<SelectedLocation | null>(() => readStoredLocation());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [permission, setPermission] = useState<LocationPermissionState>("idle");
  const [manualModalOpen, setManualModalOpen] = useState(false);

  useEffect(() => {
    persistLocation(location);
  }, [location]);

  useEffect(() => {
    if (typeof navigator === "undefined" || !navigator.permissions?.query) return;
    navigator.permissions
      .query({ name: "geolocation" })
      .then((status) => {
        setPermission(status.state);
        status.onchange = () => setPermission(status.state);
      })
      .catch(() => undefined);
  }, []);

  const requestCurrentLocation = useCallback(async () => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setPermission("unsupported");
      setError("Location is not supported in this browser. Enter city, area or pincode manually.");
      setManualModalOpen(true);
      return;
    }

    setLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        try {
          const address = await reverseGeocode(lat, lng);
          setLocation({
            lat,
            lng,
            area: address?.area,
            city: address?.city,
            state: address?.state,
            pincode: address?.pincode,
            label: address?.label || `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
            source: "gps",
          });
        } catch {
          setLocation({
            lat,
            lng,
            label: `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
            source: "gps",
          });
          setError("GPS detected. Address lookup is unavailable, so nearby search will use coordinates.");
        } finally {
          setPermission("granted");
          setManualModalOpen(false);
          setLoading(false);
        }
      },
      (geoError) => {
        setPermission(geoError.code === geoError.PERMISSION_DENIED ? "denied" : "prompt");
        setError("Location permission was denied. Enter city, area or pincode to see relevant providers.");
        setManualModalOpen(true);
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 1000 * 60 * 10 },
    );
  }, []);

  const saveManualLocation = useCallback((value: string) => {
    const trimmed = value.trim();
    if (!trimmed) {
      setError("Enter a city, area or pincode.");
      return;
    }
    setLocation(parseManualLocation(trimmed));
    setError(null);
    setManualModalOpen(false);
  }, []);

  const value = useMemo<LocationContextValue>(
    () => ({
      location,
      loading,
      error,
      permission,
      manualModalOpen,
      displayLabel: location?.label || "Choose location",
      searchTerm: [location?.area, location?.city, location?.pincode].filter(Boolean).join(" ") || location?.label || "",
      requestCurrentLocation,
      saveManualLocation,
      openManualLocation: () => setManualModalOpen(true),
      closeManualLocation: () => setManualModalOpen(false),
    }),
    [error, loading, location, manualModalOpen, permission, requestCurrentLocation, saveManualLocation],
  );

  return <LocationContext.Provider value={value}>{children}</LocationContext.Provider>;
}

export function useLocationContext() {
  const context = useContext(LocationContext);
  if (!context) throw new Error("useLocationContext must be used inside LocationProvider");
  return context;
}
