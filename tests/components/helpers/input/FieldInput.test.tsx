import { Field } from "@/types/generic-object";
import { FieldInput } from "@components/admin/sub-object/values-input-wrapper";
import { fireEvent, render, screen } from "@testing-library/react";
import { expect, test } from "vitest";

test("should render a message when no fields are provided", () => {
  render(<FieldInput data={[]} setData={() => {}} />);
  expect(screen.getByText("Pas de champs renseignés")).toBeTruthy();
});

test("should render a list of inputs when fields are provided", () => {
  let data = [
    { label: "Field 1", type: "text" },
    { label: "Field 2", type: "number" },
  ];
  render(<FieldInput data={data} setData={() => {}} />);
  const list = screen.getByTestId("fieldinput-list");

  expect(list).toBeTruthy();
  expect(list.children.length).toEqual(2);
});

test('should add a new input when the "Add Field" button is clicked', () => {
  let data: Field[] = [];
  render(
    <FieldInput
      data={data}
      setData={(newData) => {
        data = newData;
      }}
    />,
  );
  const addButton = screen.getByTestId("fieldinput-add_input");
  fireEvent.click(addButton);

  expect(data.length).toEqual(1);
});

test('should remove an input when the "Remove" button is clicked', () => {
  let data = [{ label: "Field 1", type: "text" }];
  render(
    <FieldInput
      data={data}
      setData={(newData) => {
        data = newData;
      }}
    />,
  );
  const removeButton = screen.getByTestId("fieldinput-remove_input");
  expect(removeButton).toBeTruthy();
  fireEvent.click(removeButton);
  expect(data.length).toEqual(0);
});

test("should update an input when the label or type is changed", () => {
  let data = [{ label: "Field 1", type: "string" }];
  render(
    <FieldInput
      data={data}
      setData={(newData) => {
        data = newData;
      }}
    />,
  );
  const type_select = screen.getByTestId("fieldinput-type_select");
  const label_input = screen.getByTestId("fieldinput-label_input");

  fireEvent.change(type_select, { target: { value: "number" } });
  fireEvent.change(label_input, { target: { value: 2 } });

  expect(data[0].type).toEqual("number");
  expect(data[0].label).toEqual("2");
});
