import { Field } from "@/types/generic-object";
import { Button } from "@components/ui/button";
import { Input } from "@components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@components/ui/select";
import {
  AlignLeftIcon,
  CalculatorIcon,
  CalendarIcon,
  CircleCheckIcon,
  FileIcon,
  GlobeIcon,
  PinIcon,
  PlusIcon,
  TriangleAlertIcon,
  XIcon,
} from "lucide-react";

import { Dispatch } from "react";

/**
 * A React component that renders a form for editing an array of fields.
 *
 * @remarks The component uses the `Field` type from the `types` module to represent the field data. The component includes state for managing the field data. The component is used in the `SubObjectForm` component for editing the fields of a sub-object.
 *
 * @param data - An array of fields representing the field data to be edited.
 * @param setData - A function for setting the field data.
 *
 * @returns A React component that renders a form for editing an array of fields.
 */
export const SubObjectValuesInputWrapper = ({ data, setData }: { data: Field[]; setData: Dispatch<Field[]> }) => {
  const appendInput = () => setData([...data, { label: "", type: "string" }]);
  const removeInput = (label: string) => setData(data.filter((input) => input.label !== label));

  return (
    <div
      data-testid="fieldinput"
      className="flex flex-col justify-between h-full max-h-full gap-1 p-2 bg-white border border-gray-300 border-solid rounded-lg"
    >
      <div className="inline-flex items-center text-xs font-bold text-gray-400">
        <p className="w-1/3 mx-auto">Type</p>
        <p className="w-2/3 mx-auto">Nom du champ</p>
      </div>
      {data.length === 0 && (
        <div className="flex items-center gap-2 p-2 border border-gray-300 rounded">
          <TriangleAlertIcon className="w-4 h-4" />
          <h4 data-testid="fieldinput-no_input" className="text-sm">
            Pas de champs renseignés
          </h4>
        </div>
      )}
      <div className="flex flex-col" data-testid="fieldinput-list">
        {data.map((input, index) => (
          <ModularInput
            key={index}
            label={input.label}
            type={input.type}
            onTypeChange={(value: Field["type"]) => {
              const newData = [...data];
              newData[index].type = value;
              setData(newData);
            }}
            onLabelChange={(value) => {
              const newData = [...data];
              newData[index].label = value;
              setData(newData);
            }}
            removeInput={removeInput}
          ></ModularInput>
        ))}
      </div>
      <Button
        variant="secondary"
        type="button"
        data-testid="fieldinput-add_input"
        className="button-gray"
        onClick={appendInput}
      >
        <PlusIcon className="w-4 h-4" />
        <p className="text-sm">Ajouter un champ</p>
      </Button>
    </div>
  );
};

interface IInputFieldProps extends Field {
  // eslint-disable-next-line no-unused-vars
  onTypeChange: (type: string) => void;
  // eslint-disable-next-line no-unused-vars
  onLabelChange: (label: string) => void;
  // eslint-disable-next-line no-unused-vars
  removeInput: (label: string) => void;
}

const icon_classnames = "absolute w-4 h-4 transform -translate-y-1/2 pointer-events-none top-1/2 left-3";

/**
 * A React component that renders an input field for editing a field label and type.
 *
 * @remarks The component includes state for managing the label and type of the field. The component is used in the `FieldInput` component for editing the fields of a sub-object.
 *
 * @param label - The label of the field.
 * @param type - The type of the field.
 * @param onTypeChange - A function for setting the type of the field.
 * @param onLabelChange - A function for setting the label of the field.
 * @param removeInput - A function for removing the field from the list of fields.
 *
 * @returns A React component that renders an input field for editing a field label and type.
 */
const ModularInput = ({ label, type, onTypeChange, onLabelChange, removeInput }: IInputFieldProps) => {
  return (
    <div className="flex items-center justify-between w-full gap-2 py-2 text-sm border-b last:border-b-0 ">
      <label className="relative w-1/2 text-gray-400">
        {type === "string" && <AlignLeftIcon className={icon_classnames} />}
        {type === "date" && <CalendarIcon className={icon_classnames} />}
        {type === "number" && <CalculatorIcon className={icon_classnames} />}
        {type === "boolean" && <CircleCheckIcon className={icon_classnames} />}
        {type === "coordinates" && <PinIcon className={icon_classnames} />}
        {type === "file" && <FileIcon className={icon_classnames} />}
        {type === "url" && <GlobeIcon className={icon_classnames} />}
        <Select
          onValueChange={onTypeChange}
          data-testid="fieldinput-type_select"
          value={type || ""}
          required
          name="searchType"
        >
          <SelectTrigger className="pl-[2.25rem] ">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="string">Caractères</SelectItem>
            <SelectItem value="number">Nombre</SelectItem>
            <SelectItem value="date">Date</SelectItem>
            <SelectItem value="boolean">Oui/Non</SelectItem>
            <SelectItem value="file">Fichier</SelectItem>
            <SelectItem value="url">Lien URL</SelectItem>
          </SelectContent>
        </Select>
      </label>

      <div className="w-full">
        <Input
          data-testid="fieldinput-label_input"
          value={label}
          onChange={(e) => onLabelChange(e.target.value)}
          className="input"
          placeholder="Nom du champ"
        />
      </div>

      <div className="inline-flex items-center justify-end ">
        <Button
          size="icon"
          variant="destructive"
          data-testid="fieldinput-remove_input"
          type="button"
          onClick={() => removeInput(label)}
        >
          <XIcon className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};
