import { useAuth } from "@/hooks/useAuth";
import { createObject } from "@/lib/fetchers/generic-object";
import { getEntityFromContact } from "@/lib/user";
import { GenericField, GenericObject, GenericObjectMetadata } from "@/types/generic-object";
import { DEFAULT_GENERIC_OBJECT_METADATA } from "@/types/global";
import { GenericObjectForm } from "@components/admin/generic-object";
import { Button } from "@components/ui";
import { ArrowLeftIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { toast } from "sonner";

type SubObjects = { [key: string]: GenericObject[] };

const DEFAULT_OBJECT_FIELDS: GenericField[] = [
  { label: "Nom", type: "string", value: "" },
  { label: "Label", type: "string", value: "" },
  { label: "Adresse", type: "string", value: "" },
  { label: "Coordonnées GPS", type: "coordinates", value: "" },
];

/**
 * A React component that renders a card for displaying information about a generic object.
 *
 * @remarks The component uses the `GenericObject` type from the `types` module to represent the generic object data. The component renders the name of the object, the number of properties it has, and the number of domains it belongs to. The component also includes a badge for displaying the entity type of the object and the time it was last updated. The component is used in the `GestionObjetList` component for displaying a list of generic objects.
 *
 * @param o - An object representing the generic object data.
 *
 * @returns A React component that renders a card for displaying information about a generic object.
 */
export const GenericObjectCreate = () => {
  const router = useRouter();
  const { user } = useAuth();
  const entity = getEntityFromContact(user);

  const [metadata, setMetadata] = useState<GenericObjectMetadata>({ ...DEFAULT_GENERIC_OBJECT_METADATA, entity });
  const [data, setData] = useState<GenericField[]>([]);

  // DOMAINES / CHILDREN
  const [children, setChildren] = useState<SubObjects>({}); // Permet de gérer les domaines à ajouter dans la propriété
  useEffect(() => {
    if (metadata.label === "site")
      setData([...DEFAULT_OBJECT_FIELDS, { label: "Direction Régionale", type: "entity", value: entity }]);
    else setData([]);
  }, [entity, metadata.label]);

  async function create() {
    try {
      const res = await createObject(metadata, data, children);
      if (!res) throw new Error("Une erreur est survenue lors de la création de l'objet.");
      toast.success("Votre objet a bien été créé.", {
        icon: "✅",
        description: "Vous allez être redirigé vers la page de l'objet.",
      });
      router.push("/admin/plugins/generic-object/" + res._id);
    } catch (e) {
      toast.error("Une erreur est survenue lors de la création de l'objet.", {
        icon: "🚨",
        description: (e as Error)?.message,
      });
    }
  }

  return (
    <GenericObjectForm
      title={"Formulaire de création d'objet"}
      {...{
        metadata,
        setMetadata,
        data,
        setData,
        _children: children,
        setChildren,
      }}
      submitText="Créer"
      onSubmit={create}
      actions={
        <div className="inline-flex items-center justify-between w-full grow gap-x-2">
          <Button variant="link" asChild>
            <Link href="/admin/plugins/generic-object">
              <ArrowLeftIcon className="w-4 h-4" />
              Annuler
            </Link>
          </Button>
        </div>
      }
    />
  );
};
