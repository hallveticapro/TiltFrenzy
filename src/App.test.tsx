import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import App from "./App";

const originalInnerWidth = window.innerWidth;
const originalInnerHeight = window.innerHeight;

function setViewport(width: number, height: number) {
  Object.defineProperty(window, "innerWidth", { configurable: true, value: width });
  Object.defineProperty(window, "innerHeight", { configurable: true, value: height });
  fireEvent(window, new Event("resize"));
}

describe("App landscape gate", () => {
  afterEach(() => {
    setViewport(originalInnerWidth, originalInnerHeight);
  });

  it("directs portrait players to rotate before a button-only round", () => {
    setViewport(390, 844);
    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: "Play" }));
    fireEvent.click(screen.getByRole("button", { name: /4th Grade Math Review/ }));
    fireEvent.click(screen.getByRole("button", { name: "Start with Buttons" }));

    expect(screen.getByRole("heading", { name: "Turn your phone sideways" })).toBeVisible();
    expect(screen.getByText("Rotate to landscape to start the round.")).toBeVisible();

    setViewport(844, 390);

    expect(screen.getByRole("region", { name: "Card actions" })).toBeVisible();
    expect(screen.getByRole("button", { name: "Correct" })).toBeVisible();
  });
});
