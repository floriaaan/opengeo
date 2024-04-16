import "@/styles/globals.css";

import NextTopLoader from "nextjs-toploader";

import type { AppProps } from "next/app";

import { AppLayout } from "@components/layouts";

import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { Providers } from "@components/providers";
import { useRouter } from "next/router";

/**
 * A React component that serves as the root component for the application.
 *
 * @remarks The component wraps the `Component` prop with the `AppLayout` component, which provides a layout for the application. The component also includes the `AuthProvider`, `CookiesProvider`, `Head`, `Toaster`, and `Logger` components. The `Head` component sets the title and meta description for the application. The `Toaster` component provides a notification system for the application. The `Logger` component logs errors and warnings to the console.
 *
 * @param Component - The component to render.
 * @param pageProps - The props to pass to the component.
 *
 * @returns A React component that serves as the root component for the application.
 */
export default function App({ Component, pageProps }: AppProps) {
  const { query } = useRouter();

  if (query.mode === "print") return <Component {...pageProps} />;

  return (
    <Providers>
      <AppLayout>
        <NextTopLoader color="hsl(var(--primary))" showSpinner={false} />
        <Component {...pageProps} />
      </AppLayout>

      <SonnerToaster richColors position="bottom-left" />
    </Providers>
  );
}
