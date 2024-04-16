import { GenericField, GenericFieldValue } from "@/types/generic-object";
import { GenericObjectValuesInputWrapper } from "@components/admin/generic-object/values-input-wrapper";
import { fireEvent, render, screen } from "@testing-library/react";
import { expect, test } from "vitest";

test("should render a message when no fields are provided", () => {
  render(<GenericObjectValuesInputWrapper data={[]} setData={() => {}} />);
  expect(screen.getByText("Pas de champs renseignés")).toBeTruthy();
});

test("should render a list of inputs when fields are provided", () => {
  let data = [
    { label: "Field 1", type: "text", value: "test" },
    { label: "Field 2", type: "number", value: 2 },
  ];
  render(<GenericObjectValuesInputWrapper data={data} setData={() => {}} />);
  const list = screen.getByTestId("modular-list");

  expect(list).toBeTruthy();
  expect(list.children.length).toEqual(2);
});

test('should add a new input when the "Add Field" button is clicked', () => {
  let data: GenericField[] = [];
  render(
    <GenericObjectValuesInputWrapper
      data={data}
      setData={(newData) => {
        data = newData;
      }}
    />,
  );
  const addButton = screen.getByTestId("modular-add_input");
  fireEvent.click(addButton);

  expect(data.length).toEqual(1);
});

test('should remove an input when the "Remove" button is clicked', () => {
  let data = [{ label: "Field 1", type: "string", value: "Test" as GenericFieldValue }];
  render(
    <GenericObjectValuesInputWrapper
      data={data}
      setData={(newData) => {
        data = newData;
      }}
    />,
  );
  const removeButton = screen.getByTestId("modular-remove_input");
  expect(removeButton).toBeTruthy();
  fireEvent.click(removeButton);
  expect(data.length).toEqual(0);
});

test("should update an input when the label or type is changed", () => {
  let data = [{ label: "Field 1", type: "string", value: "Test" as GenericFieldValue }];
  render(
    <GenericObjectValuesInputWrapper
      data={data}
      setData={(newData) => {
        data = newData;
      }}
    />,
  );
  const type_select = screen.getByTestId("modular-type_select");
  const label_input = screen.getByTestId("modular-label_input");
  const value_input = screen.getByTestId("modular-value_input");

  fireEvent.change(type_select, { target: { value: "number" } });
  fireEvent.change(label_input, { target: { value: "Field 2" } });
  fireEvent.change(value_input, { target: { value: 2 } });

  expect(data[0].type).toEqual("number");
  expect(data[0].label).toEqual("Field 2");
  // todo: fix this test
  expect(data[0].value).toEqual("2");
});
