import { useFetch } from "@/hooks/useFetch";
import { useKonami } from "@/hooks/useKonami";
import { UserPreferencesDocument } from "@/models/UserPreferences";
import { APIResult } from "@/types/api";
import { ReactNode, createContext, useContext, useEffect, useMemo } from "react";

type PreferencesContextType = {
  preferences: UserPreferencesDocument | null | undefined;
  revalidate: () => void;
};

const PreferencesContext = createContext<PreferencesContextType>({
  preferences: undefined,
  revalidate: () => {},
});

export const usePreferences = () => {
  const context = useContext(PreferencesContext);
  if (context === undefined) throw new Error("usePreferences must be used within a PreferencesProvider");

  return context;
};

export const PreferencesProvider = ({ children }: { children: ReactNode }) => {
  const { data: api, revalidate } = useFetch<APIResult<UserPreferencesDocument>>("/api/user/preferences");
  const preferences = useMemo(() => api?.data, [api]);
  const { ee } = useKonami();

  useEffect(() => {
    if (ee) fetch("/api/user/preferences/dev").then(revalidate);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ee]);

  return (
    <PreferencesContext.Provider
      value={{
        preferences,
        revalidate,
      }}
    >
      {children}
    </PreferencesContext.Provider>
  );
};
