import { AuthProvider } from "@/hooks/useAuth";
import { NotificationsProvider } from "@/hooks/useNotification";
import { PreferencesProvider } from "@/hooks/usePreferences";
import { ErrorBoundaryProvider } from "@components/helpers/error/boundary";
import { ReactNode } from "react";
import { CookiesProvider } from "react-cookie";

export const Providers = ({ children }: { children: ReactNode }) => {
  return (
    <>
      <ErrorBoundaryProvider>
        <CookiesProvider>
          <AuthProvider>
            <NotificationsProvider>
              <PreferencesProvider>{children}</PreferencesProvider>
            </NotificationsProvider>
          </AuthProvider>
        </CookiesProvider>
      </ErrorBoundaryProvider>
    </>
  );
};
