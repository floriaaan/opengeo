"use client";

import { canHaveAccess } from "@/hooks/useHabilitation";
import { useNotifications } from "@/hooks/useNotification";
import { createPersistedState } from "@/lib/use-persisted-state";
import { AdminResponsiveAlert } from "@components/admin/responsive-alert";
import { Sidebar } from "@components/layouts/admin/sidebar";
import { Badge } from "@components/ui/badge";

import {
  BackpackIcon,
  ClipboardIcon,
  CubeIcon,
  DashboardIcon,
  IdCardIcon,
  LockClosedIcon,
  MagicWandIcon,
  MixerVerticalIcon,
  Pencil1Icon,
} from "@radix-ui/react-icons";
import dynamic from "next/dynamic";
import { ReactNode, createContext, useContext } from "react";

const cls = { className: "w-4 h-4 shrink-0" };
const mainNavigation = [
  {
    label: "Général",
    value: [
      {
        name: "Tableau de bord",
        url: "/admin",
        icon: <MixerVerticalIcon {...cls} />,
      },
    ],
  },
  {
    label: "Plugins",
    value: [
      {
        name: "Gestion des objets",
        url: "/admin/plugins/generic-object",
        icon: <CubeIcon {...cls} />,
      },
      {
        name: "Gestion des sous-objets",
        url: "/admin/plugins/sub-object",
        icon: <DashboardIcon {...cls} />,
      },
      {
        name: "Fiches synthèse",
        url: "/admin/plugins/synthese",
        icon: <ClipboardIcon {...cls} />,
      },
      {
        name: "Suggestions de modif.",
        url: "/admin/plugins/suggestions",
        icon: <MagicWandIcon {...cls} />,
        badge: {
          normal: () => {
            // eslint-disable-next-line react-hooks/rules-of-hooks
            const { suggestions_pending } = useNotifications().notifications;
            return suggestions_pending ? (
              <Badge variant="destructive" className="ml-auto shadow-none">
                {suggestions_pending}
              </Badge>
            ) : (
              <></>
            );
          },
          collapsed: () => {
            // eslint-disable-next-line react-hooks/rules-of-hooks
            const { suggestions_pending } = useNotifications().notifications;
            return suggestions_pending ? (
              <div className="absolute z-50 flex items-center justify-center w-4 h-4 text-xs text-white rounded-full bg-amber-500 top-1 right-1">
                {suggestions_pending}
              </div>
            ) : (
              <></>
            );
          },
        },
      },
      {
        name: "Habilitations",
        url: "/admin/plugins/habilitations",
        icon: <LockClosedIcon {...cls} />,
        badge: {
          normal: () => {
            // eslint-disable-next-line react-hooks/rules-of-hooks
            const { habilitations_pending } = useNotifications().notifications;
            return habilitations_pending ? (
              <Badge variant="destructive" className="ml-auto shadow-none">
                {habilitations_pending}
              </Badge>
            ) : (
              <></>
            );
          },
          collapsed: () => {
            // eslint-disable-next-line react-hooks/rules-of-hooks
            const { habilitations_pending } = useNotifications().notifications;
            return habilitations_pending ? (
              <div className="absolute z-50 flex items-center justify-center w-4 h-4 text-xs text-white bg-red-500 rounded-full top-1 right-1">
                {habilitations_pending}
              </div>
            ) : (
              <></>
            );
          },
        },
      },
      {
        name: "Modification rapide",
        url: "/admin/plugins/quick-edit",
        icon: <Pencil1Icon {...cls} />,
      },
    ],
  },
  {
    label: "Administration",
    value: [
      {
        name: "Logs",
        url: "/admin/logs",
        icon: <IdCardIcon {...cls} />,
      },

      {
        name: "Tous les objets",
        url: "/admin/super/generic-object",
        icon: <BackpackIcon {...cls} />,
      },
      // {
      //   name: "Tous les sous-objets",
      //   url: "/admin/super/sub-object",
      //   icon: <DashboardIcon {...cls} />,
      // },
      // {
      //   name: "Tout les modèles",
      //   url: "/admin/super/template",
      //   icon: <CardStackIcon {...cls} />,
      // },
    ],
  },
];

