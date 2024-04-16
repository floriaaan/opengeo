import { useSearch } from "@/hooks/useSearch";
import { cn } from "@/lib/utils";
import { Badge } from "@components/ui/badge";
import { Button } from "@components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@components/ui/dropdown-menu";
import { Input } from "@components/ui/input";
import { ScrollArea } from "@components/ui/scroll-area";
import { CheckCircledIcon, ChevronDownIcon, HomeIcon } from "@radix-ui/react-icons";
import Link from "next/link";
import { ReactNode, useEffect, useRef, useState } from "react";

const root = {
  name: "Accueil",
  href: "/",
  current: false,
  icon: <HomeIcon className="w-4 h-4 text-opengeo shrink-0" />,
};

export type Page = {
  name: string;
  onClick?: () => void;
  children?: Page[];
  selected?: boolean;
  icon?: JSX.Element;
  condition?: boolean;
  href?: string;
  disabled?: boolean;
  className?: string;
  multiple?: boolean;
};

/**
 * A React component that displays a breadcrumb navigation bar.
 *
 * @remarks The component uses the `classNames` function from `classnames` to conditionally apply CSS classes based on the state of the component. The component renders a list of `Item` components that represent the pages in the breadcrumb. The component also renders a list of `Action` components that represent the actions that can be taken on the current page. The component renders a `rightSide` element that can be used to display additional content on the right side of the breadcrumb. The `extendClassName` prop can be used to add additional CSS classes to the component.
 *
 * @param props - An object that contains the data for the breadcrumb, including its `pages`, `actions`, `rightSide`, and `extendClassName`.
 * @param props.pages - An array of `Page` objects that represent the pages in the breadcrumb.
 * @param props.actions - An array of `Action` objects that represent the actions that can be taken on the current page.
 * @param props.rightSide - An element to display on the right side of the breadcrumb.
 * @param props.extendClassName - Additional CSS classes to apply to the component.
 *
 * @returns A React component that displays a breadcrumb navigation bar.
 */
export const Breadcrumb = ({
  pages,
  className,
  stopPropagation = false,
  actions,
}: {
  pages: Page[];
  className?: string;
  stopPropagation?: boolean;
  actions?: ReactNode;
}) => {
  return (
    <nav
      className={cn(
        "flex flex-row justify-between px-2 py-1.5 lg:py-px bg-white border-b border-gray-200 lg:pl-8",
        className,
      )}
      aria-label="Breadcrumb"
    >
      <ol role="list" className="flex gap-2 overflow-x-auto max-w-[calc(100vw-9rem)] grow shrink-0" id="breadcrumb">
        <li className="hidden lg:flex ">
          <div className="flex items-center">
            <Link href={root.href} className="text-gray-400 duration-300 hover:text-gray-500">
              {root.icon}
              <span className="sr-only">{root.name}</span>
            </Link>
          </div>
        </li>
        {pages.map((page: Page) => page && <Item {...page} key={page.name} stopPropagation={stopPropagation} />)}
      </ol>
      <div className="flex items-center gap-2 text-gray-500">{actions}</div>
    </nav>
  );
};

export const NextIcon = ({ ignoreBreakpoint = false }: { ignoreBreakpoint?: boolean }) => (
  <svg
    className={cn(" w-6 h-full text-gray-200 shrink-0  ", ignoreBreakpoint ? "" : "hidden lg:block")}
    viewBox="0 0 24 44"
    preserveAspectRatio="none"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path d="M.293 0l22 22-22 22h1.414l22-22-22-22H.293z" />
  </svg>
);

/**
 * A React component that represents a page in the breadcrumb navigation bar.
 *
 * @remarks The component uses the `useSearch` hook to manage a search input for filtering the child pages. The component uses the `usePopper` hook from `react-popper` to manage the popover that displays the child pages. The component renders a `Menu` component from `headlessui/react` to display the child pages in a popover. The component renders a `Link` component from `next/link` to create a link to the page. The component also renders a `ChevronDownIcon` component to display a chevron icon that indicates that the page has child pages. The `Page` type is an object that contains the data for the page, including its `name`, `children`, `selected`, `href`, `icon`, `onClick`, `disabled`, `className`, and `multiple`.
 *
 * @param props - An object that contains the data for the page, including its `name`, `children`, `selected`, `href`, `icon`, `onClick`, `disabled`, `className`, and `multiple`.
 * @param props.name - The name of the page.
 * @param props.children - An array of child pages.
 * @param props.selected - A boolean value that indicates whether the page is selected.
 * @param props.href - The URL of the page.
 * @param props.icon - An icon to display next to the page name.
 * @param props.onClick - A function to call when the page is clicked.
 * @param props.disabled - A boolean value that indicates whether the page is disabled.
 * @param props.className - Additional CSS classes to apply to the component.
 * @param props.multiple - A boolean value that indicates whether the page can have multiple selections.
 *
 * @returns A React component that represents a page in the breadcrumb navigation bar.
 */
