import { GenericField, GenericObject } from "@/types/generic-object";
import { SuggestionForm } from "@components/suggestion/form";
import { Button } from "@components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@components/ui/dialog";
import { Pencil1Icon } from "@radix-ui/react-icons";
import { useState } from "react";

export const Suggestion = ({ data, object, path }: { data: GenericField; object: GenericObject; path: string }) => {
  const [open, onOpenChange] = useState(false);

  if (!object._id) return null;
  if (data.type === "entity" || data.type === "file") return null;

  return (
    <Dialog {...{ open, onOpenChange }}>
      <DialogTrigger asChild>
        <Button variant="ghost" className="w-5 h-5 shrink-0" size="icon">
          <Pencil1Icon className="w-3 h-3 shrink-0" />
        </Button>
      </DialogTrigger>
      <DialogContent className="md:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            Suggestion de modification pour {data.label} sur{" "}
            {object.values.find((v) => v.label === "Nom")?.value.toString()}
          </DialogTitle>
        </DialogHeader>
        <SuggestionForm initialValue={data.value.toString()} path={path} closeDialog={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  );
};
