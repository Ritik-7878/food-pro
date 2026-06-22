"use client";

import { ThemeProvider } from "@/context/ThemeContext";
import { ToastProvider } from "@/components";

export default function Providers({ children }) {
  return (
    <ThemeProvider>
      <ToastProvider>
        {children}
      </ToastProvider>
    </ThemeProvider>
  );
}
