import { useEffect, useState } from "react";

const PORTRAIT_QUERY = "(orientation: portrait)";

function getIsPortrait(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  if (typeof window.matchMedia === "function") {
    return window.matchMedia(PORTRAIT_QUERY).matches;
  }

  return window.innerHeight > window.innerWidth;
}

export function useLandscapeOrientation(): boolean {
  const [isPortrait, setIsPortrait] = useState(getIsPortrait);

  useEffect(() => {
    const mediaQuery =
      typeof window.matchMedia === "function" ? window.matchMedia(PORTRAIT_QUERY) : null;
    const updateOrientation = () => setIsPortrait(getIsPortrait());

    mediaQuery?.addEventListener?.("change", updateOrientation);
    window.addEventListener("orientationchange", updateOrientation);
    window.addEventListener("resize", updateOrientation);

    return () => {
      mediaQuery?.removeEventListener?.("change", updateOrientation);
      window.removeEventListener("orientationchange", updateOrientation);
      window.removeEventListener("resize", updateOrientation);
    };
  }, []);

  return isPortrait;
}
