import { useState, useEffect } from 'react';

export function useGeolocation() {
  const geolocationSupported = typeof navigator !== 'undefined' && 'geolocation' in navigator;
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [error, setError] = useState<string | null>(
    geolocationSupported ? null : 'Geolocation is not supported by your browser',
  );
  const [loading, setLoading] = useState(geolocationSupported);

  useEffect(() => {
    if (!geolocationSupported) {
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setLoading(false);
      },
      (error) => {
        setError(error.message);
        setLoading(false);
      }
    );
  }, [geolocationSupported]);

  return { location, error, loading };
}
