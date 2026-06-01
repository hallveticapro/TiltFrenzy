import { describe, expect, it } from "vitest";
import { loadReverseTilt, REVERSE_TILT_KEY, saveReverseTilt } from "./preferences";

describe("preferences", () => {
  it("round trips the reverse tilt preference", () => {
    saveReverseTilt(true);

    expect(loadReverseTilt()).toBe(true);
  });

  it("moves the saved preference from the previous app namespace", () => {
    const previousKey = ["tilt", "frenzy.reverseTilt.v1"].join("");
    localStorage.setItem(previousKey, "true");

    expect(loadReverseTilt()).toBe(true);
    expect(localStorage.getItem(REVERSE_TILT_KEY)).toBe("true");
    expect(localStorage.getItem(previousKey)).toBeNull();
  });
});
