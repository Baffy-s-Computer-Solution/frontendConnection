// frontend/src/test/utils/test-utils.jsx
// ============================================================
// Custom Test Utilities - Production Ready
// ============================================================
import React from 'react';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from '../../context/ThemeContext';
import { AuthProvider } from '../../context/AuthContext';
import { NotificationProvider } from '../../context/NotificationContext';

/**
 * Creates a fresh QueryClient for each test
 */
export const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
        staleTime: 0,
        refetchOnWindowFocus: false,
      },
      mutations: {
        retry: false,
      },
    },
    logger: {
      log: console.log,
      warn: console.warn,
      error: () => {},
    },
  });

/**
 * All providers wrapper
 */
export const AllTheProviders = ({ children, queryClient }) => {
  const client = queryClient || createTestQueryClient();
  return (
    <QueryClientProvider client={client}>
      <BrowserRouter>
        <ThemeProvider>
          <AuthProvider>
            <NotificationProvider>{children}</NotificationProvider>
          </AuthProvider>
        </ThemeProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

/**
 * Custom render with all providers
 */
const customRender = (ui, options = {}) => {
  const { queryClient, ...renderOptions } = options;
  const Wrapper = ({ children }) => (
    <AllTheProviders queryClient={queryClient}>{children}</AllTheProviders>
  );
  return {
    user: userEvent.setup(),
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
  };
};

/**
 * Render with only router
 */
export const renderWithRouter = (ui, { route = '/' } = {}) => {
  window.history.pushState({}, 'Test page', route);
  return {
    user: userEvent.setup(),
    ...render(ui, { wrapper: BrowserRouter }),
  };
};

/**
 * Render with only query client
 */
export const renderWithQueryClient = (ui, options = {}) => {
  const queryClient = options.queryClient || createTestQueryClient();
  const Wrapper = ({ children }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return {
    user: userEvent.setup(),
    queryClient,
    ...render(ui, { wrapper: Wrapper, ...options }),
  };
};

// Re-export everything
export * from '@testing-library/react';
export { customRender as render, userEvent };
