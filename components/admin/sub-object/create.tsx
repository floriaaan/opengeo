import { useAuth } from "@/hooks/useAuth";
import { createSubObject } from "@/lib/fetchers/sub-object";
import { getEntityFromContact } from "@/lib/user";
import { Field } from "@/types/generic-object";
import { DEFAULT_SUB_OBJECT_METADATA, SubObjectMetadata } from "@/types/global";
import { SubObjectFlags } from "@/types/sub-object";
import { SubObjectForm } from "@components/admin/sub-object/form";
import { useRouter } from "next/router";
import { useState } from "react";
import { toast } from "sonner";

/**
 * A React component that renders a form for creating a sub-object in the domain management page.
 *
 * @remarks The component uses the `Field` type from the `types` module to represent the sub-object fields. The component includes state for managing the sub-object fields, authorization level, and name. The component uses the `createSubObject` function from the `subObject` module to create the sub-object on the server. The component is used in the `GestionObjetCreate` page for creating a sub-object.
 *
 * @returns A React component that renders a form for creating a sub-object in the domain management page.
 */
export const SubObjectCreate = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [metadata, setMetadata] = useState<SubObjectMetadata>({
    ...DEFAULT_SUB_OBJECT_METADATA,
    entity: getEntityFromContact(user),
  });
  const [data, setData] = useState<Field[]>([]);

  const [flags, setFlags] = useState<SubObjectFlags>({ autoLink: false });

  async function create() {
    try {
      const res = await createSubObject(metadata, data, flags);
      if (!res) throw new Error("Une erreur est survenue lors de la création du sous-objet.");

      toast.success("Votre sous-objet a bien été créé.", {
        icon: "✅",
        description: "Vous allez être redirigé vers la page du sous-objet.",
      });
      router.push(`/admin/plugins/sub-object/${res._id}`);
    } catch (e) {
      toast.error("Une erreur est survenue lors de la création du sous-objet.", {
        icon: "🚨",
        description: (e as Error)?.message,
      });
    }
  }

  return (
    <div className="flex flex-col w-full h-full gap-2 p-6 mx-auto max-w-7xl">
      <SubObjectForm
        title="Formulaire de création de sous-objet"
        {...{
          metadata,
          setMetadata,

          data,
          setData,

          onSubmit: create,
          submitText: "Créer",

          flags,
          setFlags,
        }}
      />
    </div>
  );
};
