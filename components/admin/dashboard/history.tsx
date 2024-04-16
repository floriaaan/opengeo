import { CaretSortIcon, UpdateIcon } from "@radix-ui/react-icons";

import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useAuth } from "@/hooks/useAuth";
import { getEntityFromContact } from "@/lib/user";
import { HistoryType } from "@/types/history";
import { Card, CardHeader, CardTitle } from "@components/ui";
import { Avatar, AvatarFallback } from "@components/ui/avatar";
import { Badge } from "@components/ui/badge";
import { useState } from "react";

export const Histories = ({ data, loading }: { data?: HistoryType[]; loading: boolean }) => {
  const histories_groupByDay = data?.reduce(
    (acc, el) => {
      const date = new Date(el.metadata.created_at).toISOString().split("T")[0];
      if (!date) return acc;

      if (acc[date]) acc[date].push(el);
      else acc[date] = [el];

      return acc;
    },
    {} as Record<string, HistoryType[]>,
  );

  return (
    <Card
      className={`p-3 rounded-lg row-span-3 md:col-span-2 flex flex-col gap-y-2 transition duration-500 bg-gray-100/50  text-gray-700 relative overflow-hidden`}
    >
      <CardHeader className="flex flex-row items-center justify-between p-0 space-y-0">
        <CardTitle className="text-sm font-medium">Mises à jour des données</CardTitle>
        <UpdateIcon className="w-4 h-4 text-muted-foreground" />
      </CardHeader>
      <div className="flex flex-col w-full pr-2 overflow-y-scroll h-96 gap-y-1 max-h-96">
        {loading
          ? Array.from({ length: 2 }).map((_, i) => <HistoryCollapsibleItemSkeleton key={i} />)
          : Object.entries(histories_groupByDay || {}).map(([key, value]) => (
              <HistoryDayCollapsible key={key} date={key} histories={value} />
            ))}
      </div>
    </Card>
  );
};

const HistoryDayCollapsible = ({ date, histories }: { date: string; histories: HistoryType[] }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full gap-y-1">
      <div className="flex items-center justify-between h-9">
        <h4 className="text-xs underline text-muted-foreground">
          {new Date(date).toLocaleDateString("fr-FR", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </h4>
        {histories.length > 1 && (
          <div className="inline-flex items-center gap-x-1">
            <span className="text-sm font-semibold text-gray-500">+{histories.length - 1}</span>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm">
                <CaretSortIcon className="w-4 h-4" />
                <span className="sr-only">Toggle</span>
              </Button>
            </CollapsibleTrigger>
          </div>
        )}
      </div>
      <HistoryCollapsibleItem {...histories[0]} />
      <CollapsibleContent className="mt-1 space-y-1">
        {histories.slice(1).map((u) => (
          <HistoryCollapsibleItem key={u._id} {...u} />
        ))}
      </CollapsibleContent>
    </Collapsible>
  );
};

const HistoryCollapsibleItem = (u: HistoryType) => {
  const { user } = useAuth();
  const entity = getEntityFromContact(user);

  return (
    <div key={u._id} className="flex flex-col gap-1 p-3 text-sm bg-white border rounded-md">
      <div className="inline-flex items-center gap-x-1">
        <Avatar className="w-10 h-10">
          <AvatarFallback className="w-10 h-10 font-bold">
            {u.metadata.created_by?.cn
              ?.split(" ")
              .map((el) => el[0])
              .join("") || "?"}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <span className="font-bold truncate line-clamp-1">{u.metadata.created_by?.cn}</span>
          <span className="text-xs text-muted-foreground shrink-0">
            {new Date(u.metadata.created_at).toLocaleDateString("fr-FR", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
              hour: "numeric",
              minute: "numeric",
            })}
          </span>
        </div>
      </div>

      <span className="text-lg font-bold font-title line-clamp-1"></span>
      <ul className="mb-1 ml-4 list-disc list-inside">
        <li className="text-xs text-primary">
          <span>
            {u.metadata.type === "create" ? "Création" : u.metadata.type === "update" ? "Mise à jour" : "Suppression"}
          </span>
          :<span className="ml-1 font-bold ">{u.metadata.label}</span>
        </li>
        <li className="text-xs text-muted-foreground">
          A affecté {u.values.find((v) => v.label === "affectedCount")?.value.toString()} objet(s) et/ou sous-objets
        </li>
      </ul>
      <Badge className="ml-auto w-fit" variant={u.metadata.entity === entity ? "default" : "secondary"}>
        {u.metadata.entity}
      </Badge>
    </div>
  );
};

const HistoryCollapsibleItemSkeleton = () => (
  <div className="flex flex-col w-full mt-3">
    <div className="inline-flex justify-between w-full gap-1">
      <div className="w-1/3 h-4 bg-gray-200 rounded"></div>
      <div className="w-4 h-4 bg-gray-200 rounded"></div>
    </div>
    <div className="flex flex-col gap-1 p-3 mt-2 text-sm bg-white border rounded-md animate-pulse">
      <div className="inline-flex items-center w-full gap-x-1">
        <div className="w-10 h-10 bg-gray-200 rounded-full" />
        <div className="flex flex-col w-full gap-y-1">
          <div className="w-1/4 h-4 bg-gray-200 rounded" />
          <div className="w-2/3 h-3 bg-gray-200 rounded" />
        </div>
      </div>
      <ul className="ml-8 list-disc ">
        <li>
          <div className="w-3/4 h-4 mt-2 bg-gray-200 rounded" />
        </li>
        <li>
          <div className="w-full h-4 mt-1 bg-gray-200 rounded" />
        </li>
      </ul>
      <div className="w-1/3 h-4 mt-2 ml-auto bg-gray-200 rounded"></div>
    </div>
  </div>
);
