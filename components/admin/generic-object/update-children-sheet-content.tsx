import { fetcher } from "@/lib/fetchers";
import { getOneSubObjectWithName } from "@/lib/fetchers/sub-object";
import { getIcon } from "@/lib/file/getIcon";
import { log } from "@/lib/log";
import { FileDocument } from "@/models/File";
import { GenericObject } from "@/types/generic-object";
import { Button } from "@components/ui/button";
import { Checkbox } from "@components/ui/checkbox";
import { Input } from "@components/ui/input";
import { PlusIcon, TrashIcon, XIcon } from "lucide-react";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { toast } from "sonner";

/**
 * A React component that renders a modal for managing the children of a domain object.
 *
 * @remarks The component uses the `getOneSubObjectWithName` function from the `subObject` module to retrieve the sub-object data from the server. The component renders a list of `GenericObjectCard` components for each child of the domain object. The component includes a button for adding a new child to the domain object and a button for deleting a child from the domain object. The component is used as a modal in the `GestionObjetCreate` component.
 *
 * @param setOpenModal - A function for setting the state of the modal.
 * @param domainObject - An object representing the children of the domain object.
 *
 * @returns A React component that renders a modal for managing the children of a domain object.
 */
export const UpdateChildrenSheetContent = ({
  subObject,
  setChildren,
  onCloseModal,
}: {
  subObject: { [key: string]: GenericObject[] };
  setChildren: Dispatch<SetStateAction<{ [key: string]: GenericObject[] }>>;
  onCloseModal: () => void;
}) => {
  const [newDomain, setNewDomain] = useState<{ [key: string]: GenericObject[] }>(subObject);
  const [emptyObject, setEmptyObject] = useState<GenericObject>();

  useEffect(() => {
    getOneSubObjectWithName(Object.keys(subObject)[0].toString()).then((data) =>
      setEmptyObject(data as unknown as GenericObject),
    );
  }, [subObject]);

  function update(updateFunction: (items: GenericObject[]) => void) {
    const domain = newDomain;
    const [key, value] = Object.entries(domain)[0];

    updateFunction(value);

    const newObj = { [key]: value as GenericObject[] };
    setNewDomain(newObj);
    setChildren((old) => ({ ...old, [key]: value as GenericObject[] }));
  }

  const addOne = () => update((items) => items.push(emptyObject as GenericObject));
  const deleteOne = (i: number) => update((items) => items.splice(i, 1));

  const closeModal = () => {
    toast.info("Les modifications seront effectives à la sauvegarde de l'objet.", {
      icon: "ℹ️",
      description: "Merci de sauvegarder l'objet pour valider les modifications.",
    });
    onCloseModal();
  };

  return (
    <div className="flex flex-col justify-between h-[calc(100%-4rem)] gap-y-2">
      <div className="flex flex-col grow gap-y-2">
        {Object.values(subObject)[0].length > 0 ? (
          Object.values(subObject)[0].map((sub, i) => {
            return (
              <div className="flex flex-col gap-2 p-3 border rounded" key={`domaine-${i}`}>
                <div className="inline-flex items-center justify-between pb-2 border-b ">
                  <p className="text-sm font-bold text-gray-400">#{i + 1}</p>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="w-6 h-6"
                    onClick={async () => {
                      if (window.confirm("Êtes-vous sûr de vouloir supprimer cette entrée ?")) {
                        await Promise.all(
                          sub.values.map((e) => {
                            if (e.type !== "file" || !(e.value as FileDocument)?._id) return Promise.resolve();
                            return fetcher(`/api/admin/upload-file?_id=${(e.value as FileDocument)._id}`, {
                              method: "DELETE",
                            }).then(
                              () => toast.success(`Fichier ${(e.value as FileDocument).name} supprimé.`),
                              (err) => toast.error(err),
                            );
                          }),
                        );

                        deleteOne(i);
                      }
                    }}
                  >
                    <XIcon className="w-3 h-3" />
                  </Button>
                </div>
                <div className="flex flex-col gap-1">
                  {sub.values.map((e, indexValue) => {
                    return (
                      <div className="inline-flex items-center justify-between gap-x-2" key={indexValue}>
                        <div className="flex flex-col text-sm">
                          <p className="font-semibold text-gray-800 first-letter:uppercase">{e.label}</p>
                          {e.type === "file" &&
                            (e.value ? (
                              <a
                                className="inline-flex items-center gap-1 text-blue-500 underline"
                                href={(e.value as FileDocument).path}
                                target="_blank"
                                rel="noreferrer noopener"
                              >
                                {getIcon((e.value as FileDocument).type, "w-4 h-4")}
                                {(e.value as FileDocument).name}
                              </a>
                            ) : (
                              <span className="text-gray-500">Aucun fichier sélectionné.</span>
                            ))}
                        </div>
                        <div className="w-2/3">
                          {e.type !== "boolean" && (
                            <Input
                              defaultValue={e.type !== "file" ? e.value.toString() : undefined}
                              placeholder={e.type === "url" ? "https://" : ""}
                              type={e.type}
                              multiple={false}
                              onChange={(elem) => {
                                if (e.type !== "file") return (e.value = elem.target.value as string);
                                if (!elem.target.files) return log.error("No file selected");
                                const body = new FormData();
                                body.append("file", elem.target.files[0]);
                                // todo: maybe disable saving until file is uploaded
                                fetch("/api/admin/upload-file", {
                                  method: "POST",
                                  body,
                                })
                                  .then((res) => res.json())
                                  .catch((err) => toast.error(err))
                                  .then((body) => {
                                    // delete previous file
                                    toast.success("Fichier téléversé.");
                                    if ((e.value as FileDocument | undefined)?._id) {
                                      fetcher(`/api/admin/upload-file?_id=${(e.value as FileDocument)._id}`, {
                                        method: "DELETE",
                                      }).then(
                                        () => toast.success("Fichier supprimé."),
                                        (err) => toast.error(err),
                                      );
                                    }

                                    const file = body.data as FileDocument;
                                    e.value = file;
                                  })
                                  .catch((err) => toast.error(err));
                              }}
                            />
                          )}
                          {e.type === "boolean" && (
                            <div className="flex flex-col justify-center h-9 w-9">
                              <Checkbox
                                defaultChecked={e.value as boolean}
                                onCheckedChange={(checked) => (e.value = checked)}
                                className="w-4 h-4"
                              />
                            </div>
                          )}
                          {e.type === "file" && (
                            <small className="flex flex-col mx-1 mt-1 text-xs text-right">
                              <span className="text-gray-500">
                                Fichiers acceptés: images, vidéos, PDF, Excel, PowerPoint, Word
                              </span>
                              <span className="text-gray-500">Taille maximale: 10 Mo.</span>
                            </small>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })
        ) : (
          <h1>Aucune entrée renseignée.</h1>
        )}

        <div className="inline-flex items-center justify-end w-full gap-4 pt-4 mt-4 border-t">
          {emptyObject ? (
            <Button variant="secondary" className="button-add w-fit" onClick={addOne}>
              <PlusIcon className="w-4 h-4" />
              Ajouter une entrée
            </Button>
          ) : (
            <div className="flex flex-col items-end justify-between h-full text-right">
              <p className="text-sm text-gray-500">Aucune référence trouvée.</p>
              <p className="text-xs italic text-gray-500">
                {"Il semble que le sous-objet n'existe pas. Veuillez contacter un administrateur."}
              </p>
            </div>
          )}
        </div>
      </div>
      <div className="absolute w-[calc(100%-3rem)] bottom-6 gap-y-2 flex flex-col">
        <Button
          className="w-full"
          variant="destructive"
          onClick={() => {
            update((items) => items.splice(0, items.length));
            closeModal();
          }}
        >
          <TrashIcon className="w-4 h-4" />
          Supprimer
        </Button>
        <Button variant="secondary" onClick={closeModal} className="w-full">
          <XIcon className="w-4 h-4" />
          Fermer
        </Button>
      </div>
    </div>
  );
};
