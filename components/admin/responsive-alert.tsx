import { Button } from "@components/ui/button";
import { useEffect } from "react";
import { useCookies } from "react-cookie";

export const AdminResponsiveAlert = () => {
  const [{ responsive_alert_dismissed }, setCookie] = useCookies(["responsive_alert_dismissed"]);
  const closeModal = () => setCookie("responsive_alert_dismissed", true, { path: "/" });

  useEffect(() => {
    if (!responsive_alert_dismissed) document.body.classList.add("overflow-hidden", "sm:overflow-auto");
    else document.body.classList.remove("overflow-hidden", "sm:overflow-auto");

    return () => document.body.classList.remove("overflow-hidden", "sm:overflow-auto");
  }, [responsive_alert_dismissed]);

  if (responsive_alert_dismissed) return null;
  return (
    <>
      <div className="fixed sm:hidden top-0 left-0 z-[61] w-screen h-screen bg-black/50 flex items-center justify-center p-3">
        <div className="w-full max-w-md p-6 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
          <h3 className="text-lg font-medium leading-6 text-gray-900">
            {"Le panneau d'administration n'est pas prévu pour être utilisé sur mobile."}
          </h3>
          <div className="mt-2">
            <p className="text-sm text-gray-500">
              {
                "Vous pouvez continuer à utiliser le panneau d'administration sur mobile, mais certains éléments pourraient ne pas être affichés correctement."
              }
            </p>
          </div>

          <div className="inline-flex justify-end w-full mt-4">
            <Button onClick={closeModal}>{"J'ai compris"}</Button>
          </div>
        </div>
      </div>
    </>
  );
};
