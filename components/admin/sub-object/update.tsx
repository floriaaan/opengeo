import { deleteSubObjectWithId, getOneSubObjectWithId, updateSubObjectWithId } from "@/lib/fetchers/sub-object";
import { Field } from "@/types/generic-object";
import { SubObjectForm } from "@components/admin/sub-object/form";
import { Button } from "@components/ui/button";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { log } from "@/lib/log";
import { SubObjectType } from "@/models";
import { DEFAULT_SUB_OBJECT_METADATA, SubObjectMetadata } from "@/types/global";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@components/ui/dialog";
import { TrashIcon, XIcon } from "lucide-react";

/**
 * A React component that renders a form for updating a sub-object in the domain management page.
 *
 * @remarks The component uses the `Field` type from the `types` module to represent the sub-object fields. The component includes state for managing the sub-object fields, authorization level, and name. The component uses the `updateSubObject` function from the `subObject` module to update the sub-object on the server. The component is used in the `GestionObjetUpdate` page for updating a sub-object.
 *
 * @param subObject - An object representing the sub-object data to be updated.
 *
 * @returns A React component that renders a form for updating a sub-object in the domain management page.
 */
export const SubObjectUpdate = (subObject: SubObjectType) => {
  const router = useRouter();

  const [data, setData] = useState<Field[]>([]);
  const [metadata, setMetadata] = useState<SubObjectMetadata>(subObject.metadata || DEFAULT_SUB_OBJECT_METADATA);

  // Permet de re-rendre le composant au changement d'objet
  useEffect(() => {
    setData(subObject.values);
    setMetadata(subObject.metadata);
  }, [subObject]);

  async function _delete() {
    try {
      if (!subObject._id) throw new Error("L'information 'id' est manquante pour le traitement.");

      const res = await deleteSubObjectWithId(subObject._id);
      if (!res.success) throw new Error("Une erreur est survenue lors de la suppression du sous-objet.");

      toast.success("Votre sous-objet a bien été supprimé.", { icon: "✅" });
      router.push("/admin/plugins/sub-object");
    } catch (e) {
      log.error(e);
      toast.error("Une erreur est survenue lors de la suppression de l'objet.", {
        icon: "🚨",
        description: (e as Error)?.message,
      });
    }
  }

  async function handler() {
    try {
      if (!subObject._id) throw new Error("L'information 'id' est manquante pour le traitement.");

      const res = await updateSubObjectWithId(subObject._id, metadata, data);
      if (!res) throw new Error("Une erreur est survenue lors de la modification du sous-objet.");

      toast.success("Votre sous-objet à bien été modifié.", { icon: "✅" });

      const newSubObject = await getOneSubObjectWithId(subObject._id);
      if (!newSubObject) throw new Error("Une erreur est survenue lors de la récupération du sous-objet modifié.");
      setData(newSubObject.values);
    } catch (e) {
      toast.error("Une erreur est survenue lors de la modification de l'objet.", {
        icon: "🚨",
        description: (e as Error)?.message,
      });
      log.error(e);
    }
  }

  return (
    <div className="flex flex-col w-full h-full gap-2 p-6 mx-auto max-w-7xl">
      <Dialog>
        <SubObjectForm
          title="Formulaire de modification de sous-objet"
          {...{
            data,
            setData,

            metadata,
            setMetadata,

            onSubmit: handler,
            submitText: "Modifier",
          }}
          actions={
            <DialogTrigger asChild>
              <Button variant="destructive">
                <TrashIcon className="w-4 h-4" />
                {"Supprimer le sous-objet"}
              </Button>
            </DialogTrigger>
          }
        />

        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-xl font-bold font-title text-opengeo-500">
              Suppression du sous-objet
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
            <Button variant="destructive" onClick={_delete}>
              <TrashIcon className="w-4 h-4" />
              Supprimer
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
