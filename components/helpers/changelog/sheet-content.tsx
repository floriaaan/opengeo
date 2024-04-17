import { useFetch } from "@/hooks/useFetch";
import { cn } from "@/lib/utils";
import { Flag, Version } from "@/pages/api/changelog";
import { APIResult } from "@/types/api";
import { Avatar, AvatarFallback, AvatarImage } from "@components/ui/avatar";
import { ScrollArea } from "@components/ui/scroll-area";
import { SheetContent, SheetHeader, SheetTitle } from "@components/ui/sheet";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@components/ui/tooltip";
import { CheckIcon, BoxIcon } from "lucide-react";

import Markdown from "markdown-to-jsx";

export const ChangelogSheetContent = () => {
  const { data: api, loading, error } = useFetch<APIResult<Version[]>>("/api/changelog");
  return (
    <SheetContent side="bottom" className="mt-16 max-h-[90vh] lg:max-w-5xl">
      <SheetHeader className="pb-4 mb-4 border-b">
        <SheetTitle>Historique des changements</SheetTitle>
      </SheetHeader>

      <ScrollArea className="max-h-[calc(100vh-10rem)] w-full overflow-auto flex flex-col pr-4 pb-16 mb-8">
        <div className="flex flex-col gap-y-2">
          {api?.data &&
            api?.data?.length > 0 &&
            api?.data?.map((v) => (
              <ul className="flex flex-col pb-2 mb-2 border-b last:border-b-0 gap-y-4" key={v.data.slug}>
                <VersionComponent {...v} />
              </ul>
            ))}
          {loading && (
            <p className="flex items-center justify-center w-full p-4 font-bold text-gray-500 font-title">
              Chargement...
            </p>
          )}
          {error && (
            <p className="flex items-center justify-center w-full p-4 font-bold text-gray-500 font-title">
              Erreur de chargement
            </p>
          )}
        </div>
      </ScrollArea>
    </SheetContent>
  );
};

const FlagMap = {
  FEATURE: [Flag.FEATURE],
  REFACTOR: [Flag.REFACTOR],
  DEPRECATION: [Flag.DEPRECATION],
  REMOVAL: [Flag.REMOVAL],
  BUGFIX: [Flag.BUGFIX],
  SECURITY: [Flag.SECURITY],
  PERFORMANCE: [Flag.PERFORMANCE],
  DOCUMENATION: [Flag.DOCUMENATION],
  STYLE: [Flag.STYLE],
  MAINTENANCE: [Flag.MAINTENANCE],
};

const FlagChipClassName = {
  "": "",
  [Flag.FEATURE]: "bg-indigo-200 text-indigo-700 hover:bg-indigo-300 hover:text-indigo-800",
  [Flag.REFACTOR]: "bg-emerald-200 text-emerald-700 hover:bg-emerald-300 hover:text-emerald-800",
  [Flag.DEPRECATION]: "bg-red-200 text-red-700 hover:bg-red-300 hover:text-red-800",
  [Flag.BUGFIX]: "bg-amber-200 text-amber-700 hover:bg-amber-300 hover:text-amber-800",
  [Flag.SECURITY]: "bg-amber-200 text-amber-700 hover:bg-amber-300 hover:text-amber-800",
  [Flag.PERFORMANCE]: "bg-indigo-200 text-indigo-700 hover:bg-indigo-300 hover:text-indigo-800",
  [Flag.DOCUMENATION]: "bg-neutral-200 text-neutral-700 hover:bg-neutral-300 hover:text-neutral-800",
  [Flag.STYLE]: "bg-neutral-200 text-neutral-700 hover:bg-neutral-300 hover:text-neutral-800",
  [Flag.MAINTENANCE]: "bg-red-200 text-red-700 hover:bg-red-300 hover:text-red-800",
};

import packageInfo from "package.json";
const { version } = packageInfo;

const VersionComponent = (v: Version) => {
  const isCurrent = v.version === version || (version.includes(v.version) && version.split(".").length !== 3);
  return (
    <li key={v.version} className={cn(!isCurrent ? "opacity-50" : "")}>
      <div className="relative h-full">
        <span className="absolute top-5 left-5 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true"></span>
        <div className="relative flex items-start space-x-3">
          <div>
            <div className="relative px-1">
              {isCurrent ? (
                <div className="flex items-center justify-center w-8 h-8 bg-green-200 rounded-full ring-8 ring-white">
                  <CheckIcon className="w-4 h-4 text-green-800" />
                </div>
              ) : (
                <div className="flex items-center justify-center w-8 h-8 bg-indigo-200 rounded-full ring-8 ring-white">
                  <BoxIcon className="w-4 h-4 text-indigo-800" />
                </div>
              )}
            </div>
          </div>
          <div className="flex flex-col flex-1 min-w-0 py-0">
            <div className="inline-flex items-center justify-between w-full">
              <div className="flex flex-col text-gray-500 text-md">
                <div className="inline-flex items-center gap-x-2">
                  <span className="text-xl font-bold text-gray-900 font-title">Version {v.version}</span>

                  {(v.data.flags || []).map((f) => {
                    // @ts-ignore
                    const flag = FlagMap[f];
                    // @ts-ignore
                    const chip_className = FlagChipClassName[flag];

                    return (
                      <span
                        key={v.version + ":" + f}
                        className={cn(
                          "text-xs rounded px-2 py-0.5  font-medium cursor-default duration-700 select-none",
                          chip_className,
                        )}
                      >
                        {flag}
                      </span>
                    );
                  })}
                </div>
                <span className="text-xs text-gray-500 whitespace-nowrap">
                  {new Date(v.data.date).toLocaleDateString("fr-FR", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </div>

              <div className="inline-flex items-center mt-0.5">
                {v.data.contributors.map((c) => (
                  <TooltipProvider key={`${v.version}:${c.id}`}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Avatar className="w-10 h-10 -ml-2 border-2 border-white first:ml-0">
                          <AvatarImage src={`/img/contributors/${c.id.toLowerCase()}.jpg`} />
                          <AvatarFallback>
                            {c.cn
                              .replace(/\([^)]*\)/, "")
                              .trim()
                              .split(" ")
                              .map((w) => w[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                      </TooltipTrigger>
                      <TooltipContent side="left">{`${c.cn} - ${c.id}`}</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ))}
              </div>
            </div>

            <Markdown className=" prose-sm prose-h1:text-lg prose-h1:my-3 prose-h2:my-4 w-full pb-3 text-xs prose max-w-[90%] text-justify prose-li:ml-4 ">
              {v.content}
            </Markdown>
          </div>
        </div>
      </div>
    </li>
  );
};
