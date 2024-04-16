import { Logo } from "@components/ui/Logo";

import { HabilitationsModal } from "@components/habilitations/modal";
import { ChangelogSheet } from "@components/helpers/changelog/sheet";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@components/ui/hover-card";
import { useRouter } from "next/router";
import packageInfo from "package.json";
import { useEffect, useState } from "react";
const { author, email } = packageInfo;

/**
 * A React component that serves as the footer for the application.
 *
 * @remarks The component renders a `footer` element at the bottom of the page with a white background and a border. The component uses the `flex` and `items-center` classes to center the content vertically. The component uses the `h-10` class to set the height of the footer to 10 units. The component uses the `px-1` and `lg:px-64` classes to set the horizontal padding of the footer to 1 unit on small screens and to 64 units on large screens. The component uses the `text-xs` and `text-gray-400` classes to set the font size and color of the text in the footer. The component uses the `new Date().getFullYear()` function to get the current year and display it in the footer.
 *
 * @returns A React component that serves as the footer for the application.
 */
export const Footer = (): JSX.Element => {
  const { push } = useRouter();

  const [clicks, setClicks] = useState(0);
  const increment = () => setClicks((prev) => prev + 1);

  useEffect(() => {
    if (clicks === 5) {
      push("/_/w");
      setClicks(0);
    }
  }, [clicks, push]);

  const [gifUrl, setGifUrl] = useState<string>("");
  const onGifOpenChange = async (open: boolean) => {
    if (!open) return setGifUrl("");
    const body = await (
      await fetch("https://api.giphy.com/v1/gifs/random?api_key=0UTRbFtkMxAplrohufYco5IY74U8hOes&rating=r&tag=otter")
    ).json();
    setGifUrl(body.data.images.downsized.url);
  };

  return (
    <>
      <footer data-testid="footer" className="bottom-0 z-40 w-full bg-white border select-none border-white-500">
        <div className="inline-flex items-center w-full px-5 py-[11px] mx-auto gap-x-3 ">
          <HoverCard openDelay={1000} onOpenChange={onGifOpenChange}>
            <HoverCardTrigger>
              <span
                onClick={increment}
                className="flex items-center justify-center pr-4 mb-1 font-medium text-gray-700 transition duration-500 border-gray-400 dark:text-gray-200 title-font md:justify-start md:mb-0 hover:text-black md:border-r"
              >
                <Logo className="w-[22px] h-[22px]" />
              </span>
            </HoverCardTrigger>
            <HoverCardContent className="p-0 mb-2 w-fit">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {gifUrl && <img src={gifUrl} alt="euuuh" className="w-auto h-72"></img>}
            </HoverCardContent>
          </HoverCard>

          <div className="inline-flex items-center gap-2">
            <p className="items-center hidden mt-0 text-xs text-gray-500 font-title sm:flex dark:text-gray-200">
              © {new Date().getFullYear()} {author} —
              <a
                href={`mailto:${email}`}
                rel="noopener noreferrer"
                className="ml-1 font-semibold text-gray-600 dark:text-gray-300"
                target="_blank"
              >
                Contact
              </a>
            </p>
            <HabilitationsModal />
          </div>

          <ChangelogSheet />
        </div>
      </footer>
    </>
  );
};
