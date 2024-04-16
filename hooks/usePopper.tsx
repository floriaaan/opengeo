import { RefCallback, useRef, useCallback, useMemo } from "react";
import { createPopper, Options } from "@popperjs/core";

/**
 * A custom hook that creates a Popper instance and returns two ref callbacks to attach to the reference and popper elements.
 *
 * @remarks The hook takes an optional configuration object with options for the Popper instance. The hook returns an array with two ref callbacks: one for the reference element, and one for the popper element. The ref callbacks attach the elements to the Popper instance and update the instance when the elements change. The hook uses the `useRef`, `useCallback`, and `useMemo` hooks from the `react` library to manage the state and behavior of the Popper instance.
 *
 * @param options - An optional configuration object with options for the Popper instance.
 *
 * @returns An array with two ref callbacks: one for the reference element, and one for the popper element.
 *
 * @example
 * const [referenceRef, popperRef] = usePopper({
 *   placement: "bottom-start",
 *   modifiers: [
 *     {
 *       name: "offset",
 *       options: {
 *         offset: [0, 10],
 *       },
 *     },
 *   ],
 * });
 */
export function usePopper(options?: Partial<Options>): [RefCallback<Element | null>, RefCallback<HTMLElement | null>] {
  const reference = useRef<Element>(null);
  const popper = useRef<HTMLElement>(null);

  const cleanupCallback = useRef(() => {
    return;
  });

  const instantiatePopper = useCallback(() => {
    if (!reference.current) return;
    if (!popper.current) return;

    if (cleanupCallback.current) cleanupCallback.current();

    cleanupCallback.current = createPopper(reference.current, popper.current, options).destroy;
  }, [reference, popper, cleanupCallback, options]);

  return useMemo(
    () => [
      (referenceDomNode) => {
        // @ts-ignore
        reference.current = referenceDomNode;
        instantiatePopper();
      },
      (popperDomNode) => {
        // @ts-ignore
        popper.current = popperDomNode;
        instantiatePopper();
      },
    ],
    [reference, popper, instantiatePopper],
  );
}
