import { Footer } from "@components/layouts/footer";
import { render, screen } from "@testing-library/react";
import { afterEach, expect, test } from "vitest";

import packageInfo from "package.json";
const { author } = packageInfo;

afterEach(() => {
  document.body.innerHTML = "";
});

test("should render the current year", () => {
  render(<Footer />);
  const footer = screen.getByTestId("footer");
  const year = new Date().getFullYear();

  expect(footer.innerHTML).toContain(`© ${year}`);
});

test("should render the footer", () => {
  render(<Footer />);
  const footer = screen.getByTestId("footer");

  expect(footer.innerHTML).toContain(author);
  expect(footer.className).toContain("w-full");
  expect(footer.className).toContain("bottom-0");
});
