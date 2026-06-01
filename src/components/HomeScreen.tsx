import { ScreenLayout } from "./ScreenLayout";

interface HomeScreenProps {
  onPlay: () => void;
  onEditDecks: () => void;
  onHowToPlay: () => void;
}

export function HomeScreen({ onPlay, onEditDecks, onHowToPlay }: HomeScreenProps) {
  return (
    <ScreenLayout title="TiltFrenzy" eyebrow="Team clues, quick guesses">
      <section className="hero-panel">
        <div className="hero-panel__burst" aria-hidden="true">
          TF
        </div>
        <div>
          <p className="hero-panel__intro">
            Hold up a phone while teammates describe the word. Guess fast, then tilt for the
            next card.
          </p>
          <p className="muted">Motion controls are optional. Touch buttons always work.</p>
        </div>
      </section>
      <section className="stack stack--large" aria-label="Main menu">
        <button className="button button--primary button--large" type="button" onClick={onPlay}>
          Play
        </button>
        <button className="button button--secondary" type="button" onClick={onEditDecks}>
          Create/Edit Decks
        </button>
        <button className="button button--ghost" type="button" onClick={onHowToPlay}>
          How to Play
        </button>
      </section>
    </ScreenLayout>
  );
}
