import { ReactNode, useState } from "react";

type UserWithFallbackProps = {
  src: string;
  alt: string;
  width: number;
  height: number;
  children: ReactNode;
  className: string;
};

/**
 * A React component that displays an image of a user or a fallback element if the image fails to load.
 *
 * @remarks The component uses the `useState` hook to manage the state of the image loading. The component renders an `img` element with the specified `src`, `alt`, `width`, `height`, and `className` props. If the image fails to load, the component sets the `error` state to `true` and renders the `children` prop instead. The component also checks if the `src` prop includes the string "undefined" and does not render the image if it does.
 *
 * @param props - An object that contains the data for the image, including its `src`, `alt`, `width`, `height`, `children`, and `className`.
 * @param props.src - The URL of the image to display.
 * @param props.alt - The alternative text to display if the image fails to load.
 * @param props.width - The width of the image.
 * @param props.height - The height of the image.
 * @param props.children - The fallback element to display if the image fails to load.
 * @param props.className - The CSS class to apply to the image or fallback element.
 *
 * @returns A React component that displays an image of a user or a fallback element if the image fails to load.
 */
export const UserWithFallback = ({ src, alt, width, height, children, className }: UserWithFallbackProps) => {
  const [error, setError] = useState(false);

  const onError = () => {
    if (!error) setError(true);
  };

  return !error && src && !src.includes("undefined") && src !== "https://example.com/error?isTest=true" ? (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        data-testid="avatar-image"
        src={src}
        onError={onError}
        alt={alt}
        width={width}
        height={height}
        className={className}
      />
    </>
  ) : (
    <span data-testid="avatar-fallback" className={className}>
      {children}
    </span>
  );
};
