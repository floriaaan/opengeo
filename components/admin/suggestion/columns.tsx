import { canHaveAccess } from "@/hooks/useHabilitation";
import { _get } from "@/lib/deep-get-set";
import { acceptSuggestion, rejectSuggestion } from "@/lib/fetchers/suggestion";
import { GenericObjectDocument } from "@/models";
import { SuggestionDocument } from "@/models/Suggestion";
import { SuggestionDialog } from "@components/admin/suggestion/dialog";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Avatar, AvatarFallback } from "@components/ui/avatar";
import { Button } from "@components/ui/button";
import { CellContext, ColumnDef } from "@tanstack/react-table";
import { CheckIcon, TrashIcon } from "lucide-react";
import { toast } from "sonner";

export const columns_suggestions: ColumnDef<SuggestionDocument & { original: GenericObjectDocument }>[] = [
  {
    accessorKey: "original",
    header: "Objet",
    cell: (props) => {
      const cell = props.getValue() as GenericObjectDocument;
      const name = cell.values?.find((v) => v.label === "Nom")?.value.toString() ?? "Inconnu";
      return (
        <div className="flex flex-col gap-1">
          <strong className=" block w-32 truncate">{name}</strong>
          <span className="text-xs text-gray-500">{cell.metadata.entity}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "path",
    header: "Champ",
    cell: (props) => {
      const cell = props.getValue() as SuggestionDocument["path"];
      const object = props.row.original.original;

      /**
       * path is either on values or children
       *
       * - if path is on values, it will be formatted like this:
       *      `<objectId>`.values[`<index>`].value
       * - if path is on children, it will be formatted like this:
       *      `<objectId>`.children[`<index>`].values[`<index>`].value
       */

      // Use the custom function to get the label
      const label = _get(
        object,
        cell
          .split(".")
          .slice(1)
          .join(".")
          .replace(/\.value$/, ".label"),
      );

      return <span>{label}</span>;
    },
  },

  {
    accessorKey: "suggestion",
    id: "suggestion",
    header: "Suggestion",
    cell: (props) => {
      const cell = (props.getValue() as SuggestionDocument["suggestion"]).toString();
      const row = props.row.original;
      return (
        <div className="flex flex-col gap-1">
          <strong>{cell}</strong>
          <span className="text-xs text-gray-500">Valeur initiale: {row.initialValue.toString()}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "user",
    id: "user.infos",
    header: "Utilisateur",
    cell: (props) => {
      const cell = props.getValue() as SuggestionDocument["user"];
      const entity = props.row.original.entity;
      return (
        <span className="inline-flex gap-1">
          <Avatar>
            {/* TODO: outlook */}
            {/* <AvatarImage src="https://github.com/shadcn.png" /> */}
            <AvatarFallback>
              <span>{cell?.cn.split(" ").map((w) => w[0])}</span>
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col gap-0.5">
            <span className="inline-flex items-center gap-1">
              <strong>{cell?.cn}</strong>-<span>{cell?.id}</span>
            </span>
            <span className="text-xs text-gray-500">{entity}</span>
          </div>
        </span>
      );
    },
  },

  {
    accessorKey: "createdAt",
    header: "Date",
    cell: (props) => {
      const cell = props.getValue() as SuggestionDocument["createdAt"];
      return (
        <span className="text-sm">
          {new Date(cell).toLocaleDateString("fr-FR", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "numeric",
            minute: "numeric",
          })}
        </span>
      );
    },
  },
  {
    accessorKey: "actions",
    header: () => <div className="text-right">Actions</div>,
    // @ts-ignore
    cell: ({ row, revalidate }: CellContext<SuggestionDocument, unknown> & { revalidate: () => void }) => {
      const s = row.original as SuggestionDocument & { original: GenericObjectDocument };
      const haveAccess = canHaveAccess(s.entity, 100);
      if (!haveAccess) return null;
      return (
        <div className="flex justify-end flex-row gap-2">
          <SuggestionDialog document={s} revalidate={revalidate} />
          <Button
            variant={"default"}
            onClick={async () => {
              let toastId = toast.loading("Validation de la suggestion en cours...", {
                icon: "👍",
              });
              try {
                const data = await acceptSuggestion(s._id);
                if (!data) throw new Error("Une erreur est survenue lors de la validation de la suggestion");
                toast("Suggestion validée avec succès", { icon: "✅", id: toastId });
                revalidate();
              } catch (e) {
                toast.error((e as Error)?.message, { icon: "🚨", id: toastId });
              }
            }}
            size="icon"
          >
            <CheckIcon className="w-4 h-4" />
            <span className="sr-only">Accepter</span>
          </Button>
          <Button
            variant="destructive"
            onClick={async () => {
              let toastId = toast.loading("Rejet de la suggestion en cours...", {
                icon: "👎",
              });
              try {
                const data = await rejectSuggestion(s._id);
                if (!data) throw new Error("Une erreur est survenue lors du rejet de la suggestion");
                toast("Suggestion rejetée avec succès", { icon: "✅", id: toastId });
                revalidate();
              } catch (e) {
                toast.error((e as Error)?.message, { icon: "🚨", id: toastId });
              }
            }}
            size="icon"
          >
            <TrashIcon className="w-4 h-4" />
            <span className="sr-only">Supprimer</span>
          </Button>
        </div>
      );
    },
  },
];
