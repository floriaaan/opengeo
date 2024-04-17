import { useAuth } from "@/hooks/useAuth";
import { getEntityFromContact } from "@/lib/user";
import { SubObjectType } from "@/models";
import { roles } from "@components/habilitations/roles";
import { Badge } from "@components/ui/badge";
import { Button } from "@components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@components/ui/dialog";
import { ScrollArea } from "@components/ui/scroll-area";
import { PencilIcon } from "lucide-react";
import Link from "next/link";

/**
 * A React component that renders a card for displaying a sub-object in the domain management page.
 *
 * @remarks The component uses the `GenericObject` type from the `types` module to represent the sub-object data. The component includes a link to the sub-object page with the sub-object ID as a parameter. The component displays the sub-object label, number of properties, and access level. The component also displays the last update time and the entity name of the sub-object.
 *
 * @param props - An object representing the sub-object data.
 *
 * @returns A React component that renders a card for displaying a sub-object in the domain management page.
 */
export const SubObjectCard = (props: SubObjectType & { isLink?: boolean }) =>
  props.isLink ? (
    <Link
      href={`/admin/plugins/sub-object/${props._id}`}
      key={props._id}
      className="flex flex-col justify-between min-h-[8rem] p-3 duration-150 border 2xl:p-4  rounded-xl gap-y-1 overflow-hidden hover:shadow-lg"
    >
      <CardContent {...props} />
    </Link>
  ) : (
    <Dialog key={props._id}>
      <DialogTrigger asChild>
        <div className="flex flex-col justify-between min-h-[8rem] p-3 duration-150 border 2xl:p-4  rounded-xl gap-y-1 overflow-hidden hover:shadow-lg cursor-pointer">
          <CardContent {...props} />
        </div>
      </DialogTrigger>
      <DialogContent className="flex flex-col w-full gap-4 sm:max-w-4xl">
        <DialogHeader className="flex flex-row items-start justify-between w-full flex-nowrap">
          <div className="flex flex-col ">
            <DialogTitle className="inline-flex items-center gap-1">
              Sous-objet:
              <strong className="text-lg leading-none capitalize font-title text-opengeo">
                {props.metadata.label}
              </strong>
            </DialogTitle>
            <DialogDescription className="inline-flex items-center gap-1">
              <p className="text-sm text-gray-500">{Object.values(props.values).filter(Boolean).length} propriétés</p>
              &bull;
              <p className="text-sm text-gray-500">
                {`mis à jour le ${new Date(props.metadata.updated_at).toLocaleString("fr-FR", {
                  hour: "numeric",
                  minute: "numeric",
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })} par ${props.metadata.updated_by?.cn || props.metadata.created_by?.cn || "inconnu"}`}
              </p>
              <div className="">
                <Badge className="flex ml-2 flex-nowrap w-fit">{props.metadata.entity}</Badge>
              </div>
            </DialogDescription>
          </div>
          <div className="mr-6">
            <Button variant="outline" asChild>
              <Link href={`/admin/plugins/sub-object/${props._id}`}>
                <PencilIcon className="w-4 h-4" />
                Modifier
              </Link>
            </Button>
          </div>
        </DialogHeader>
        <hr />
        <ScrollArea className="max-h-[75vh] h-full overflow-x-visible">
          <div className="flex flex-col gap-1">
            {props.values.length > 0 ? (
              props.values.map((field) => {
                return (
                  <div key={field.label} className="inline-flex items-center gap-1">
                    <p className="text-sm min-w-[128px]  capitalize font-title">{field.label}</p>
                    <p className="flex flex-col text-sm font-bold text-gray-500">{field.type}</p>
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

const CardContent = (props: SubObjectType) => {
  const { user } = useAuth();
  const entity = getEntityFromContact(user);
  return (
    <>
      <div className="flex flex-col">
        <p className="mb-1 text-lg font-bold capitalize font-title">{props.metadata.label}</p>
        <p className="text-sm text-gray-500">{props.values.length} propriétés</p>
        <p className="text-sm text-gray-500">{`Niveau d'accès: ${
          roles.find((r) => r.value === props.metadata.authorization)?.label || "Utilisateur"
        }`}</p>
      </div>

      <div className="flex flex-col justify-between w-full gap-1 2xl:items-center 2xl:flex-row">
        <div className="flex flex-col gap-0.5 text-xs text-gray-500">
          <span>{`mis à jour le ${new Date(props.metadata.updated_at).toLocaleString("fr-FR", {
            hour: "numeric",
            minute: "numeric",
            day: "numeric",
            month: "short",
            year: "numeric",
          })}`}</span>
          {props.metadata.updated_by && <p>{`par ${props.metadata.updated_by.cn}`}</p>}
          {props.metadata.created_by && !props.metadata.updated_by && (
            <p>{`créé par ${props.metadata.created_by.cn}`}</p>
          )}
        </div>
        <Badge variant={entity === props.metadata.entity ? "default" : "secondary"} className="shrink-0 w-fit">
          {props.metadata.entity}
        </Badge>
      </div>
    </>
  );
};
