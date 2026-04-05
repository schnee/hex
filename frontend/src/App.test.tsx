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
    expect(
      screen.getByText('Upload + Generate + Overlay Workspace')
    ).toBeInTheDocument();
  });

  it('renders single-screen workspace sections without route links', () => {
    renderApp();
    expect(screen.getByTestId('workspace-shell')).toBeInTheDocument();
    expect(
      screen.queryByRole('link', { name: /generator/i })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('link', { name: /overlay/i })
    ).not.toBeInTheDocument();
  });

  it('defaults to the generator workspace route', () => {
    renderApp();
    expect(screen.getByText('Pattern Generator')).toBeInTheDocument();
  });
});
