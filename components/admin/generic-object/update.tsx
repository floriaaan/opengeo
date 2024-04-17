import { useAuth } from "@/hooks/useAuth";
import { deleteObjectWithId, updateObjectWithId } from "@/lib/fetchers/generic-object";
import { log } from "@/lib/log";
import { getEntityFromContact } from "@/lib/user";
import { GenericField, GenericObject } from "@/types/generic-object";
import { DEFAULT_GENERIC_OBJECT_METADATA } from "@/types/global";
import { GenericObjectForm } from "@components/admin/generic-object";
import {
  Button,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@components/ui";
import { ArrowLeftIcon, EyeIcon, TrashIcon, XIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { toast } from "sonner";

/**
 * A function for rendering a form for updating a generic object.
 *
 * @remarks The function uses the `GenericObjectForm` component to render the form for updating the object. The function includes state for managing the object fields and children domains. The function uses the `useEffect` hook to retrieve the object data from the server and update the state. The function uses the `updateObject` function from the `genericObject` module to update the object on the server. The function is used in the `GestionObjetUpdate` page for updating a generic object.
 *
 * @param object - An object representing the generic object data.
 *
 * @returns A React component that renders a form for updating a generic object.
 */
export const GenericObjectUpdate = ({ data: object }: { data: GenericObject }) => {
  const router = useRouter();

  const { user } = useAuth();
  const entity = getEntityFromContact(user);

  // OBJET
  const [data, setData] = useState<GenericField[]>(object.values);
  const [metadata, setMetadata] = useState(object.metadata || DEFAULT_GENERIC_OBJECT_METADATA);

  // DOMAINES / CHILDREN
  const [children, setChildren] = useState<{ [key: string]: GenericObject[] }>(object.children); // Permet de gérer les domaines à ajouter dans la propriété "children"

  useEffect(() => {
    setData(object.values);
    setChildren(object.children || {});
    setMetadata(object.metadata || DEFAULT_GENERIC_OBJECT_METADATA);
  }, [object, entity]);

  async function updateObject() {
    try {
      const res = await updateObjectWithId(object._id, metadata, data, children);
      if (!res) throw new Error("Une erreur est survenue lors de la modification de l'objet.");

      toast.success("Votre objet a bien été modifié", { icon: "✅" });
      router.push("/admin/plugins/generic-object/" + object._id);
    } catch (e) {
      toast.error("Une erreur est survenue lors de la modification de l'objet.", {
        icon: "🚨",
        description: (e as Error)?.message,
      });
      log.error(e);
    }
  }

  async function deleteObject(id: string) {
    try {
      if (!id) throw new Error("L'information 'id' est manquante pour le traitement.");

      const res = await deleteObjectWithId(id);
      if (!res.success) throw new Error("Une erreur est survenue lors de la suppression de l'objet.");

      toast.success("Votre objet a bien été supprimé.", { icon: "🗑️" });
      router.push("/admin/plugins/generic-object");
    } catch (e) {
      toast.error("Une erreur est survenue lors de la suppression de l'objet.", {
        icon: "🚨",
        description: (e as Error)?.message,
      });
      log.error(e);
    }
  }

  return (
    <div className="flex flex-col w-full ">
      <Dialog>
        <GenericObjectForm
          title={"Modification d'un site"}
          {...{
            metadata,
            setMetadata,
            data,
            setData,
            _children: children,
            setChildren,
          }}
          submitText="Modifier l'objet"
          onSubmit={updateObject}
          actions={
            <div className="inline-flex items-center justify-between w-full grow gap-x-2">
              <Button variant="link" asChild>
                <Link href="/admin/plugins/generic-object">
                  <ArrowLeftIcon className="w-4 h-4" />
                  Annuler
                </Link>
              </Button>
              <div className="inline-flex items-center gap-2">
                <Button variant="outline" asChild>
                  <Link href={`/generic-object/${object._id}`}>
                    <EyeIcon className="w-4 h-4" />
                    {"Voir l'objet"}
                  </Link>
                </Button>
                <DialogTrigger asChild>
                  <Button variant="destructive">
                    <TrashIcon className="w-4 h-4" />
                    {"Supprimer l'objet"}
                  </Button>
                </DialogTrigger>
              </div>
            </div>
          }
        />
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-xl font-bold font-title text-opengeo-500">
              {"Suppression de l'objet"}
            </DialogTitle>
            <DialogDescription>
              Etes-vous sur de vouloir supprimer cet élément ? La suppression est définitive.
            </DialogDescription>
          </DialogHeader>
          <div className="inline-flex items-center justify-end gap-2">
            <DialogClose asChild>
              <Button variant="outline">
                <XIcon className="w-4 h-4" />
                Annuler
              </Button>
            </DialogClose>
            <Button variant="destructive" onClick={() => deleteObject(object._id)}>
              <TrashIcon className="w-4 h-4" />
              Supprimer
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
