import Link from "next/link";
import { useRouter } from "next/router";

import { SidebarType, useSidebarContext } from "@components/layouts/admin";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@components/ui/tooltip";
import classNames from "classnames";
import { ArrowLeftIcon, ArrowRightIcon } from "lucide-react";
import { ReactNode } from "react";

type Node = JSX.Element | ReactNode | (() => JSX.Element | ReactNode);

type NavType = {
  label: string;
  value: {
    name: string;
    url: string;
    icon?: JSX.Element | ReactNode;
    badge?: { normal: Node; collapsed: Node };
  }[];
};

/** The `overflowClassNames` constant defines the CSS classes to apply to the sidebar to make it scrollable.
 * `max-h-[calc(100vh-4rem-3rem)]` sets the maximum height of the sidebar to the height of the viewport minus the height of the header and the height of the footer.
 */
const overflowClassNames = "max-h-[calc(100vh-4rem-3rem)] overflow-x-hidden overflow-y-auto small-scrollbar";

/**
 * A React component that renders a sidebar navigation menu.
 *
 * @remarks The component includes props for setting the navigation items and the type of the sidebar. The component uses the `ArrowLeftIcon` component from the `lucide-react` library to render a "collapse" button for the sidebar. The component uses the `Link` component from the `next/link` library to render the navigation items as links. The component is used in the `AdminLayout` component for rendering the sidebar navigation menu.
 *
 * @param navigation - An array of navigation items, where each item is an object with a label and an array of value objects that represent the links to render.
 * @param type - The type of the sidebar. "main" or "secondary".
 *
 * @returns A React component that renders a sidebar navigation menu.
 */
export const Sidebar = ({ navigation, type = "main" }: { navigation: NavType[]; type?: SidebarType }) => {
  const router = useRouter();
  const sidebar = useSidebarContext()[type];

  if (sidebar.get()) {
    return (
      <div
        className={classNames(
          "w-64 py-2 text-sm relative duration-200 bg-white border-r border-gray-300 border-solid transition-width shrink-0",
          overflowClassNames,
        )}
      >
        <div className="sticky top-0 flex justify-end w-full truncate right-4 flex-nowrap">
          <button
            className="flex items-center gap-2 p-2 text-sm text-gray-500 bg-white rounded"
            onClick={() => sidebar.set(!sidebar.get())}
          >
            <ArrowLeftIcon className="w-4 h-4" />
            Réduire
          </button>
        </div>
        {navigation.map((e, i) => {
          return (
            <div className="flex flex-col" key={i}>
              <h1 className="px-4 pt-4 text-sm font-light text-gray-500 uppercase ">{e.label}</h1>
              {e.value.map((e, i) => {
                return (
                  <Link
                    key={e.name + i}
                    className={classNames(
                      "cursor-pointer px-6 py-2 border-l-4 inline-flex items-center gap-2 duration-200 flex-nowrap truncate",
                      router.asPath === e.url ||
                        (type === "main" && router.asPath.includes(e.url) && e.url !== "/admin")
                        ? "font-bold text-opengeo bg-opengeo-100 border-opengeo"
                        : "font-normal border-transparent hover:bg-gray-200",
                    )}
                    href={e.url}
                  >
                    {e.icon}
                    {e.name || "Sans nom"}
                    {typeof e.badge?.normal === "function" ? e.badge.normal() : e.badge?.normal}
                  </Link>
                );
              })}
            </div>
          );
        })}
      </div>
    );
  } else {
    return (
      <div
        className={classNames(
          "flex flex-col text-sm text-gray-500 duration-200 bg-white border-r border-gray-300 border-solid transition-width w-14 shrink-0",
          overflowClassNames,
        )}
      >
        <button
          className="sticky top-0 right-0 z-10 flex items-center justify-center px-4 py-5 bg-white border-b border-gray-300 hover:bg-gray-200 w-14 h-14"
          onClick={() => sidebar.set(!sidebar.get())}
        >
          <ArrowRightIcon className="w-4 h-4 shrink-0" />
        </button>
        {navigation.map((e, i) => {
          return (
            <div className="flex flex-col" key={i}>
              {e.value.map((e, i) => {
                return (
                  <TooltipProvider key={e.name + i}>
                    <Tooltip delayDuration={0}>
                      <TooltipTrigger>
                        <Link
                          className={classNames(
                            "cursor-pointer relative px-4 py-5 flex items-center justify-center border-l duration-200 w-14 h-14",
                            router.asPath === e.url ||
                              (type === "main" && router.asPath.includes(e.url) && e.url !== "/admin")
                              ? "font-bold text-opengeo bg-opengeo-100 border-opengeo"
                              : "font-normal border-transparent hover:bg-gray-200",
                          )}
                          href={e.url}
                        >
                          {e.icon}
                          {typeof e.badge?.collapsed === "function" ? e.badge.collapsed() : e.badge?.collapsed}
                        </Link>
                      </TooltipTrigger>
                      <TooltipContent side="right">{e.name}</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                );
              })}
            </div>
          );
        })}
      </div>
    );
  }
};
