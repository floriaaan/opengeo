import { useAuth } from "@/hooks/useAuth";
import { getEntityFromContact } from "@/lib/user";
import { GenericObject } from "@/types/generic-object";
import { SubObject } from "@components/generic-object/sub-object";
import {
  Badge,
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  ScrollArea,
} from "@components/ui";
import { EyeIcon, PencilIcon } from "lucide-react";
import Link from "next/link";

/**
 * A React component that renders a card for displaying information about a generic object.
 *
 * @remarks The component uses the `GenericObject` type from the `types` module to represent the generic object data. The component renders the name of the object, the number of properties it has, and the number of domains it belongs to. The component also includes a badge for displaying the entity type of the object and the time it was last updated. The component is used in the `GestionObjetList` component for displaying a list of generic objects.
 *
 * @param o - An object representing the generic object data.
 *
 * @returns A React component that renders a card for displaying information about a generic object.
 */
export const GenericObjectCard = (props: GenericObject & { isLink?: boolean }) =>
  props.isLink ? (
    <Link
      href={`/admin/plugins/generic-object/${props._id}`}
      key={props._id}
      className="flex flex-col justify-between min-h-[8rem] p-3 duration-150 border 2xl:p-4  rounded-xl gap-y-1 overflow-hidden hover:shadow-lg relative"
    >
      <CardContent {...props} />
    </Link>
  ) : (
    <Dialog key={props._id}>
      <DialogTrigger asChild>
        <div className="flex flex-col justify-between min-h-[8rem] p-3 duration-150 border 2xl:p-4  rounded-xl gap-y-1 overflow-hidden hover:shadow-lg relative cursor-pointer">
          <CardContent {...props} />
        </div>
      </DialogTrigger>
      <DialogContent className="flex flex-col w-full gap-4 sm:max-w-4xl">
        <DialogHeader className="flex flex-row items-start justify-between w-full flex-nowrap">
          <div className="flex flex-col ">
            <DialogTitle className="inline-flex items-center gap-1">
              Objet:
              <strong className="text-lg leading-none capitalize font-title text-opengeo">
                {props.metadata.label}
              </strong>
              &bull;
              <strong className="text-lg leading-none font-title text-opengeo">
                {(props.values.find(({ label }) => label === "Nom")?.value as string) || "Nom non renseigné"}
              </strong>
            </DialogTitle>
            <DialogDescription className="inline-flex items-center gap-1">
              <p className="text-sm text-gray-500">{Object.values(props.values).filter(Boolean).length} propriétés</p>
              &bull;
              <p className="text-sm text-gray-500">
                {Object.values(props.children).filter(Boolean).length} sous-objets
              </p>
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
              <Badge className="flex ml-2 flex-nowrap w-fit">{props.metadata.entity}</Badge>
            </DialogDescription>
          </div>
          <div className="inline-flex items-center gap-2 mr-6">
            <Button variant="outline" asChild>
              <Link href={`/generic-object/${props._id}`}>
                <EyeIcon className="w-4 h-4" />
                Voir
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href={`/admin/plugins/generic-object/${props._id}`}>
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
                    <p className="text-sm min-w-[128px] text-gray-500 capitalize font-title">{field.label}</p>
                    <p className="flex flex-col text-sm font-bold ">{field.value.toString()}</p>
                  </div>
                );
              })
            ) : (
              <p className="text-center col-span-full">Aucune propriété</p>
            )}
          </div>
          <hr className="my-4" />
          <div className="flex flex-col gap-1">
            {Object.values(props.children).length > 0 ? (
              Object.entries(props.children).map(([key, sub]) => {
                return <SubObject object={props} data={sub} key={key} />;
              })
            ) : (
              <p className="text-center col-span-full">Aucun sous-objet</p>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );

const CardContent = (props: GenericObject) => {
  const { user } = useAuth();
  const entity = getEntityFromContact(user);
  return (
    <>
      <div className="flex flex-col">
        <p className="inline-flex items-center gap-1 mb-1 text-lg font-bold font-title">
          {(props.values.find(({ label }) => label === "Nom")?.value as string) || "Nom non renseigné"}
        </p>
        <p className="text-sm text-gray-500">{props.values.length} propriétés</p>
        {props.children ? (
          <p className="text-sm text-gray-500">{Object.keys(props.children).length} sous-objets</p>
        ) : (
          <p className="text-sm text-gray-500"> Pas de sous-objets </p>
        )}
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
      </div>
      <div className="absolute bottom-2 right-2">
        <Badge variant={entity === props.metadata.entity ? "default" : "secondary"} className="shrink-0 w-fit">
          {props.metadata.entity}
        </Badge>
      </div>
      <div className="absolute inline-flex items-center gap-1 top-2 right-2">
        <span
          className="inline-block w-1 h-1 rounded-full"
          style={{ backgroundColor: props.metadata.color || "#1440dc" }}
        ></span>
        <Badge variant={"outline"}>
          <span className="first-letter:uppercase">{props.metadata.label}</span>
        </Badge>
      </div>
    </>
  );
};
