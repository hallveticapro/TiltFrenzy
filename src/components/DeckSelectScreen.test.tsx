import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { Deck } from "../types";
import { DeckSelectScreen } from "./DeckSelectScreen";

const decks: Deck[] = [
  {
    id: "math",
    name: "Math",
    category: "Education",
    builtIn: true,
    cards: [{ id: "math-1", prompt: "Factor" }],
  },
  {
    id: "animals",
    name: "Animals",
    category: "Animals",
    builtIn: true,
    cards: [{ id: "animal-1", prompt: "Dog" }],
  },
];

describe("DeckSelectScreen", () => {
  it("opens on the first category and filters built-in decks", () => {
    render(
      <DeckSelectScreen
        builtInDecks={decks}
        customDecks={[]}
        onSelect={vi.fn()}
        onBack={vi.fn()}
        onEditDecks={vi.fn()}
      />,
    );

    const categoryNav = screen.getByRole("navigation", { name: "Deck categories" });
    const builtInRegion = screen.getByRole("region", { name: "Built-in decks" });

    expect(screen.getByRole("heading", { name: "Education" })).toBeVisible();
    expect(within(builtInRegion).getByRole("button", { name: /Math/ })).toBeVisible();
    expect(within(builtInRegion).queryByRole("button", { name: /Animals/ })).not.toBeInTheDocument();

    fireEvent.click(within(categoryNav).getByRole("button", { name: "Animals" }));
    expect(screen.getByRole("heading", { name: "Animals" })).toBeVisible();
    expect(within(builtInRegion).getByRole("button", { name: /Animals/ })).toBeVisible();
    expect(within(builtInRegion).queryByRole("button", { name: /Math/ })).not.toBeInTheDocument();
  });
});
