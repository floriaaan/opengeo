import { deleteTemplateSubObject } from "@/lib/fetchers/sub-object/template";
import { GenericObject, SubObjectTemplate } from "@/types/generic-object";
import { Badge } from "@components/ui/badge";
import { Button } from "@components/ui/button";
import { formatRelative } from "date-fns";
import { fr } from "date-fns/locale";
import { TrashIcon } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@components/ui/scroll-area";

export const TemplateRow = ({ revalidate, ...data }: SubObjectTemplate & { revalidate: () => void }) => {
  return (
    <Dialog key={data._id}>
      <DialogTrigger>
        <div className="inline-flex items-center justify-between w-full gap-2 p-2 pl-4 duration-150 border hover:shadow-lg rounded-xl">
          <div className="inline-flex items-center w-full gap-2 grow">
            <p className="text-lg font-bold capitalize font-title ">{data.label}</p>

            <Badge className="flex flex-nowrap w-fit">{data.entity}</Badge>
          </div>

          <div className="inline-flex items-center gap-2 shrink-0">
            <span className="text-xs text-right text-gray-500 line-clamp-2">{`mis à jour ${formatRelative(
              new Date(data.updated_at),
              new Date(),
              {
                locale: fr,
              },
            )}`}</span>
            <Button variant="destructive" onClick={() => deleteTemplateSubObject(data._id).then(revalidate)}>
              <TrashIcon className="w-4 h-4" />
              Supprimer
            </Button>
          </div>
        </div>
      </DialogTrigger>
      <DialogContent className="flex flex-col w-full gap-4 sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>Modèle: {data.label}</DialogTitle>
          <DialogDescription className="inline-flex items-center gap-1">
            <p className="text-sm text-gray-500">{Object.values(data.values).filter(Boolean).length} propriétés</p>
            &bull;
            <p className="text-sm text-gray-500">
              {`mis à jour ${formatRelative(new Date(data.updated_at), new Date(), {
                locale: fr,
              })}`}
            </p>
            <Badge className="flex ml-2 flex-nowrap w-fit">{data.entity}</Badge>
          </DialogDescription>
        </DialogHeader>

        <hr />
        <ScrollArea className="max-h-[75vh] h-full">
          <div className="gap-4 columns-2 2xl:columns-3 [&>div:not(:first-child)]:mt-4 h-full shrink-0">
            {Object.entries(data.values).filter(Boolean).length ? (
              Object.entries(data.values).map(([, children]) => {
                const c = children as unknown as GenericObject; // why is this needed?
                if (!c || !Array.isArray(c.values)) return null;
                return (
                  <div key={c.metadata.label} className="flex flex-col gap-1 p-2 border rounded-sm">
                    <p className="text-sm font-bold capitalize font-title">{c.metadata?.label || "?"}</p>
                    <p className="flex flex-col text-sm text-gray-500">
                      {(c.values || []).map((e) => (
                        <span key={`${c.metadata.label}-${e.label}`} className="inline-flex items-center">
                          <strong>{e.label}</strong>
                          <span>: {e.type}</span>
                        </span>
                      ))}
                    </p>
                  </div>
                );
              })
            ) : (
              <p className="text-center col-span-full">Aucune propriété</p>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
