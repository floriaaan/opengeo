import { Field } from "@/types/generic-object";
import { SubObjectMetadata } from "@/types/global";
import { SubObjectFlags } from "@/types/sub-object";
import { SubObjectValuesInputWrapper } from "@components/admin/sub-object/values-input-wrapper";
import { roles } from "@components/habilitations/roles";
import { Button } from "@components/ui/button";
import { Input } from "@components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@components/ui/select";
import { Switch } from "@components/ui/switch";
import { Textarea } from "@components/ui/textarea";
import {
  BackpackIcon,
  CheckIcon,
  Link1Icon,
  LockClosedIcon,
  LockOpen1Icon,
  LockOpen2Icon,
  UpdateIcon,
} from "@radix-ui/react-icons";
import { regions } from "@resources/regions";
import { Dispatch, ReactNode, SetStateAction, useMemo, useState } from "react";

/**
 * A React component that renders a form for creating a sub-object in the domain management page.
 *
 * @remarks The component uses the `Field` type from the `types` module to represent the sub-object fields. The component includes state for managing the sub-object fields, authorization level, and name. The component uses the `createSubObject` function from the `subObject` module to create the sub-object on the server. The component is used in the `GestionObjetCreate` page for creating a sub-object.
 *
 * @returns A React component that renders a form for creating a sub-object in the domain management page.
 */
export const SubObjectForm = ({
  title,

  metadata,
  setMetadata,

  data,
  setData,

  actions,
  submitText,
  onSubmit,

  flags,
  setFlags,
}: {
  title: string;

  metadata: SubObjectMetadata;
  setMetadata: Dispatch<SetStateAction<SubObjectMetadata>>;

  data: Field[];
  setData: Dispatch<Field[]>;

  actions?: ReactNode;
  submitText: string;
  onSubmit: () => Promise<void>;

  flags?: SubObjectFlags;
  setFlags?: Dispatch<SetStateAction<SubObjectFlags>>;
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const { authorization, description, label, entity } = useMemo(() => metadata, [metadata]);
  const isCreation = !actions;

  const handleSubmit = async () => {
    setIsLoading(true);
    await onSubmit();
    setIsLoading(false);
  };

  return (
    <>
      <div className="container flex flex-col w-full gap-4 pb-0 last:pb-6">
        <h1 className="text-3xl font-bold font-title text-opengeo ">{title}</h1>
        <label>
          <span className="font-bold font-title text-opengeo">Nom du sous-objet</span>
          <Input value={label} onChange={(e) => setMetadata((old) => ({ ...old, label: e.target.value }))} />
        </label>
        <div className="flex flex-col gap-4 lg:flex-row">
          <label className="flex flex-col w-full lg:w-1/2 2xl:w-1/3">
            <span className="text-sm font-bold text-opengeo">{"Entité / Direction régionale"}</span>
            <div className="relative w-full">
              <BackpackIcon className="absolute w-4 h-4 transform -translate-y-1/2 pointer-events-none top-1/2 left-3" />

              <Select
                value={entity}
                onValueChange={(value) => setMetadata((old) => ({ ...old, entity: value }))}
                defaultValue={entity}
                required
              >
                <SelectTrigger className="pl-[2.25rem]">
                  <SelectValue placeholder="Direction régionale" />
                </SelectTrigger>
                <SelectContent>
                  {regions.filter(Boolean).map((r) => (
                    <SelectItem value={r} key={r}>
                      {r}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </label>
          <label className="flex flex-col w-full lg:w-1/2 2xl:w-1/3">
            <span className="text-sm font-bold text-opengeo">{"Niveau d'accès"}</span>
            <div className="relative w-full">
              {authorization === "PZW_USER" && (
                <LockOpen2Icon className="absolute w-4 h-4 transform -translate-y-1/2 pointer-events-none top-1/2 left-3" />
              )}
              {(authorization === "PZW_MANAGER" ||
                authorization === "PZW_RESPONSABLE-SITE" ||
                authorization === "PZW_CODIR") && (
                <LockOpen1Icon className="absolute w-4 h-4 transform -translate-y-1/2 pointer-events-none top-1/2 left-3" />
              )}
              {(authorization === "PZW_ADMINISTRATEUR-REGION" || authorization === "PZW_ADMINISTRATEUR-GENERAL") && (
                <LockClosedIcon className="absolute w-4 h-4 transform -translate-y-1/2 pointer-events-none top-1/2 left-3" />
              )}

              <Select
                value={authorization}
                onValueChange={(value) => setMetadata((old) => ({ ...old, authorization: value }))}
                defaultValue={authorization || roles.find((r) => r.label === "Utilisateur")?.value}
                required
              >
                <SelectTrigger className="pl-[2.25rem]">
                  <SelectValue placeholder="Niveau d'accès" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map(({ value, label }) => {
                    return (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
          </label>
        </div>

        <label>
          <span className="text-sm font-bold text-neutral-600">
            Description
            <small className="ml-1 text-xs font-normal">(optionnel)</small>
          </span>
          <Textarea
            rows={4}
            placeholder="Description du sous-objet"
            value={description || ""}
            onChange={(e) => setMetadata((old) => ({ ...old, description: e.target.value }))}
          />
        </label>

        <div className="flex flex-col gap-4">
          <p className="text-xs text-gray-400">{"Veuillez renseigner les champs de l'objet et leurs valeurs."}</p>

          <SubObjectValuesInputWrapper {...{ data, setData }} />
          {isCreation && (
            <>
              <hr className="border-t border-gray-200" />
              <div className="space-y-2 flex flex-col gap-0.5">
                <label
                  htmlFor="auto-link"
                  className="inline-flex items-end text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 gap-x-1"
                >
                  <Link1Icon className="w-4 h-4" />
                  {"Lier automatiquement et créer une instance de ce sous-objet dans tout les objets de l'entité "}
                  {entity} ?
                </label>
                <Switch
                  checked={flags?.autoLink}
                  onCheckedChange={(c) => setFlags && setFlags((o) => ({ ...o, autoLink: c }))}
                  id="auto-link"
                />
              </div>
            </>
          )}
        </div>

        <div className="inline-flex items-center justify-end gap-4">
          {actions}
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? <UpdateIcon className="w-4 h-4 animate-spin" /> : <CheckIcon className="w-4 h-4" />}
            {isLoading ? "En cours..." : submitText}
          </Button>
        </div>
      </div>
    </>
  );
};
