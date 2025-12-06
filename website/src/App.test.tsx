import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from './App';

// Mock window.AppConfig
(window as any).AppConfig = {
  API_ENDPOINT: 'https://test-api.example.com'
};

test('renders time capsule mail form', () => {
  render(<App />);
  const headingElement = screen.getByText(/タイムカプセルメール/i);
  expect(headingElement).toBeInTheDocument();
});

test('modal opens after successful form submission', async () => {
  // Mock fetch
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ success: true }),
    })
  ) as jest.Mock;

  render(<App />);
  
  // Fill in the form
  const titleInput = screen.getByLabelText(/タイトル/i);
  const bodyInput = screen.getByLabelText(/メッセージ/i);
  const emailInput = screen.getByLabelText(/メールアドレス/i);
  
  fireEvent.change(titleInput, { target: { value: 'Test Title' } });
  fireEvent.change(bodyInput, { target: { value: 'Test Body' } });
  fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
  
  // Submit the form
  const submitButton = screen.getByRole('button', { name: /メール送信予約/i });
  fireEvent.click(submitButton);
  
  // Wait for modal to appear
  await waitFor(() => {
    expect(screen.getByText(/送信完了/i)).toBeInTheDocument();
  });
  
  // Check modal content
  expect(screen.getByText(/メールの送信予約が完了しました/i)).toBeInTheDocument();
  
  // Check close button exists
  const closeButton = screen.getByRole('button', { name: /閉じる/i });
  expect(closeButton).toBeInTheDocument();
  
  // Click close button
  fireEvent.click(closeButton);
  
  // Modal should close
  await waitFor(() => {
    expect(screen.queryByText(/送信完了/i)).not.toBeInTheDocument();
  });
});
