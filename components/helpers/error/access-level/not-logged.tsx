import { User } from "@/types/user";
import { Dispatch, SetStateAction, useEffect, useState } from "react";

import { useAuth } from "@/hooks/useAuth";
import { Logo } from "@components/ui/Logo";
import { Button } from "@components/ui/button";
import { ArrowRightIcon } from "lucide-react";

const Line = ({ className }: { className?: string }) => {
  return (
    <svg width={174} height={86} fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <path d="M130.551.061h8.125v2.084h-8.125V.06z" fill="#41A57D" />
      <path d="M106.454.061h24.096v2.084h-24.096V.06z" fill="#96CD32" />
      <path
        d="M16.667 11.45l1.389 1.596c-4.097 3.542-7.639 7.778-10.278 12.5l-1.875-1.042c2.848-4.93 6.458-9.374 10.764-13.055z"
        fill="#41A57D"
      />
      <path
        d="M36.596 1.311l.487 2.084a47.518 47.518 0 00-7.5 2.5L28.75 3.95c2.5-1.111 5.138-1.944 7.846-2.639z"
        fill="#1423DC"
      />
      <path
        d="M28.75 3.95l.833 1.945a45.397 45.397 0 00-11.458 7.152l-1.389-1.597c3.542-3.125 7.639-5.625 12.014-7.5z"
        fill="#FFC328"
      />
      <path
        d="M58.957.061v2.084h-11.11c-3.612 0-7.223.416-10.764 1.25l-.486-2.084c3.68-.833 7.5-1.25 11.25-1.25h11.11z"
        fill="#2382D2"
      />
      <path
        d="M5.972 24.505l1.875 1.041c-2.36 4.306-4.097 8.958-4.93 13.82-.208 1.18-.347 2.43-.556 3.61-.07 1.25-.208 2.43-.208 3.68-.07 2.5 0 5 0 7.5H.07v-7.569c0-1.32.139-2.57.208-3.82.139-1.25.278-2.569.556-3.819.833-5.069 2.638-9.93 5.138-14.443z"
        fill="#4BC3C3"
      />
      <path d="M0 54.156h2.084v17.36H.001v-17.36z" fill="#1423DC" />
      <path d="M0 71.586h2.084v13.958H.001V71.586z" fill="#96CD32" />
      <path d="M58.956.061h47.498v2.084H58.956V.06z" fill="#1423DC" />
      <path d="M138.674.061h34.443v2.084h-34.443V.06z" fill="#4BC3C3" />
    </svg>
  );
};

/**
 * Component that is printed when user isn't logged into the platform
 *
 * @returns {JSX.Element}
 */
export const NotLoggedError = ({ mutateSession }: { mutateSession: Dispatch<SetStateAction<User>> }): JSX.Element => {
  const { user } = useAuth();
  const [hasTimedOut, setHasTimedOut] = useState(false);
  useEffect(() => {
    const timeout = setTimeout(() => {
      setHasTimedOut(true);
    }, 5000);

    return () => clearTimeout(timeout);
  }, [hasTimedOut]);

  return (
    <>
      <div className="w-screen h-screen bg-white">
        <Line className="absolute rotate-180 -top-4 -left-12 " />
        <Line className="absolute bottom-0 right-0" />

        <div className="absolute top-0 left-0 flex flex-col items-center justify-center w-full h-full p-8 gap-y-1 ">
          <Logo className="h-12" />

          {!hasTimedOut ? (
            <>
              <div className="relative w-32 h-1 mt-3 overflow-x-hidden bg-gray-200">
                <div className="absolute w-8 h-1 bg-opengeo animate-bounce-horizontal"></div>
              </div>
              <p className="text-xs font-bold tracking-tighter text-gray-300 uppercase">Authentification...</p>
            </>
          ) : (
            <div className="w-full max-w-sm pt-4 mt-4 text-center border-t border-gray-100">
              <p className="text-sm font-medium text-gray-500">{"Vous n'êtes pas connecté à l'application."}</p>
              {user?.access_token && (
                <>
                  <p className="text-xs font-light text-gray-400">{"Merci de remonter l'erreur à l'équipe OpenGeo."}</p>
                  <Button
                    className="my-4"
                    onClick={() => {
                      mutateSession(
                        (old) =>
                          ({
                            ...old,
                            cn: "?",
                            id: "?",
                          }) as User,
                      );
                    }}
                    // variant={""}
                  >
                    Accéder à OpenGeo sans habilitation
                    <ArrowRightIcon className="w-4 h-4 shrink-0" />
                  </Button>
                  <small className="block mt-2 text-xs text-gray-400">
                    <span className="font-semibold">Note :</span> cette situation est temporaire et sera résolue
                    prochainement. Merci de votre compréhension.
                  </small>
                  <small className="block mt-2 text-xs text-gray-400">
                    Recharger la page peut résoudre le problème. &bull;{" "}
                    {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
                    <a href="/" className="font-bold underline">
                      Recharger la page
                    </a>
                  </small>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
};