const Item = ({
  name,
  children,
  selected,
  href,
  icon,
  onClick,
  disabled,
  className,
  multiple,
  stopPropagation,
}: Page & { stopPropagation: boolean }) => {
  const { search, filtered, onChange } = useSearch("name", children || []);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const dropdownRef = useRef(null);
  useOutsideAlerter(dropdownRef, () => setIsDropdownOpen(false));

  return (
    <li onClick={onClick} className={cn("flex", className)}>
      <div className="flex items-center lg:gap-x-2">
        <NextIcon />
        {children ? (
          <>
            <DropdownMenu
              open={stopPropagation ? isDropdownOpen : undefined}
              onOpenChange={(open) => {
                if (!stopPropagation) {
                  setIsDropdownOpen(open);
                } else {
                  setIsDropdownOpen(true);
                }
              }}
            >
              <DropdownMenuTrigger asChild disabled={disabled}>
                <Button
                  variant="ghost"
                  className={cn(
                    "px-2 sm:px-4",
                    "hover:text-opengeo-700 text-sm font-medium lg:gap-x-1",
                    "data-[state=open]:bg-opengeo-200 data-[state=open]:text-opengeo-700 data-[state=open]:hover:bg-opengeo-300 data-[state=open]:active:bg-opengeo-400 group",
                    selected
                      ? "bg-opengeo-200 text-opengeo-700 hover:bg-opengeo-300 active:bg-opengeo-400 font-bold "
                      : "text-gray-500  hover:bg-opengeo-100 active:bg-opengeo-200 ",
                  )}
                >
                  {icon}
                  <span className="first-letter:uppercase max-w-[16rem] truncate">{name}</span>

                  <ChevronDownIcon className="w-4 h-4 group-data-[state=open]:rotate-180 transition duration-100" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                ref={dropdownRef}
                className="w-64 max-w-sm overflow-auto"
                align="start"
                sideOffset={8}
              >
                <DropdownMenuLabel>{name}</DropdownMenuLabel>
                <div className="px-1 pb-1">
                  <Input onChange={onChange} value={search} placeholder="Filtrer" />
                </div>
                <DropdownMenuSeparator />
                <ScrollArea className="max-h-[256px] lg:max-h-[384px] w-full overflow-auto flex flex-col">
                  {filtered.map((e, i) => {
                    if ("condition" in e && !e.condition) return <></>;
                    return (
                      <DropdownMenuItem
                        key={i}
                        onSelect={(evt) => {
                          if (!stopPropagation) {
                            setIsDropdownOpen(false);
                            evt.preventDefault();
                          }
                        }}
                        onClick={e.onClick}
                        className={cn(
                          "w-full pr-4 duration-200 mb-1",
                          e.selected
                            ? "bg-opengeo-200 text-opengeo-700 hover:bg-opengeo-300 active:bg-opengeo-400 font-bold "
                            : "text-gray-500  hover:bg-opengeo-100 active:bg-opengeo-200 ",
                        )}
                      >
                        <div className="inline-flex items-center justify-between w-full">
                          <span className="first-letter:uppercase">{e.name}</span>
                          {e.selected && <CheckCircledIcon className="w-5 h-5 text-opengeo-700" />}
                        </div>
                      </DropdownMenuItem>
                    );
                  })}
                  {filtered.length === 0 && (
                    <div className="p-4 font-medium text-center text-gray-500 font-title">Aucun résultat</div>
                  )}
                </ScrollArea>
              </DropdownMenuContent>
            </DropdownMenu>
            {multiple && (
              <Badge variant="secondary" className="hidden lg:block">
                {children.filter((e) => "selected" in e && e.selected).length}
              </Badge>
            )}
          </>
        ) : (
          <>
            {href ? (
              <Link
                href={href as unknown as string}
                className={cn(
                  "hover:text-opengeo-700 text-sm font-medium lg:gap-x-1",
                  "data-[state=open]:bg-opengeo-200 data-[state=open]:text-opengeo-700 data-[state=open]:hover:bg-opengeo-300 data-[state=open]:active:bg-opengeo-400 group first-letter:uppercase",
                  selected
                    ? "bg-opengeo-200 text-opengeo-700 hover:bg-opengeo-300 active:bg-opengeo-400 font-bold "
                    : "text-gray-500  hover:bg-opengeo-100 active:bg-opengeo-200 ",
                )}
                aria-current={selected ? "page" : undefined}
              >
                {icon}
                <span className="first-letter:uppercase max-w-[16rem] truncate">{name}</span>
              </Link>
            ) : (
              <span
                className={cn(
                  "cursor-pointer text-sm font-medium inline-flex items-center rounded-md duration-300 ease-linear py-2 px-2  hover:bg-opengeo-200 hover:text-opengeo-700",
                  selected ? "bg-opengeo-200 text-opengeo-700 " : "text-gray-500 ",
                )}
                aria-current={selected ? "page" : undefined}
              >
                {icon}
                {name}
              </span>
            )}
          </>
        )}
      </div>
    </li>
  );
};

import { RefObject } from "react";

function useOutsideAlerter(ref: RefObject<HTMLElement>, callback: () => void): void {
  useEffect(() => {
    function handleClickOutside(event: MouseEvent): void {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        callback();
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [ref, callback]);
}
