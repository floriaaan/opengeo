import { Navbar } from "@components/layouts/navbar";
import { render, screen } from "@testing-library/react";
import { afterEach, expect, test } from "vitest";

afterEach(() => {
  document.body.innerHTML = "";
});

test("should render the navbar", () => {
  render(<Navbar />);
  const navbar = screen.getByTestId("navbar");

  expect(navbar.innerHTML).toContain("OpenGeo");
  expect(navbar.className).toContain("w-full");
  expect(navbar.className).toContain("top-0");
});
