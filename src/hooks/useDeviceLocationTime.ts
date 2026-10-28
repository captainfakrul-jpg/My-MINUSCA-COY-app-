import { useState, useEffect } from 'react';

export interface DeviceLocationTime {
  date: Date;
  formattedDate: string;
  formattedTime: string;
  formattedDateTime: string;
  timezone: string;
  coords: {
    latitude: number;
    longitude: number;
    accuracy?: number;
  } | null;
  locationStatus: 'detecting' | 'acquired' | 'fallback';
}

export function useDeviceLocationTime(): DeviceLocationTime {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [coords, setCoords] = useState<{ latitude: number; longitude: number; accuracy?: number } | null>(null);
  const [locationStatus, setLocationStatus] = useState<'detecting' | 'acquired' | 'fallback'>('detecting');

  // Live timer tick every 1000ms
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDate(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Request device geolocation
  useEffect(() => {
    if (typeof navigator !== 'undefined' && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCoords({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
          });
          setLocationStatus('acquired');
        },
        (_err) => {
          // Fallback to device system clock and locale
          setLocationStatus('fallback');
        },
        {
          enableHighAccuracy: true,
          timeout: 8000,
          maximumAge: 30000,
        }
      );
    } else {
      setLocationStatus('fallback');
    }
  }, []);

  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Local';

  // Format date: e.g. "17 Oct 2026"
  const formattedDate = new Intl.DateTimeFormat(undefined, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(currentDate);

  // Format time: e.g. "14:09:42" (24-hr local time with seconds)
  const formattedTime = new Intl.DateTimeFormat(undefined, {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).format(currentDate);

  const formattedDateTime = `${formattedDate} ${formattedTime} LT`;

  return {
    date: currentDate,
    formattedDate,
    formattedTime,
    formattedDateTime,
    timezone,
    coords,
    locationStatus,
  };
}
