import { ScreenLayout } from "./ScreenLayout";

interface LandscapeGateScreenProps {
  onCancel: () => void;
}

export function LandscapeGateScreen({ onCancel }: LandscapeGateScreenProps) {
  return (
    <ScreenLayout
      title="Turn your phone sideways"
      eyebrow="Landscape mode"
      compact
      actions={
        <button className="button button--ghost" type="button" onClick={onCancel}>
          Cancel
        </button>
      }
    >
      <section className="rotate-card" aria-live="polite">
        <div className="rotate-card__phone" aria-hidden="true">
          <span />
        </div>
        <div>
          <h2>Rotate to landscape to start the round.</h2>
          <p>
            The wider view makes the word easier for teammates to read from across the room.
          </p>
        </div>
      </section>
    </ScreenLayout>
  );
}
