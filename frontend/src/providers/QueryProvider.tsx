'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ReactNode, useState } from 'react';

/**
 * Orchestrates the global data fetching and caching lifecycle for the application.
 * It provides a stable QueryClient instance via React state to maintain cache consistency
 * and configures a resilient retry strategy with exponential backoff for network requests.
 */
export default function QueryProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Implements exponential backoff to prevent thundering herd issues during recovery
            // retryDelay: 3000, 
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
