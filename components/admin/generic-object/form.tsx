import { useAuth } from "@/hooks/useAuth";
import { getEntityFromContact } from "@/lib/user";
import { GenericField, GenericObject, GenericObjectMetadata } from "@/types/generic-object";

import { CheckIcon, GripIcon, PlusIcon, RefreshCwIcon } from "lucide-react";
import { Dispatch, ReactNode, SetStateAction, useEffect, useMemo, useState } from "react";

import {
  Badge,
  Button,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  Textarea,
} from "@components/ui";

import { GENERIC_OBJECT_MARKER_COLORS } from "@/types/global";
import {
  AddChildrenSheetContent,
  GenericObjectValuesInputWrapper,
  UpdateChildrenSheetContent,
} from "@components/admin/generic-object";

type SubObjects = { [key: string]: GenericObject[] };

export const GenericObjectForm = ({
  title,

  metadata,
  setMetadata,

  data,
  setData,

  _children = {},
  setChildren,

  actions,
  submitText,
  onSubmit,
}: {
  title: string;

  metadata: GenericObjectMetadata;
  setMetadata: Dispatch<SetStateAction<GenericObjectMetadata>>;

  data: GenericField[];
  setData: Dispatch<SetStateAction<GenericField[]>>;

  _children: SubObjects;
  setChildren: Dispatch<SetStateAction<SubObjects>>;

  actions?: ReactNode;
  submitText: string;
  onSubmit: () => Promise<void>;
}) => {
  const { user } = useAuth();

  const entity = getEntityFromContact(user);

  const [isLoading, setIsLoading] = useState(false);
  const { authorization, description, label, color } = useMemo(() => metadata, [metadata]);

  const [selectedSubObject, setSelectedSubObject] = useState<SubObjects>({});

  const [isAddChildrenModalOpen, setIsAddChildrenModalOpen] = useState(false);
  const [isUpdateChildrenModalOpen, setIsUpdateChildrenModalOpen] = useState(false);
  const [isCustomLabel, setIsCustomLabel] = useState(label !== "site");

  useEffect(() => {
    setChildren(_children);
  }, [setChildren, _children]);

  const handleSubmit = async () => {
    setIsLoading(true);
    await onSubmit();
    setIsLoading(false);
  };

  if (!user || !entity) return null;

  return (
    <>
      <div className="container flex flex-col w-full gap-4 pb-0 last:pb-6">
        <h1 className="text-3xl font-bold font-title text-opengeo ">{title}</h1>
        <div className="inline-flex items-start gap-4">
          <div className="flex flex-col w-1/3 ">
            <label className="text-lg font-bold font-title text-opengeo">Modèle</label>
            <Select
              value={label === "site" ? "site" : "undefined"}
              onValueChange={(e) => {
                if (e !== "undefined") {
                  setMetadata((old) => ({ ...old, label: e, color: GENERIC_OBJECT_MARKER_COLORS.get(e) || "#1440dc" }));
                  setIsCustomLabel(false);
                } else {
                  setMetadata((old) => ({ ...old, label: "" }));
                  setIsCustomLabel(true);
                }
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Type de l'objet" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="site">Site</SelectItem>
                <SelectItem value="undefined">non défini</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col w-1/3">
            <label className="text-lg font-bold font-title text-opengeo">{"Type de l'objet"}</label>
            <Input
              disabled={!isCustomLabel}
              value={label}
              onChange={(e) => setMetadata((old) => ({ ...old, label: e.target.value.toLowerCase() }))}
            />
            <small className=" mt-0.5 text-gray-500 ml-0.5 text-xs">
              Exemple: <i>site</i>, <i>restaurant conventionné</i>, <i>etc.</i>
            </small>
          </div>
          <div className="flex flex-col w-1/3">
            <label className="text-lg font-bold font-title text-opengeo">{"Couleur du marqueur"}</label>
            <Input
              disabled={!isCustomLabel}
              type="color"
              value={color}
              onChange={(e) => setMetadata((old) => ({ ...old, color: e.target.value }))}
            />
          </div>
        </div>

        <label>
          <span className="text-sm font-bold text-neutral-600">
            Description
            <small className="ml-1 text-xs font-normal">(optionnel)</small>
          </span>
          <Textarea
            rows={4}
            placeholder="Description de l'objet"
            value={description || ""}
            onChange={(e) => setMetadata((old) => ({ ...old, description: e.target.value }))}
          />
        </label>

        <div className="flex flex-col gap-2">
          <p className="text-xs text-gray-400">{"Veuillez renseigner les champs de l'objet et leurs valeurs."}</p>

          <GenericObjectValuesInputWrapper {...{ data, setData }} />
        </div>

        {/* partie domaines */}
        <p className="text-lg font-bold font-title text-opengeo">Sous-objets</p>
        <div className="flex flex-col gap-2 p-3 border rounded-xl">
          <div className="inline-flex flex-wrap items-center gap-2">
            <Sheet open={isUpdateChildrenModalOpen} onOpenChange={setIsUpdateChildrenModalOpen}>
              {Object.entries(_children)
                .sort(([keyA], [keyB]) => keyA.localeCompare(keyB, "fr", { sensitivity: "base" }))
                .map(([key, g_o]) => (
                  <SheetTrigger asChild key={key}>
                    <Button
                      variant="outline"
                      onClick={() => setSelectedSubObject({ [key]: g_o })}
                      className="px-2 capitalize"
                    >
                      <GripIcon className="w-4 h-4" />
                      <p>{key}</p>
                      <Badge
                        variant={(() => {
                          if (g_o.length === 0) return "destructive";
                          if (g_o.every((g) => g.values.every((v) => v.value === ""))) return "destructive";
                          return "default";
                        })()}
                      >
                        {g_o.length}
                      </Badge>
                    </Button>
                  </SheetTrigger>
                ))}
              <SheetContent className="flex flex-col py-20 gap-y-6">
                <SheetHeader>
                  <SheetTitle>Sous-objet: {Object.keys(selectedSubObject)[0]}</SheetTitle>
                </SheetHeader>
                <UpdateChildrenSheetContent
                  {...{
                    setChildren,
                    subObject: selectedSubObject,
                    onCloseModal: () => setIsUpdateChildrenModalOpen(false),
                  }}
                />
              </SheetContent>
            </Sheet>

            <Sheet open={isAddChildrenModalOpen} onOpenChange={setIsAddChildrenModalOpen}>
              <SheetTrigger asChild>
                <Button variant="secondary">
                  <PlusIcon className="w-4 h-4" />
                  <p className="text-sm">Ajouter des sous-objets</p>
                </Button>
              </SheetTrigger>
              <SheetContent className="flex flex-col py-20 gap-y-6">
                <SheetHeader>
                  <SheetTitle>Ajouter des sous-objets</SheetTitle>
                </SheetHeader>
                <AddChildrenSheetContent
                  {...{ _children, setChildren, onCloseModal: () => setIsAddChildrenModalOpen(false) }}
                />
              </SheetContent>
            </Sheet>
          </div>
        </div>
        <hr />
        <div className="inline-flex items-center justify-end gap-2">
          {actions}
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? <RefreshCwIcon className="w-4 h-4 animate-spin" /> : <CheckIcon className="w-4 h-4" />}
            {isLoading ? "En cours..." : submitText}
          </Button>
        </div>
      </div>
    </>
  );
};
