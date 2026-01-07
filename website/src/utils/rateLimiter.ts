/**
 * Rate limiter for email sending
 * Limits users to 3 emails per JST day (Japan Standard Time, UTC+9)
 */

const STORAGE_KEY = 'email_send_history';
const MAX_EMAILS_PER_DAY = 3;
const JST_OFFSET_HOURS = 9;

interface EmailSendRecord {
  timestamp: number; // Unix timestamp in milliseconds
}

/**
 * Helper function to convert a Date to JST date string (YYYY-MM-DD)
 * Note: Japan doesn't observe DST, so a fixed UTC+9 offset is correct
 */
function toJSTDateString(date: Date): string {
  const jstTime = new Date(date.getTime() + JST_OFFSET_HOURS * 60 * 60 * 1000);
  const year = jstTime.getUTCFullYear();
  const month = String(jstTime.getUTCMonth() + 1).padStart(2, '0');
  const day = String(jstTime.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Get the current JST date string (YYYY-MM-DD)
 */
function getCurrentJSTDate(): string {
  return toJSTDateString(new Date());
}

/**
 * Get the JST date string from a timestamp
 */
function getJSTDateFromTimestamp(timestamp: number): string {
  return toJSTDateString(new Date(timestamp));
}

/**
 * Get email send history from localStorage
 */
function getEmailHistory(): EmailSendRecord[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return [];
    }
    return JSON.parse(stored) as EmailSendRecord[];
  } catch (error) {
    console.error('Error reading email history from localStorage:', error);
    return [];
  }
}

/**
 * Save email send history to localStorage
 */
function saveEmailHistory(history: EmailSendRecord[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  } catch (error) {
    console.error('Error saving email history to localStorage:', error);
  }
}

/**
 * Clean up old records from previous days (JST)
 */
function cleanupOldRecords(history: EmailSendRecord[]): EmailSendRecord[] {
  const currentJSTDate = getCurrentJSTDate();
  return history.filter(record => {
    const recordJSTDate = getJSTDateFromTimestamp(record.timestamp);
    return recordJSTDate === currentJSTDate;
  });
}

/**
 * Check if user can send an email (under the daily limit)
 * Returns true if allowed, false if limit exceeded
 */
export function canSendEmail(): boolean {
  const history = getEmailHistory();
  const todayHistory = cleanupOldRecords(history);
  return todayHistory.length < MAX_EMAILS_PER_DAY;
}

/**
 * Get the number of emails sent today (JST)
 */
export function getEmailsSentToday(): number {
  const history = getEmailHistory();
  const todayHistory = cleanupOldRecords(history);
  return todayHistory.length;
}

/**
 * Get remaining email sends for today
 */
export function getRemainingEmailSends(): number {
  const sent = getEmailsSentToday();
  return Math.max(0, MAX_EMAILS_PER_DAY - sent);
}

/**
 * Record a successful email send
 */
export function recordEmailSent(): void {
  const history = getEmailHistory();
  const todayHistory = cleanupOldRecords(history);
  
  // Add new record with current timestamp
  todayHistory.push({ timestamp: Date.now() });
  
  // Save the cleaned up history with new record
  saveEmailHistory(todayHistory);
}

/**
 * Get the maximum number of emails allowed per day
 */
export function getMaxEmailsPerDay(): number {
  return MAX_EMAILS_PER_DAY;
}
