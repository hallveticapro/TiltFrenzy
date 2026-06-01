import { ScreenLayout } from "./ScreenLayout";

interface HowToPlayScreenProps {
  onBack: () => void;
}

export function HowToPlayScreen({ onBack }: HowToPlayScreenProps) {
  return (
    <ScreenLayout
      title="How to Play"
      eyebrow="Quick guide"
      compact
      actions={
        <button className="button button--ghost" type="button" onClick={onBack}>
          Home
        </button>
      }
    >
      <section className="panel prose">
        <ol>
          <li>Choose a deck and a round length.</li>
          <li>Turn the phone sideways and hold it where your teammates can see the word.</li>
          <li>Your teammates give clues without saying the word or any part of it.</li>
          <li>Guess the word from their clues. Do not look at the screen.</li>
          <li>Tilt backward/up for Correct or forward/down to Pass.</li>
          <li>Use the large buttons any time motion is unavailable or inconvenient.</li>
        </ol>
        <p>
          On a keyboard, use <kbd>→</kbd> for Correct, <kbd>←</kbd> for Pass, and{" "}
          <kbd>Space</kbd> to pause or resume.
        </p>
      </section>
    </ScreenLayout>
  );
}
