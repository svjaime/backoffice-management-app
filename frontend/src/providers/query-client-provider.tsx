"use client";

import {
  QueryClient,
  QueryClientProvider as TQueryClientProvider,
} from "@tanstack/react-query";
import { PropsWithChildren } from "react";

const queryClient = new QueryClient();

export default function QueryClientProvider({ children }: PropsWithChildren) {
  return (
    <TQueryClientProvider client={queryClient}>{children}</TQueryClientProvider>
  );
}
