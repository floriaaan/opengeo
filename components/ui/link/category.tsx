import classNames from "classnames";
import Link from "next/link";
import { useRouter } from "next/router";

export type CategoryOptions = {
  name: string;
  href?: string;
  onClick?: () => void;
  disabled?: boolean;
};

export type CategoryProps = {
  title: string;
  options: CategoryOptions[];
  titleClassName?: string;
  optionsClassName?: string;
};

/**
 * A React component that displays a category with a title and a list of options.
 *
 * @remarks The component uses the `useRouter` hook from `next/router` to get the current URL path. The component renders a title and a list of options as either `Link` or `button` elements. The component uses the `classNames` function from `classnames` to conditionally apply CSS classes based on the state of the component.
 *
 * @param props - An object that contains the data for the category, including its `title`, `options`, `titleClassName`, and `optionsClassName`.
 * @param props.title - The title of the category.
 * @param props.options - An array of options to display in the category.
 * @param props.titleClassName - The CSS class to apply to the title.
 * @param props.optionsClassName - The CSS class to apply to the options.
 *
 * @returns A React component that displays a category with a title and a list of options.
 */
export const Category = ({ title, options, titleClassName, optionsClassName }: CategoryProps) => {
  const { asPath } = useRouter();

  return (
    <div className="flex flex-col gap-y-1">
      <span
        data-testid="category-title"
        className={classNames(
          "relative font-bold select-none",
          "before:absolute before:-bottom-1 before:h-[0.2rem] before:w-8 before:bg-opengeo",
          titleClassName,
        )}
      >
        {title}
      </span>
      <div data-testid="category-options" className="grid flex-col grid-cols-2 gap-1 mt-2 md:flex">
        {options.map(({ name, href, onClick, disabled }, i) =>
          href ? (
            <Link
              key={`${title}-${i}`}
              href={href.replaceAll("//", "/")}
              className={classNames(
                "p-1 md:p-0 font-normal normal-case nav__link",
                asPath === href && "underline decoration-dotted",
                disabled && "opacity-50 cursor-not-allowed",
                optionsClassName,
              )}
            >
              {name}
            </Link>
          ) : (
            <button
              disabled={disabled || false}
              key={`${title}-${i}`}
              className={classNames(
                "p-1 font-normal normal-case md:p-0 nav__link",
                disabled && "opacity-50 cursor-not-allowed",
                optionsClassName,
              )}
              onClick={onClick}
            >
              {name}
            </button>
          ),
        )}
      </div>
    </div>
  );
};