/**
 * A module that defines a `SidebarContext` and a `SidebarProvider` component for managing the state of the main and secondary sidebars in the admin section of the application.
 *
 * @remarks The `SidebarContext` is a React context object that provides the state and setter functions for the main and secondary sidebars to its children. The `useSidebarContext` hook is used to access the context object in child components. The `SidebarProvider` component is a wrapper component that provides the state and setter functions for the main and secondary sidebars to its children through the `SidebarContext`.
 *
 * @returns A module that defines a `SidebarContext` and a `SidebarProvider` component for managing the state of the main and secondary sidebars in the admin section of the application.
 */
export type SidebarType = "main" | "secondary";
type SidebarTypeObject = { get: () => boolean; set: (value: boolean) => void };
type SidebarContextType = {
  [key in SidebarType]: SidebarTypeObject;
};
const SidebarContext = createContext({
  main: { get: () => true, set: (_value: boolean) => {} },
  secondary: { get: () => true, set: (_value: boolean) => {} },
} as SidebarContextType);

/**
 * A hook that returns the `SidebarContext` object for accessing the state and setter functions for the main and secondary sidebars.
 *
 * @returns The `SidebarContext` object for accessing the state and setter functions for the main and secondary sidebars.
 */
export const useSidebarContext = () => {
  const context = useContext(SidebarContext);
  if (!context) throw new Error("SidebarContext is not defined");
  return context;
};

/**
 * A React component that provides the state and setter functions for the main and secondary sidebars to its children through the `SidebarContext`.
 *
 * @param children - The children of the component, which are the actual pages of the admin section of the application.
 * @param main - An object that represents the state and setter functions for the main sidebar.
 * @param secondary - An object that represents the state and setter functions for the secondary sidebar.
 *
 * @returns A React component that provides the state and setter functions for the main and secondary sidebars to its children through the `SidebarContext`.
 */
const SidebarProvider = ({
  children,
  main,
  secondary,
}: {
  children: ReactNode;
  main: SidebarTypeObject;
  secondary: SidebarTypeObject;
}) => {
  return <SidebarContext.Provider value={{ main, secondary }}>{children}</SidebarContext.Provider>;
};

const useMainState = createPersistedState("sidebar-main");
const useSecondaryState = createPersistedState("sidebar-secondary");

/**
 * A React component that serves as a layout for the admin pages of the application.
 *
 * @remarks The component uses the `useMainState` and `useSecondaryState` hooks to manage the state of the main and secondary sidebars. The component renders a `SidebarProvider` component that provides the state and setter functions for the main and secondary sidebars to its children. The component renders a `Sidebar` component with `type="main"` and `navigation={mainNavigation}` props, which renders the main sidebar with the navigation items defined in the `mainNavigation` array. The component renders its children, which are the actual pages of the admin section of the application.
 *
 * @param children - The children of the component, which are the actual pages of the admin section of the application.
 *
 * @returns A React component that serves as a layout for the admin pages of the application.
 */
const AdminLayoutComponent = ({ children }: { children: ReactNode }) => {
  const [main, setMain] = useMainState(true);
  const [secondary, setSecondary] = useSecondaryState(true);

  return (
    <>
      <AdminResponsiveAlert />
      <SidebarProvider
        main={{ get: () => main as boolean, set: setMain }}
        secondary={{ get: () => secondary as boolean, set: setSecondary }}
      >
        <div className="flex flex-row w-full h-full">
          <Sidebar
            type="main"
            navigation={mainNavigation.filter((n) => {
              if (n.label === "Administration") return canHaveAccess(undefined, 1000);
              return canHaveAccess(undefined, 100);
            })}
          />
          {children}
        </div>
      </SidebarProvider>
    </>
  );
};

export const AdminLayout = dynamic(() => Promise.resolve(AdminLayoutComponent), {
  ssr: false,
});
