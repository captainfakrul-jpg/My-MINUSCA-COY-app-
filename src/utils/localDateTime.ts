/**
 * Helper to retrieve formatted local date and time from the client device
 */

export function getDeviceLocalDateTime(d: Date = new Date()): {
  date: string;
  time: string;
  dateTime: string;
  isoLocal: string;
} {
  const date = new Intl.DateTimeFormat(undefined, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(d);

  const time = new Intl.DateTimeFormat(undefined, {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).format(d);

  // Short time without seconds (hh:mm)
  const shortTime = new Intl.DateTimeFormat(undefined, {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(d);

  return {
    date,
    time,
    dateTime: `${date} ${time}`,
    isoLocal: `${date} ${shortTime}`,
  };
}
