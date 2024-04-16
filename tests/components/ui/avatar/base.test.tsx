import { UserWithFallback } from "@components/ui/avatar/base";
import { render, screen } from "@testing-library/react";

const props = {
  src: "https://example.com/image.jpg",
  alt: "Example Image",
  width: 100,
  height: 100,
  children: "Fallback Text",
  className: "example-class",
};

test("should render an image when the src is valid", () => {
  render(<UserWithFallback {...props} />);
  const image = screen.getByAltText("Example Image");
  expect(image).toBeTruthy();
  expect(image.getAttribute("src")).toBe("https://example.com/image.jpg");
  expect(image.getAttribute("width")).toBe("100");
  expect(image.getAttribute("height")).toBe("100");
  expect(image.className).toContain("example-class");
});

test("should render fallback text when the src is undefined", () => {
  const propsWithUndefinedSrc = {
    ...props,
    src: undefined as unknown as string,
  };
  render(<UserWithFallback {...propsWithUndefinedSrc} />);
  expect(screen.getByText("Fallback Text")).toBeTruthy();
});

test('should render fallback text when the src includes "undefined"', () => {
  const propsWithUndefinedSrc = {
    ...props,
    src: "https://example.com/undefined.jpg",
  };
  render(<UserWithFallback {...propsWithUndefinedSrc} />);
  expect(screen.getByText("Fallback Text")).toBeTruthy();
});

test("should not render an image when an error occurs", () => {
  const propsWithErrorSrc = {
    ...props,
    src: "https://example.com/error?isTest=true",
  };
  render(<UserWithFallback {...propsWithErrorSrc} />);
  expect(screen.queryByTestId("avatar-image")).toBeNull();
  expect(screen.getByTestId("avatar-fallback")).toBeTruthy();
});
