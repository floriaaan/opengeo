import { Category, CategoryProps } from "@components/ui/link/category";
import { render, screen } from "@testing-library/react";
import { vi } from "vitest";

const props: CategoryProps = {
  title: "Test Category",
  options: [
    { name: "Option 1", href: "/option1" },
    { name: "Option 2", href: "/option2", disabled: true },
    { name: "Option 3", onClick: vi.fn() },
  ],
  titleClassName: "test-title-class",
  optionsClassName: "test-options-class",
};

test("should render the component with the correct title and options", () => {
  render(<Category {...props} />);
  expect(screen.getByText("Test Category")).toBeTruthy();
  expect(screen.getByText("Option 1")).toBeTruthy();
  expect(screen.getByText("Option 2")).toBeTruthy();
  expect(screen.getByText("Option 3")).toBeTruthy();
});

test("should render the component with the correct title class name", () => {
  render(<Category {...props} />);
  expect(screen.getByText("Test Category").className).toContain("test-title-class");
});

test("should render the component with the correct options class name", () => {
  render(<Category {...props} />);
  expect(screen.getByText("Option 1").className).toContain("test-options-class");
});

test("should render a disabled option with the correct class name", () => {
  render(<Category {...props} />);
  expect(screen.getByText("Option 2").className).toContain("opacity-50 cursor-not-allowed");
});

test("should call the onClick function when an option is clicked", () => {
  render(<Category {...props} />);
  const option3 = screen.getByText("Option 3");
  option3.click();
  expect(props.options[2].onClick).toHaveBeenCalled();
});
