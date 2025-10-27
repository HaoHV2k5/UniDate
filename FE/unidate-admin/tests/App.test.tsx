import React from 'react';
import { render, screen } from '@testing-library/react';
import App from '../src/App';

describe('App Component', () => {
  test('renders the header', () => {
    render(<App />);
    const headerElement = screen.getByText(/header text/i); // Replace with actual header text
    expect(headerElement).toBeInTheDocument();
  });

  test('renders the sidebar', () => {
    render(<App />);
    const sidebarElement = screen.getByText(/sidebar text/i); // Replace with actual sidebar text
    expect(sidebarElement).toBeInTheDocument();
  });

  test('renders the dashboard page', () => {
    render(<App />);
    const dashboardElement = screen.getByText(/dashboard/i); // Replace with actual dashboard text
    expect(dashboardElement).toBeInTheDocument();
  });
});