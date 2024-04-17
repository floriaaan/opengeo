import { canHaveAccess } from "@/hooks/useHabilitation";
import { acceptHabilitationDemande, deleteHabilitation, deleteHabilitationDemande } from "@/lib/fetchers/habilitation";
import { HabilitationDemandeDocument, HabilitationDocument } from "@/models/Habilitation";
import { roles } from "@components/habilitations/roles";
import { Avatar, AvatarFallback } from "@components/ui/avatar";
import { Button } from "@components/ui/button";
import { CellContext, ColumnDef } from "@tanstack/react-table";
import { CheckIcon, TrashIcon } from "lucide-react";

export const columns_habilitationDemande: ColumnDef<HabilitationDemandeDocument>[] = [
  {
    accessorKey: "user",
    id: "user.infos",
    header: "Utilisateur",
    cell: (props) => {
      const cell = props.getValue() as HabilitationDocument["validatedBy"];
      return (
        <span className="inline-flex gap-2">
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
            <span className="text-xs text-gray-500">{cell?.entity}</span>
          </div>
        </span>
      );
    },
  },
  {
    accessorKey: "user",
    id: "user.entity",
    header: "Entité",
    cell: (props) => {
      const cell = props.getValue() as HabilitationDemandeDocument["user"];
      return <span>{cell?.entity}</span>;
    },
  },
  {
    accessorKey: "role",
    header: "Rôle demandé",
    cell: (props) => {
      const cell = props.getValue() as HabilitationDocument["role"];
      const { label } = roles.find((r) => r.value === cell) || { label: "Inconnu" };
      return <span>{label}</span>;
    },
  },
  {
    accessorKey: "createdAt",
    header: "Date de demande",
    cell: (props) => {
      const cell = props.getValue() as HabilitationDemandeDocument["createdAt"];
      return (
        <span>
          {new Date(cell).toLocaleDateString("fr-FR", {
            year: "numeric",
            month: "long",
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
    cell: ({ row, revalidate }: CellContext<HabilitationDemandeDocument, unknown> & { revalidate: () => void }) => {
      const demande = row.original as HabilitationDemandeDocument;
      const haveAccess = canHaveAccess(demande.user.entity, 100);
      if (!haveAccess) return null;
      return (
        <div className="flex justify-end flex-row gap-2">
          <Button size={"icon"} onClick={() => acceptHabilitationDemande(demande._id).then(revalidate)}>
            <CheckIcon className="w-4 h-4" />
            <span className="sr-only">Accepter la demande</span>
          </Button>
          <Button
            size={"icon"}
            variant="destructive"
            onClick={() => deleteHabilitationDemande(demande._id).then(revalidate)}
          >
            <TrashIcon className="w-4 h-4" />
            <span className="sr-only">Supprimer la demande</span>
          </Button>
        </div>
      );
    },
  },
];

export const columns_habilitation: ColumnDef<HabilitationDocument>[] = [
  {
    accessorKey: "user",
    id: "user.infos",
    header: "Utilisateur",
    cell: (props) => {
      const cell = props.getValue() as HabilitationDocument["validatedBy"];
      return (
        <span className="inline-flex gap-2">
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
            <span className="text-xs text-gray-500">{cell?.entity}</span>
          </div>
        </span>
      );
    },
  },
  {
    accessorKey: "user",
    id: "user.entity",
    header: "Entité",
    cell: (props) => {
      const cell = props.getValue() as HabilitationDocument["user"];
      return <span>{cell?.entity}</span>;
    },
  },
  {
    accessorKey: "role",
    header: "Rôle",
    cell: (props) => {
      const cell = props.getValue() as HabilitationDocument["role"];
      const { label } = roles.find((r) => r.value === cell) || { label: "Inconnu" };
      return <span>{label}</span>;
    },
  },
  {
    accessorKey: "validatedBy",
    id: "validatedBy.infos",
    header: "Validé par",
    cell: (props) => {
      const cell = props.getValue() as HabilitationDocument["validatedBy"];
      return (
        <span className="inline-flex gap-2">
          <Avatar>
            {/* TODO: outlook */}
            {/* <AvatarImage src="https://github.com/shadcn.png" /> */}
            <AvatarFallback>
              <span>{cell?.cn?.split(" ").map((w) => w[0])}</span>
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col gap-0.5">
            <span className="inline-flex items-center gap-1">
              <strong>{cell?.cn}</strong>-<span>{cell?.id}</span>
            </span>
            <span className="text-xs text-gray-500">{cell?.entity}</span>
          </div>
        </span>
      );
    },
  },
  {
    accessorKey: "validatedAt",
    header: "Date de validation",
    cell: (props) => {
      const cell = props.getValue() as HabilitationDocument["validatedAt"];
      return (
        <span>
          {new Date(cell).toLocaleDateString("fr-FR", {
            year: "numeric",
            month: "long",
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
    cell: ({ row, revalidate }: CellContext<HabilitationDemandeDocument, unknown> & { revalidate: () => void }) => {
      const demande = row.original as HabilitationDemandeDocument;
      const haveAccess = canHaveAccess(undefined, 1000);
      if (!haveAccess) return null;
      return (
        <div className="flex justify-end">
          <Button size={"icon"} variant="destructive" onClick={() => deleteHabilitation(demande._id).then(revalidate)}>
            <TrashIcon className="w-4 h-4" />
            <span className="sr-only">Révoquer</span>
          </Button>
        </div>
      );
    },
  },
];
