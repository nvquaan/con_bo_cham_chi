
import { CheckType } from './types';

/**
 * Generates a random time string (HH:mm:ss) based on attendance type
 * Check-in: 08:13:00 - 08:29:59
 * Check-out: 17:33:00 - 18:14:59
 */
export const generateRandomTime = (type: CheckType): string => {
  let startSeconds: number;
  let endSeconds: number;

  if (type === CheckType.IN) {
    // 08:13:00 to 08:29:59
    startSeconds = 8 * 3600 + 13 * 60;
    endSeconds = 8 * 3600 + 29 * 60 + 59;
  } else {
    // 17:33:00 to 18:14:59
    startSeconds = 17 * 3600 + 33 * 60;
    endSeconds = 18 * 3600 + 14 * 60 + 59;
  }

  const randomSeconds = Math.floor(Math.random() * (endSeconds - startSeconds + 1)) + startSeconds;
  
  const h = Math.floor(randomSeconds / 3600);
  const m = Math.floor((randomSeconds % 3600) / 60);
  const s = randomSeconds % 60;

  return [h, m, s].map(v => v.toString().padStart(2, '0')).join(':');
};

/**
 * Formats a date object and time string to DD-MM-YYYY HH:mm:ss
 */
export const formatPayloadDate = (date: string, time: string): string => {
  const [year, month, day] = date.split('-');
  return `${day}-${month}-${year} ${time}`;
};

/**
 * Gets today's date in YYYY-MM-DD for input[type="date"]
 */
export const getTodayString = (): string => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};
