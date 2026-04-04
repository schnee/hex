import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from './App';
import { PatternContextProvider } from './context/PatternContext';

const renderApp = () =>
  render(
    <PatternContextProvider>
      <App />
    </PatternContextProvider>
  );

describe('App Component', () => {
  it('renders the application title', () => {
    renderApp();
    const titleElement = screen.getByText('Hex Layout Toolkit');
    expect(titleElement).toBeInTheDocument();
  });

  it('shows workspace subtitle', () => {
    renderApp();
    expect(screen.getByText('Pattern + Overlay Workspace')).toBeInTheDocument();
  });

  it('renders generator and overlay navigation links', () => {
    renderApp();
    expect(screen.getByRole('link', { name: 'Generator' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Overlay' })).toBeInTheDocument();
  });

  it('defaults to the generator workspace route', () => {
    renderApp();
    expect(screen.getByText('Pattern Generator')).toBeInTheDocument();
  });
});
