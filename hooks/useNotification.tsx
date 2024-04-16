import { useAuth } from "@/hooks/useAuth";
import { usePathname } from "next/navigation";
import { ReactNode, createContext, useContext, useEffect, useState } from "react";

type Notifications = { habilitations_pending: number; suggestions_pending: number };

const DEFAULT_NOTIFICATIONS = { habilitations_pending: 0, suggestions_pending: 0 };
const NotificationsContext = createContext({ notifications: DEFAULT_NOTIFICATIONS });

export const NotificationsProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const asPath = usePathname();
  const [notifications, setNotifications] = useState<Notifications>(DEFAULT_NOTIFICATIONS);

  useEffect(() => {
    if (!user) return;

    fetch("/api/user/notification")
      .then((res) => res.json())
      .then((b) => {
        setNotifications({
          habilitations_pending: b.h,
          suggestions_pending: b.s,
        });
      });
  }, [asPath, user]);

  return <NotificationsContext.Provider value={{ notifications }}>{children}</NotificationsContext.Provider>;
};

export const useNotifications = () => useContext(NotificationsContext);
