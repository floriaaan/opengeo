import { log } from "@/lib/log";
import { GenericField, GenericFieldValue } from "@/types/generic-object";
import { Button, Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Switch } from "@components/ui";
import { CalculatorIcon } from "@components/ui/icons/calculator";

import {
  BackpackIcon,
  CalendarIcon,
  CheckCircledIcon,
  Cross2Icon,
  DragHandleHorizontalIcon,
  ExclamationTriangleIcon,
  FileIcon,
  GlobeIcon,
  PlusIcon,
  SewingPinIcon,
  TextAlignLeftIcon,
} from "@radix-ui/react-icons";
import { regions } from "@resources/regions";
import { Dispatch, useEffect, useRef } from "react";
import { toast } from "sonner";

export const GenericObjectValuesInputWrapper = ({
  data,
  setData,
}: {
  data: GenericField[];
  setData: Dispatch<GenericField[]>;
}) => {
  const appendInput = () => setData([...data, { label: "", value: "", type: "string" }]);
  const removeInput = (label: string) => setData(data.filter((input) => input.label !== label));

  const dragItem = useRef<number>();
  const dragOverItem = useRef<number>();
  const onDragStart = (index: number) => (dragItem.current = index);
  const onDragEnter = (index: number) => (dragOverItem.current = index);

  const drop = () => {
    if (dragItem.current === undefined || dragOverItem.current === undefined) return;

    const tmp = [...data];
    const dragItemContent = tmp[dragItem.current];
    tmp.splice(dragItem.current, 1);
    tmp.splice(dragOverItem.current, 0, dragItemContent);
    dragItem.current = undefined;
    dragOverItem.current = undefined;
    setData(tmp);
  };

  useEffect(() => {
    toast.info(
      "Les informations saisies dans cette zone doivent être licites, adéquates, pertinentes et non excessives au regard du contexte. Elles ne doivent comporter aucune appréciation sur le comportement ou les traits de caractère et aucun jugement de valeur, ni faire apparaître, directement ou indirectement, des informations relatives aux origines raciales ou ethniques, opinions politiques, philosophiques ou religieuses, à l’appartenance syndicale, à la santé, à la vie sexuelle ainsi qu’aux sanctions et condamnations de toute personne.",
      {
        duration: 5 * 1000,
        dismissible: true,
        style: { width: "1024px", left: "0", bottom: "0", padding: "16px", backgroundColor: "#F0F8FFDD" },
        cancel: { label: "Fermer" },
        cancelButtonStyle: { backgroundColor: "#0973DC", color: "#F0F8FF" },
      },
    );
  }, []);

  return (
    <div className="flex flex-col justify-between h-full max-h-full gap-1 p-3 border rounded-xl">
      <div className="flex justify-around text-xs text-gray-400">
        <span className="w-6 h-px"></span>
        <p className="text-xs font-bold">Type</p>
        <p className="text-xs font-bold">Nom du champ</p>
        <p className="mr-8 text-xs font-bold">Valeur</p>
      </div>
      {data.length === 0 && (
        <div className="flex items-center gap-2 p-2 border border-gray-300 rounded">
          <ExclamationTriangleIcon className="w-4 h-4" />
          <h4 className="text-sm">Pas de champs renseignés</h4>
        </div>
      )}
      <div data-testid="modular-list" className="flex flex-col ">
        {data.map((input, index) => (
          <ModularInput
            key={index}
            label={input.label}
            value={input.value}
            type={input.type}
            onValueChange={(value) => {
              const newData = [...data];
              newData[index].value = value;
              setData(newData);
            }}
            onTypeChange={(value: GenericField["type"]) => {
              const newData = [...data];
              newData[index].type = value;
              newData[index].value = "";
              setData(newData);
            }}
            onLabelChange={(value) => {
              const newData = [...data];
              newData[index].label = value;
              setData(newData);
            }}
            removeInput={removeInput}
            dragDrop={{
              onDragStart,
              onDragEnter,
              drop,
              index,
            }}
          ></ModularInput>
        ))}
      </div>
      <Button
        variant="secondary"
        data-testid="modular-add_input"
        className="button-gray"
        type="button"
        onClick={appendInput}
      >
        <PlusIcon className="w-4 h-4" />
        <p className="text-sm">Ajouter un champ</p>
      </Button>
    </div>
  );
};

interface IInputProps extends GenericField {
  // eslint-disable-next-line no-unused-vars
  onValueChange: (value: GenericFieldValue) => void;
  // eslint-disable-next-line no-unused-vars
  onTypeChange: (type: string) => void;
  // eslint-disable-next-line no-unused-vars
  onLabelChange: (label: string) => void;
  // eslint-disable-next-line no-unused-vars
  removeInput: (label: string) => void;

  dragDrop?: {
    // eslint-disable-next-line no-unused-vars
    onDragStart: (index: number) => void;
    // eslint-disable-next-line no-unused-vars
    onDragEnter: (index: number) => void;
    // eslint-disable-next-line no-unused-vars
    drop: () => void;

    index: number;
  };
}

