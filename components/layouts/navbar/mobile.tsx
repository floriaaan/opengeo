import { Category, CategoryProps } from "@components/ui/link/category";
import { app_routes } from "@resources/routes";
import classNames from "classnames";
import { MenuIcon, XIcon } from "lucide-react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

/**
 * A React component that renders a mobile menu button and a panel with navigation links that is displayed when the button is clicked.
 *
 * @remarks The component uses the `useRouter` hook to get the current route path and to navigate to other routes. The component uses the `useState` hook to keep track of whether the menu is open or closed. The component uses the `useDelayedRender` hook to delay the rendering of the menu panel until the menu is open. The component uses the `useEffect` hook to set the overflow style of the body element to "hidden" when the menu is open and to "auto" when the menu is closed. The component also uses the `useEffect` hook to close the menu when the route changes. The component renders a button with a hamburger icon that toggles the menu panel when clicked. The component renders the menu panel using the `MobileMenuPanel` component. The `MobileMenuPanel` component is only rendered when the menu is open and has a delay of 20ms before entering and 300ms before exiting.
 *
 * @returns A React component that renders a mobile menu button and a panel with navigation links that is displayed when the button is clicked.
 */
export const MobileMenu = () => {
  const { pathname } = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const { rendered: isMenuRendered } = useDelayedRender(isMenuOpen, {
    enterDelay: 20,
    exitDelay: 300,
  });

  const toggleMenu = () => setIsMenuOpen((prev) => !prev);

  useEffect(() => {
    return function cleanup() {
      document.body.style.overflow = "";
    };
  }, []);

  useEffect(() => {
    if (isMenuOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
  }, [isMenuOpen]);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  return (
    <div className="inline-flex items-center md:hidden shrink-0 gap-x-5">
      <button className="inline-flex items-center md:hidden gap-x-3" onClick={toggleMenu}>
        <span className="text-xs underline uppercase underline-offset-2 font-title">Menu </span>
        <span className="sr-only">Ouvrir le menu</span>
        {!isMenuOpen ? (
          <>
            <span className="flex items-center justify-center w-10 h-10 rounded-full shrink-0 btn__colors">
              <MenuIcon className="w-4 h-4" />
            </span>
          </>
        ) : (
          <span className="flex items-center justify-center w-10 h-10 rounded-full shrink-0 btn__colors">
            <XIcon className="w-4 h-4" />
          </span>
        )}
      </button>
      {isMenuOpen ? <MobileMenuPanel isMenuRendered={isMenuRendered} /> : null}
    </div>
  );
};

const MobileMenuPanel = ({ isMenuRendered }: { isMenuRendered: boolean }) => {
  const LINKS: CategoryProps[] = app_routes
    .filter((link) => link.basePath !== "/admin")
    .map((r) => {
      return {
        title: r.title,
        options: r.routes
          .map((c) => {
            return {
              name: c.title,
              href: !c.path.startsWith("../") ? r.basePath + c.path : c.path.replace("../", "/"),
            };
          })
          .filter((_) => _ !== null),
      } as CategoryProps;
    })
    .filter((_) => _ !== null) as CategoryProps[];

  return (
    <>
      <ul
        className={classNames(
          "top-16 fixed px-4 pt-4 w-full h-screen m-0 z-[9999] transition-opacity duration-300 ease-linear left-0 grow md:hidden",
          "flex flex-col bg-white dark:bg-black",
          isMenuRendered ? "opacity-100" : "opacity-0",
        )}
      >
        {LINKS.map((data, i) => (
          <li
            key={i}
            className={classNames(
              "transition-all duration-300 ease-linear first:pt-0 py-2.5", // mobile-menu.module.css
              "text-sm font-semibold border-b last:border-b-0 text-neutral-900 dark:text-neutral-100 border-neutral-200 dark:border-neutral-800",
              isMenuRendered ? "opacity-100 w-full translate-x-0" : "opacity-0 w-0 -translate-x-4",
            )}
            style={{ transitionDelay: `${150 + 25 * i}ms` }}
          >
            <Category
              {...data}
              optionsClassName="bg-gray-100 rounded-md px-3 py-1.5 active:bg-gray-50 hover:bg-gray-200"
            />
          </li>
        ))}
      </ul>
    </>
  );
};

import { useCallback, useRef } from "react";

interface Options {
  enterDelay?: number;
  exitDelay?: number;
  onUnmount?: () => void;
}

const useDelayedRender = (active = false, options: Options = {}) => {
  const [, force] = useState<any>();
  const mounted = useRef(active);
  const rendered = useRef(false);
  // eslint-disable-next-line no-undef
  const renderTimer = useRef<NodeJS.Timeout | null>(null);
  // eslint-disable-next-line no-undef
  const unmountTimer = useRef<NodeJS.Timeout | null>(null);
  const prevActive = useRef(active);

  const recalculate = useCallback(() => {
    const { enterDelay = 1, exitDelay = 0 } = options;

    if (prevActive.current) {
      // Mount immediately
      mounted.current = true;
      if (unmountTimer.current) clearTimeout(unmountTimer.current);

      if (enterDelay <= 0) {
        // Render immediately
        rendered.current = true;
      } else {
        if (renderTimer.current) return;

        // Render after a delay
        renderTimer.current = setTimeout(() => {
          rendered.current = true;
          renderTimer.current = null;
          force({});
        }, enterDelay);
      }
    } else {
      // Immediately set to unrendered
      rendered.current = false;

      if (exitDelay <= 0) {
        mounted.current = false;
      } else {
        if (unmountTimer.current) return;

        // Unmount after a delay
        unmountTimer.current = setTimeout(() => {
          mounted.current = false;
          unmountTimer.current = null;
          force({});
        }, exitDelay);
      }
    }
  }, [options]);

  // When the active prop changes, need to re-calculate
  if (active !== prevActive.current) {
    prevActive.current = active;
    // We want to do this synchronously with the render, not in an effect
    // this way when active → true, mounted → true in the same pass
    recalculate();
  }

  return {
    mounted: mounted.current,
    rendered: rendered.current,
  };
};

export default useDelayedRender;
