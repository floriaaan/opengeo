import { useAuth } from "@/hooks/useAuth";
import { canHaveAccess } from "@/hooks/useHabilitation";
import { useNotifications } from "@/hooks/useNotification";
import { cn } from "@/lib/utils";
import { roles } from "@components/habilitations/roles";
import { NAVIGATIONS } from "@components/layouts/navbar/config";
import { MobileMenu } from "@components/layouts/navbar/mobile";
import { Logo } from "@components/ui/Logo";
import { UserWithFallback } from "@components/ui/avatar/base";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@components/ui/tooltip";
import { MixerVerticalIcon } from "@radix-ui/react-icons";
import classNames from "classnames";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

/**
 * A React component that serves as the navigation bar for the application.
 *
 * @remarks The component uses the `useAuth` hook to get the current user from the authentication context. The component uses the `useRouter` hook to get the current route path and to navigate to other routes. The component uses the `useState` hook to keep track of the number of clicks on the navbar. The component uses the `useEffect` hook to navigate to the `/debug` route if the avatar is clicked five times in a row. The component renders a `nav` element with a fixed position at the top of the page and a white background. The component renders a `div` element with the application logo and a set of navigation links. The component renders the navigation links using the `NAVIGATIONS` array defined in another module. The component applies different styles to the active navigation link and to the logo when the user is logged in.
 *
 * @returns A React component that serves as the navigation bar for the application.
 */
export const Navbar = () => {
  const { user } = useAuth();
  const { habilitations_pending, suggestions_pending } = useNotifications().notifications;
  const { asPath, push } = useRouter();
  const [clicks, setClicks] = useState(0);
  const increment = () => setClicks((prev) => prev + 1);

  useEffect(() => {
    if (clicks === 5) {
      push("/debug");
      setClicks(0);
    }
  }, [clicks, push]);

  return (
    <nav
      data-testid="navbar"
      className={classNames(
        "inline-flex shrink-0 z-[60] bg-white fixed top-0  items-center justify-center w-full px-6 2xl:px-0 h-16 after:bg-[url('/header-border.svg')]  after:absolute after:w-full after:h-[1px] after:z-[60] after:bottom-0",
      )}
    >
      <div className="inline-flex items-center justify-between w-full h-full max-w-7xl">
        <Link href="/" className="2xl:w-52">
          <span className="sr-only">OpenGeo</span>
          <Logo className="w-auto h-6 lg:h-8" />
        </Link>
        {user && (
          <>
            <div className="items-center hidden divide-gray-200 md:inline-flex md:ml-4 lg:ml-6 gap-x-2 2xl:justify-center grow 2xl:ml-0">
              {NAVIGATIONS.map((link) => (
                <NavLink pathname={asPath} {...link} key={link.href} />
              ))}
            </div>

            <div className="inline-flex items-center justify-end gap-x-3 w-52">
              <div className="hidden md:inline-flex items-center gap-x-1.5">
                {canHaveAccess(undefined, 100) && (
                  <TooltipProvider delayDuration={0}>
                    <Tooltip>
                      <TooltipTrigger>
                        <Link
                          href="/admin"
                          data-active={asPath.includes("/admin") ? "true" : "false"}
                          className={classNames(
                            "inline-flex items-center p-2 text-base group font-medium text-gray-800 duration-200 ease-linear rounded-lg lg:p-3 hover:bg-opengeo-100 hover:text-opengeo-500 active:ring ring-offset-2 ring-opengeo-800 relative",
                            asPath.includes("/admin") && "bg-opengeo-50 text-opengeo-500",
                            (habilitations_pending || suggestions_pending) && "bg-gray-100",
                          )}
                        >
                          <MixerVerticalIcon
                            className={`w-4 h-4 transition group-data-[active=true]:text-opengeo-500 duration-300 group-hover:text-opengeo-500 text-gray-700 dark:group-hover:text-opengeo-100`}
                          />
                          {habilitations_pending + suggestions_pending > 0 && (
                            <span className="absolute flex w-3 h-3 -top-1 -right-1 z-[60]">
                              <span
                                className={cn(
                                  "absolute inline-flex w-full h-full  rounded-full opacity-75 animate-ping",
                                  suggestions_pending > 0 && "bg-amber-400",
                                  habilitations_pending > 0 && "bg-red-400",
                                )}
                              ></span>
                              <span
                                className={cn(
                                  "absolute inline-flex items-center justify-center w-3 h-3 rounded-full ring ring-white",
                                  suggestions_pending > 0 && "bg-amber-500",
                                  habilitations_pending > 0 && "bg-red-600",
                                )}
                              ></span>
                            </span>
                          )}
                          <span className="sr-only">Administration</span>
                        </Link>
                      </TooltipTrigger>
                      <TooltipContent side="bottom">Administration</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>
              <MobileMenu />
              <div
                onClick={increment}
                className="flex items-center justify-center w-10 h-10 transition duration-300 rounded-full bg-opengeo/5 aspect-square shrink-0"
              >
                <TooltipProvider delayDuration={0}>
                  <Tooltip>
                    <TooltipTrigger>
                      <UserWithFallback
                        className="flex items-center justify-center text-lg font-bold leading-4 rounded-full select-none text-opengeo-500 aspect-square font-title"
                        src={`https://webmail.intranet.edf.com/owa/service.svc/s/GetPersonaPhoto?email=${user?.contact_point?.email}&size=HR96x96`}
                        alt={user?.cn || "User"}
                        width={96}
                        height={96}
                      >
                        {user?.cn
                          ?.split(" ")
                          .map((name) => name[0])
                          .join("")}
                      </UserWithFallback>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">
                      {roles.find(({ value }) => value === user.habilitation?.role)?.label || "Utilisateur"}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          </>
        )}
      </div>
    </nav>
  );
};

type NavLinkProps = (typeof NAVIGATIONS)[0];

const NavLink = ({ pathname, ...link }: NavLinkProps & { pathname: string }) => (
  <TooltipProvider key={link.href} delayDuration={0}>
    <Tooltip>
      <TooltipTrigger>
        <Link
          href={link.href}
          data-active={pathname === link.href ? "true" : "false"}
          className={classNames(
            "inline-flex items-center group p-2 text-base font-medium text-gray-800 duration-200 ease-linear rounded-lg lg:p-3 hover:text-opengeo-500 hover:bg-opengeo-100 active:ring ring-offset-2 ring-opengeo-800",
            pathname === link.href && "bg-opengeo-50 text-opengeo-500",
          )}
        >
          {link.icon}
          <span className="sr-only">{link.name}</span>
        </Link>
      </TooltipTrigger>
      <TooltipContent side="bottom">{link.name}</TooltipContent>
    </Tooltip>
  </TooltipProvider>
);
