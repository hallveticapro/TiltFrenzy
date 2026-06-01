export const REVERSE_TILT_KEY = "tilted.reverseTilt.v1";
const LEGACY_REVERSE_TILT_KEY = ["tilt", "frenzy.reverseTilt.v1"].join("");

export function loadReverseTilt(storage: Storage = localStorage): boolean {
  const stored = storage.getItem(REVERSE_TILT_KEY) ?? storage.getItem(LEGACY_REVERSE_TILT_KEY);
  if (stored !== null) {
    storage.setItem(REVERSE_TILT_KEY, stored);
    storage.removeItem(LEGACY_REVERSE_TILT_KEY);
  }
  return stored === "true";
}

export function saveReverseTilt(value: boolean, storage: Storage = localStorage): void {
  storage.setItem(REVERSE_TILT_KEY, String(value));
}