const icon_classnames = "absolute w-4 h-4 transform -translate-y-1/2 pointer-events-none top-1/2 left-3";

/**
 * A React component that renders an input field for editing a field label and value.
 *
 * @remarks The component includes state for managing the label, value, and type of the field. The component is used in the `WrapperModularInputs` component for editing the fields of a sub-object.
 *
 * @param label - The label of the field.
 * @param value - The value of the field.
 * @param type - The type of the field.
 * @param onValueChange - A function for setting the value of the field.
 * @param onTypeChange - A function for setting the type of the field.
 * @param onLabelChange - A function for setting the label of the field.
 * @param removeInput - A function for removing the field from the list of fields.
 *
 * @returns A React component that renders an input field for editing a field label and value.
 */
const ModularInput = ({
  label,
  value,
  type,
  onValueChange,
  onTypeChange,
  onLabelChange,
  removeInput,
  dragDrop,
}: IInputProps) => {
  const { onDragStart, onDragEnter, drop, index } = dragDrop || {
    onDragStart: () => {},
    onDragEnter: () => {},
    drop: () => {},
    index: 0,
  };

  return (
    <div className="flex items-center justify-between w-full gap-2 py-2 text-sm border-b last:border-b-0 ">
      <div
        className="px-2 w-fit cursor-grab"
        onDragEnter={() => onDragEnter(index)}
        onDragStart={() => onDragStart(index)}
        onDragEnd={drop}
        draggable
      >
        <DragHandleHorizontalIcon className="w-5 h-5" />
      </div>
      <div className="relative w-4/12">
        <label>
          {type === "string" && <TextAlignLeftIcon className={icon_classnames} />}
          {type === "date" && <CalendarIcon className={icon_classnames} />}
          {type === "number" && <CalculatorIcon className={icon_classnames} />}
          {type === "boolean" && <CheckCircledIcon className={icon_classnames} />}
          {type === "coordinates" && <SewingPinIcon className={icon_classnames} />}
          {type === "entity" && <BackpackIcon className={icon_classnames} />}
          {type === "file" && <FileIcon className={icon_classnames} />}
          {type === "url" && <GlobeIcon className={icon_classnames} />}
          <Select
            onValueChange={(e) => {
              onTypeChange(e);
              if (e === "coordinates") onLabelChange("Coordonnées GPS");
              if (e === "entity") onLabelChange("Direction Régionale");
            }}
            data-testid="modular-type_select"
            value={type || ""}
            required
            name="searchType"
          >
            <SelectTrigger className="pl-[2.25rem]">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="string">Caractères</SelectItem>
              <SelectItem value="number">Nombre</SelectItem>
              <SelectItem value="date">Date</SelectItem>
              <SelectItem value="boolean">Oui/Non</SelectItem>
              <SelectItem value="entity">Direction régionale</SelectItem>
              <SelectItem value="coordinates">Coordonnées GPS</SelectItem>
              <SelectItem value="url">Lien URL</SelectItem>
            </SelectContent>
          </Select>
        </label>
      </div>

      <div className="w-1/3">
        <Input
          data-testid="modular-label_input"
          value={label}
          disabled={type === "coordinates" || type === "entity"}
          onChange={(e) => onLabelChange(e.target.value)}
        />
      </div>

      <div className="inline-flex items-center justify-end w-4/12 gap-1">
        {(type === "string" || type === "number" || type === "date" || type === "url") && (
          <Input
            data-testid="modular-value_input"
            type={type}
            value={type === "number" ? (value as number) : value.toString()}
            onChange={(e) => onValueChange(type === "number" ? parseFloat(e.target.value) : e.target.value)}
            placeholder={type === "url" ? "https://" : ""}
          />
        )}

        {type === "coordinates" && (
          <div className="inline-flex items-center w-full gap-1">
            <Input
              className="w-1/2"
              onChange={(e) => {
                const latitude = e.target.value;
                const longitude = (value as [string, string])[1];
                onValueChange([latitude, longitude]);
              }}
              value={(value as [string, string])[0] || undefined}
              type="text"
              placeholder="latitude"
            ></Input>
            <span> : </span>
            <Input
              className="w-1/2 "
              onChange={(e) => {
                const longitude = e.target.value;
                const latitude = (value as [string, string])[0];
                onValueChange([latitude, longitude]);
              }}
              type="text"
              value={(value as [string, string])[1] || undefined}
              placeholder="longitude"
            ></Input>
          </div>
        )}

        {type === "file" && <Input type={type} accept="image/png, image/jpeg" onChange={(e) => log.debug(e)}></Input>}
        {type === "boolean" && (
          <Switch className="mx-auto" checked={value as boolean} onCheckedChange={onValueChange} />
        )}
        {type === "entity" && (
          <Select onValueChange={onValueChange} data-testid="modular-value_input" value={value?.toString()} required>
            <SelectTrigger className="">
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
        )}

        <Button
          variant="destructive"
          data-testid="modular-remove_input"
          type="button"
          size="icon"
          onClick={() => removeInput(label)}
        >
          <Cross2Icon className="w-3 h-3" />
        </Button>
      </div>
    </div>
  );
};
