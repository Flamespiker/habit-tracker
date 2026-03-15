// 'use client' required: NextThemesProvider uses React context and browser APIs (localStorage)
// to persist and apply the active theme.
"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider, type ThemeProviderProps } from "next-themes"

/**
 * Wraps the app with next-themes' provider for light/dark/system theme support.
 * Place this near the root layout, outside any Server Component data-fetching boundaries.
 */
export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}

export default ThemeProvider
