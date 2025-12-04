import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import App from './App';

test('renders タイムカプセルメール heading', () => {
  render(<App />);
  const headingElement = screen.getByText(/タイムカプセルメール/i);
  expect(headingElement).toBeInTheDocument();
});

test('title field shows character count', () => {
  render(<App />);
  const titleInput = screen.getByLabelText(/タイトル/i);
  expect(screen.getByText(/0\/50文字/i)).toBeInTheDocument();
  
  fireEvent.change(titleInput, { target: { value: 'Test Title' } });
  expect(screen.getByText(/10\/50文字/i)).toBeInTheDocument();
});

test('title field shows error when exceeding max length', () => {
  render(<App />);
  const titleInput = screen.getByLabelText(/タイトル/i);
  const longTitle = 'a'.repeat(51);
  
  fireEvent.change(titleInput, { target: { value: longTitle } });
  expect(screen.getByText(/51\/50文字 \(上限を超えています\)/i)).toBeInTheDocument();
});

test('body field shows character count', () => {
  render(<App />);
  const bodyInput = screen.getByLabelText(/メッセージ/i);
  expect(screen.getByText(/0\/1000文字/i)).toBeInTheDocument();
  
  fireEvent.change(bodyInput, { target: { value: 'Test Body' } });
  expect(screen.getByText(/9\/1000文字/i)).toBeInTheDocument();
});

test('body field shows error when exceeding max length', () => {
  render(<App />);
  const bodyInput = screen.getByLabelText(/メッセージ/i);
  const longBody = 'a'.repeat(1001);
  
  fireEvent.change(bodyInput, { target: { value: longBody } });
  expect(screen.getByText(/1001\/1000文字 \(上限を超えています\)/i)).toBeInTheDocument();
});

test('submit button is disabled when title exceeds max length', () => {
  render(<App />);
  const titleInput = screen.getByLabelText(/タイトル/i);
  const bodyInput = screen.getByLabelText(/メッセージ/i);
  const emailInput = screen.getByLabelText(/メールアドレス/i);
  const submitButton = screen.getByRole('button', { name: /メール送信予約/i });
  
  fireEvent.change(titleInput, { target: { value: 'a'.repeat(51) } });
  fireEvent.change(bodyInput, { target: { value: 'Test Body' } });
  fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
  
  expect(submitButton).toBeDisabled();
});

test('submit button is disabled when body exceeds max length', () => {
  render(<App />);
  const titleInput = screen.getByLabelText(/タイトル/i);
  const bodyInput = screen.getByLabelText(/メッセージ/i);
  const emailInput = screen.getByLabelText(/メールアドレス/i);
  const submitButton = screen.getByRole('button', { name: /メール送信予約/i });
  
  fireEvent.change(titleInput, { target: { value: 'Test Title' } });
  fireEvent.change(bodyInput, { target: { value: 'a'.repeat(1001) } });
  fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
  
  expect(submitButton).toBeDisabled();
});

test('submit button is enabled when all validations pass', () => {
  render(<App />);
  const titleInput = screen.getByLabelText(/タイトル/i);
  const bodyInput = screen.getByLabelText(/メッセージ/i);
  const emailInput = screen.getByLabelText(/メールアドレス/i);
  const submitButton = screen.getByRole('button', { name: /メール送信予約/i });
  
  fireEvent.change(titleInput, { target: { value: 'Valid Title' } });
  fireEvent.change(bodyInput, { target: { value: 'Valid Body' } });
  fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
  
  expect(submitButton).not.toBeDisabled();
});

