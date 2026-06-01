import { describe, expect, it } from "vitest";
import { builtInDecks } from "./builtInDecks";

describe("builtInDecks", () => {
  it("uses visible target words instead of hidden flashcard answers", () => {
    const mathDeck = builtInDecks.find(({ id }) => id === "math-review");
    const scienceDeck = builtInDecks.find(({ id }) => id === "science-review");

    expect(mathDeck?.cards.map(({ prompt }) => prompt)).toContain("Factor");
    expect(scienceDeck?.cards.map(({ prompt }) => prompt)).toContain("Matter");
    expect(builtInDecks.flatMap(({ cards }) => cards).every(({ answer }) => answer === undefined)).toBe(
      true,
    );
  });
});
