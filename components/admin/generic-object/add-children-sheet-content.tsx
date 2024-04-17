import { getAllSubObject } from "@/lib/fetchers/sub-object";
import { cn } from "@/lib/utils";
import { SubObjectType } from "@/models";
import { GenericObject } from "@/types/generic-object";
import { Button } from "@components/ui/button";
import { Checkbox } from "@components/ui/checkbox";
import { PlusIcon, TrashIcon } from "lucide-react";
import { Dispatch, useEffect, useState } from "react";

/**
 * A React component that renders a modal for adding children to a parent object.
 *
 * @remarks The component uses the `getAllSubObject` function from the `subObject` module to retrieve the sub-object data from the server. The component renders a list of checkboxes for selecting the sub-objects to add as children to the parent object. The component includes a button for adding the selected sub-objects as children to the parent object. The component is used as a modal in the `GestionObjetCreate` component.
 *
 * @param setOpenModalChildren - A function for setting the state of the modal.
 * @param children - An object representing the children of the parent object.
 * @param setChildren - A function for setting the state of the children of the parent object.
 *
 * @returns A React component that renders a modal for adding children to a parent object.
 */
export const AddChildrenSheetContent = ({
  _children,
  setChildren,
  onCloseModal,
}: {
  _children: { [key: string]: GenericObject[] };
  setChildren: Dispatch<{ [key: string]: GenericObject[] }>;
  onCloseModal: () => void;
}) => {
  const [subObject, setSubObject] = useState<SubObjectType[]>([]);
  const [selectedSubObject, setSelectedSubObject] = useState<SubObjectType[]>([]);

  useEffect(() => {
    getAllSubObject().then((result) => {
      // setSubObject(result.filter((e) => !Object.keys(_children).includes(e.metadata.label.toLowerCase())));
      setSubObject(result);
    });
  }, [_children]);

  // change la valeur "checked" dans la variable "selectedSubObject"
  function onCheck(e: SubObjectType) {
    setSelectedSubObject((prev) => {
      const idx = prev.findIndex((data) => data.metadata.label.toLowerCase() == e.metadata.label.toLowerCase());
      if (idx !== -1) prev.splice(idx, 1);
      else return [...prev, e];
      return [...prev];
    });
  }

  // Ajoute tout les domaine selectionnés à la variable parente.
  function update() {
    let tmp = { ..._children };
    selectedSubObject.map((dom) => {
      tmp = { ...tmp, [dom.metadata.label.toLowerCase()]: [dom] as unknown as GenericObject[] };
    });
    setChildren(tmp);
    onCloseModal();
  }

  return (
    <div className="flex flex-col justify-between h-[calc(100%-4rem)] gap-y-2">
      {subObject.length === 0 ? (
        <p className="p-3 mx-auto text-sm">Pas de sous-objet disponible</p>
      ) : (
        <div className="overflow-y-auto border rounded-lg">
          <div className="flex flex-col p-2 gap-y-2">
            <p className="text-sm italic">Sous-objets disponibles</p>
            {subObject
              .filter((e) => !Object.keys(_children).includes(e.metadata.label.toLowerCase()))
              .map((data, i) => {
                const isSelected = !!selectedSubObject.find(
                  (e) => e.metadata.label.toLowerCase() == data.metadata.label.toLowerCase(),
                );
                return (
                  <label
                    key={i}
                    className={cn(
                      "flex justify-between px-4 py-2 duration-150 rounded hover:bg-gray-100 cursor-pointer",
                      isSelected && "bg-gray-100",
                    )}
                  >
                    <p className="text-sm first-letter:uppercase">{data.metadata.label}</p>
                    <Checkbox onCheckedChange={() => onCheck(data)} checked={isSelected} />
                  </label>
                );
              })}
          </div>
          <hr className="my-1" />
          <div className="flex flex-col p-2 gap-y-2">
            <p className="text-sm italic">Sous-objets déjà ajoutés</p>

            {subObject
              .filter((e) => Object.keys(_children).includes(e.metadata.label.toLowerCase()))
              .map((data, i) => {
                return (
                  <div
                    key={i}
                    className="flex items-center justify-between px-4 py-2 duration-150 bg-gray-100 rounded "
                  >
                    <span className="text-sm first-letter:uppercase">{data.metadata.label}</span>
                    <div className="inline-flex items-center gap-x-2">
                      <Button
                        variant="destructive"
                        size="icon"
                        className="w-6 h-6 rounded-sm"
                        onClick={() => {
                          // @ts-expect-error - prev is supposed to be the children object
                          setChildren((prev) => {
                            const tmp = { ...prev };
                            delete tmp[data.metadata.label.toLowerCase()];
                            return tmp;
                          });
                        }}
                      >
                        <TrashIcon className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}
      <div className="absolute w-[calc(100%-3rem)] bottom-6">
        <Button onClick={update} className="w-full">
          <PlusIcon className="w-4 h-4" />
          Ajouter
        </Button>
      </div>
    </div>
  );
};
