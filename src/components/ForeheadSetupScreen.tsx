import { useEffect, useState } from "react";
import { playReadyTrill } from "../services/audio";

interface ForeheadSetupScreenProps {
  movementDetected: boolean;
  onReady: () => void;
  onCancel: () => void;
}

export function ForeheadSetupScreen({
  movementDetected,
  onReady,
  onCancel,
}: ForeheadSetupScreenProps) {
  const [showReady, setShowReady] = useState(false);

  useEffect(() => {
    if (!movementDetected) {
      return;
    }

    setShowReady(true);
    playReadyTrill();
    if (typeof navigator.vibrate === "function") {
      navigator.vibrate([55, 45, 55]);
    }
    const timeoutId = window.setTimeout(onReady, 700);
    return () => window.clearTimeout(timeoutId);
  }, [movementDetected, onReady]);

  return (
    <main className="forehead-screen">
      <button className="button button--ghost forehead-screen__cancel" type="button" onClick={onCancel}>
        Cancel
      </button>
      <section className="forehead-card" aria-live="polite">
        <div className="forehead-card__phone" aria-hidden="true">
          <span />
        </div>
        <h1>{showReady ? "Ready?" : "Place on Forehead"}</h1>
        <p>
          {showReady
            ? "Hold still for the countdown."
            : "Hold the phone sideways with the screen facing your teammates."}
        </p>
        {!showReady && (
          <button className="button button--secondary" type="button" onClick={onReady}>
            I&apos;m Ready
          </button>
        )}
      </section>
    </main>
  );
}
