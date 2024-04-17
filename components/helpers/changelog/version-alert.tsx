import { useFetch } from "@/hooks/useFetch";
import { isDateOlderThan } from "@/lib/date/isOlderThan";
import { Latest } from "@/pages/api/changelog";
import { APIResult } from "@/types/api";
import { ChangelogSheetContent } from "@components/helpers/changelog/sheet-content";
import { Button } from "@components/ui";
import { Sheet, SheetTrigger } from "@components/ui/sheet";
import { RocketIcon } from "lucide-react";
import { useMemo, useState } from "react";

export const VersionAlert = () => {
  const [visible, setVisible] = useState(true);
  const { data: api_version } = useFetch<APIResult<Latest>>("/api/changelog?mode=latest");
  const v = useMemo(() => api_version?.data, [api_version]);
  if (!v) return null;

  // If the version is older than a week, don't show the alert
  if (isDateOlderThan(v.date, 7)) return null;
  if (!visible) return null;

  return (
    <Sheet>
      <SheetTrigger asChild className="absolute">
        <div className="relative group bg-background text-foreground p-4 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground z-50 w-full pr-6 duration-150 border-0 rounded-none shadow-none cursor-pointer hover:bg-neutral-100 top-28 lg:shadow-lg lg:rounded-lg lg:top-auto lg:bottom-20 lg:left-4 lg:w-fit">
          <RocketIcon className="w-5 h-5 text-neutral-600" />
          <h5 className="mb-1 font-bold leading-none tracking-tight font-title">{"OpenGeo"} a été mis à jour !</h5>
          <p className="text-sm [&_p]:leading-relaxed">
            La mise à jour {v.version} est disponible depuis le {new Date(v.date).toLocaleDateString("fr-FR")}.
          </p>
          <div className="absolute z-10 top-1 right-1.5">
            <Button
              size="sm"
              className="text-xs px-1.5 rounded py-0.5 h-fit hover:!bg-black hover:!text-white group-hover:bg-neutral-200 group-hover:text-black"
              variant="secondary"
              onClick={() => setVisible(false)}
            >
              Ok
            </Button>
          </div>
        </div>
      </SheetTrigger>
      <ChangelogSheetContent />
    </Sheet>
  );
};
