import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from './App';

describe('App Component', () => {
  it('renders the application title', () => {
    render(<App />);
    const titleElement = screen.getByText('Hex Layout Toolkit');
    expect(titleElement).toBeInTheDocument();
  });

  it('shows frontend setup complete message', () => {
    render(<App />);
    const setupMessage = screen.getByText('🎯 Frontend Setup Complete!');
    expect(setupMessage).toBeInTheDocument();
  });

  it('displays React version information', () => {
    render(<App />);
    const reactVersion = screen.getByText('18.2.0');
    expect(reactVersion).toBeInTheDocument();
  });

  it('shows backend API URL', () => {
    render(<App />);
    const apiUrl = screen.getByText('http://localhost:8000');
    expect(apiUrl).toBeInTheDocument();
  });
});
