"use client";

import { ThemeProvider } from "next-themes";
import { ApolloProvider } from "@apollo/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SessionProvider } from "next-auth/react";
import { useState } from "react";
import { apolloClient } from "@/lib/apollo-client";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      <SessionProvider>
        <QueryClientProvider client={queryClient}>
          <ApolloProvider client={apolloClient}>{children}</ApolloProvider>
        </QueryClientProvider>
      </SessionProvider>
    </ThemeProvider>
  );
}
