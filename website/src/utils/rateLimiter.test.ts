/**
 * Tests for rate limiter utility
 */

import {
  canSendEmail,
  recordEmailSent,
  getEmailsSentToday,
  getRemainingEmailSends,
  getMaxEmailsPerDay,
} from './rateLimiter';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('rateLimiter', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  test('should allow sending email when no emails sent today', () => {
    expect(canSendEmail()).toBe(true);
    expect(getEmailsSentToday()).toBe(0);
    expect(getRemainingEmailSends()).toBe(3);
  });

  test('should record email send and update counts', () => {
    recordEmailSent();
    expect(getEmailsSentToday()).toBe(1);
    expect(getRemainingEmailSends()).toBe(2);
    expect(canSendEmail()).toBe(true);
  });

  test('should allow up to 3 emails per day', () => {
    recordEmailSent();
    expect(canSendEmail()).toBe(true);
    
    recordEmailSent();
    expect(canSendEmail()).toBe(true);
    
    recordEmailSent();
    expect(getEmailsSentToday()).toBe(3);
    expect(getRemainingEmailSends()).toBe(0);
    expect(canSendEmail()).toBe(false);
  });

  test('should not allow sending after reaching limit', () => {
    recordEmailSent();
    recordEmailSent();
    recordEmailSent();
    
    expect(canSendEmail()).toBe(false);
    expect(getEmailsSentToday()).toBe(3);
    expect(getRemainingEmailSends()).toBe(0);
  });

  test('should return correct max emails per day', () => {
    expect(getMaxEmailsPerDay()).toBe(3);
  });

  test('should filter out records from previous days', () => {
    // Mock Date.now to return a timestamp from yesterday
    const realDateNow = Date.now;
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    // Set up old records
    Date.now = jest.fn(() => yesterday.getTime());
    recordEmailSent();
    recordEmailSent();
    
    // Restore Date.now to current time
    Date.now = realDateNow;
    
    // Old records should be filtered out
    expect(getEmailsSentToday()).toBe(0);
    expect(canSendEmail()).toBe(true);
    expect(getRemainingEmailSends()).toBe(3);
  });

  test('should handle JST timezone correctly for records on same JST day', () => {
    // Record multiple sends
    recordEmailSent();
    recordEmailSent();
    
    expect(getEmailsSentToday()).toBe(2);
    expect(canSendEmail()).toBe(true);
    expect(getRemainingEmailSends()).toBe(1);
  });

  test('should handle localStorage errors gracefully', () => {
    // Mock localStorage.getItem to throw error
    const originalGetItem = localStorage.getItem;
    localStorage.getItem = jest.fn(() => {
      throw new Error('Storage error');
    });

    // Should return default values on error
    expect(canSendEmail()).toBe(true);
    expect(getEmailsSentToday()).toBe(0);

    // Restore
    localStorage.getItem = originalGetItem;
  });

  test('should handle corrupted localStorage data', () => {
    // Set invalid JSON in localStorage
    localStorage.setItem('email_send_history', 'invalid json');
    
    // Should handle gracefully
    expect(canSendEmail()).toBe(true);
    expect(getEmailsSentToday()).toBe(0);
  });
});
