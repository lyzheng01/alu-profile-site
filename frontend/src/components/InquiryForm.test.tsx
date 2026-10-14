import '@testing-library/jest-dom';
import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import InquiryForm from './InquiryForm';

jest.mock('../contexts/TranslationContext', () => ({
  useTranslation: () => ({
    t: (_key: string, fallback?: string) => fallback || '',
  }),
}));

test('includes the selected country in the submitted inquiry message', async () => {
  const mockFetch = jest.fn().mockResolvedValue({ ok: true, json: async () => ({}) });
  global.fetch = mockFetch as unknown as typeof fetch;

  render(<InquiryForm />);
  fireEvent.change(screen.getByLabelText(/^Name/), { target: { value: 'Alex Buyer' } });
  fireEvent.change(screen.getByLabelText(/^Email/), { target: { value: 'alex@example.com' } });
  fireEvent.change(screen.getByLabelText(/^Country/), { target: { value: 'Chile' } });
  fireEvent.change(screen.getByLabelText(/^Subject/), { target: { value: 'T-slot profile inquiry' } });
  fireEvent.change(screen.getByLabelText(/^Your Message/), { target: { value: 'Please review the attached dimensions.' } });
  fireEvent.click(screen.getByRole('button', { name: 'Submit Inquiry' }));

  await waitFor(() => expect(mockFetch).toHaveBeenCalledTimes(1));
  const request = JSON.parse(mockFetch.mock.calls[0][1].body);
  expect(request.message).toContain('Please review the attached dimensions.');
  expect(request.message).toContain('Country: Chile');
});
