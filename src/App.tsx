import { useCallback, useEffect, useMemo, useState } from "react";
import { CalibrationScreen } from "./components/CalibrationScreen";
import { DeckEditor } from "./components/DeckEditor";
import { DeckSelectScreen } from "./components/DeckSelectScreen";
import { EndRoundScreen } from "./components/EndRoundScreen";
import { GameScreen } from "./components/GameScreen";
import { HomeScreen } from "./components/HomeScreen";
import { HowToPlayScreen } from "./components/HowToPlayScreen";
import { LandscapeGateScreen } from "./components/LandscapeGateScreen";
import { RoundSetupScreen } from "./components/RoundSetupScreen";
import { builtInDecks } from "./data/builtInDecks";
import { useLandscapeOrientation } from "./hooks/useLandscapeOrientation";
import { useMotionControls } from "./hooks/useMotionControls";
import { loadCustomDecks } from "./services/deckStorage";
import { loadReverseTilt, saveReverseTilt } from "./services/preferences";
import type { Deck, RoundResult, RoundSettings } from "./types";

type Screen =
  | "home"
  | "decks"
  | "setup"
  | "landscape-gate"
  | "calibration"
  | "game"
  | "results"
  | "editor"
  | "how-to-play";

const DEFAULT_THRESHOLD = 25;
type RoundStartDestination = "calibration" | "game";

function App() {
  const [screen, setScreen] = useState<Screen>("home");
  const [customDecks, setCustomDecks] = useState<Deck[]>(() => loadCustomDecks());
  const [selectedDeckId, setSelectedDeckId] = useState(builtInDecks[0].id);
  const [roundResult, setRoundResult] = useState<RoundResult | null>(null);
  const [pendingStart, setPendingStart] = useState<{
    destination: RoundStartDestination;
    cancelScreen: Screen;
  } | null>(null);
  const [settings, setSettings] = useState<RoundSettings>(() => ({
    deckId: builtInDecks[0].id,
    durationSeconds: 60,
    motionEnabled: true,
    reverseTilt: loadReverseTilt(),
    tiltThreshold: DEFAULT_THRESHOLD,
  }));

  const decks = useMemo(() => [...builtInDecks, ...customDecks], [customDecks]);
  const selectedDeck = decks.find((deck) => deck.id === selectedDeckId) ?? builtInDecks[0];
  const isPortrait = useLandscapeOrientation();
  const motion = useMotionControls({
    enabled: settings.motionEnabled,
    reverseTilt: settings.reverseTilt,
    threshold: settings.tiltThreshold,
  });

  const updateSettings = (nextSettings: RoundSettings) => {
    saveReverseTilt(nextSettings.reverseTilt);
    setSettings(nextSettings);
  };

  const startGame = useCallback(() => {
    motion.resetActions();
    setRoundResult(null);
    setScreen("game");
  }, [motion.resetActions]);

  const continueToRound = useCallback(
    (destination: RoundStartDestination) => {
      if (destination === "calibration") {
        setScreen("calibration");
      } else {
        startGame();
      }
    },
    [startGame],
  );

  const startWhenLandscape = useCallback(
    (destination: RoundStartDestination, cancelScreen: Screen) => {
      if (isPortrait) {
        setPendingStart({ destination, cancelScreen });
        setScreen("landscape-gate");
        return;
      }

      continueToRound(destination);
    },
    [continueToRound, isPortrait],
  );

  useEffect(() => {
    if (screen !== "landscape-gate" || isPortrait || !pendingStart) {
      return;
    }

    const { destination } = pendingStart;
    setPendingStart(null);
    continueToRound(destination);
  }, [continueToRound, isPortrait, pendingStart, screen]);

  const enableMotion = async () => {
    motion.resetCalibration();
    const granted = await motion.requestPermission();
    if (granted) {
      startWhenLandscape("calibration", "setup");
    }
  };

  const startWithoutMotion = () => {
    updateSettings({ ...settings, motionEnabled: false });
    startWhenLandscape("game", "setup");
  };

  const chooseDeck = (deckId: string) => {
    setSelectedDeckId(deckId);
    updateSettings({ ...settings, deckId });
    setScreen("setup");
  };

  const playAgain = () => {
    setRoundResult(null);
    if (settings.motionEnabled && motion.permission === "granted") {
      motion.resetCalibration();
      startWhenLandscape("calibration", "results");
      return;
    }
    startWhenLandscape("game", "results");
  };

  if (screen === "home") {
    return (
      <HomeScreen
        onPlay={() => setScreen("decks")}
        onEditDecks={() => setScreen("editor")}
        onHowToPlay={() => setScreen("how-to-play")}
      />
    );
  }

  if (screen === "how-to-play") {
    return <HowToPlayScreen onBack={() => setScreen("home")} />;
  }

  if (screen === "decks") {
    return (
      <DeckSelectScreen
        builtInDecks={builtInDecks}
        customDecks={customDecks}
        onSelect={chooseDeck}
        onBack={() => setScreen("home")}
        onEditDecks={() => setScreen("editor")}
      />
    );
  }

  if (screen === "setup") {
    return (
      <RoundSetupScreen
        deck={selectedDeck}
        settings={settings}
        motionStatus={motion.status}
        motionError={motion.error}
        onSettingsChange={updateSettings}
        onEnableMotion={enableMotion}
        onStartWithoutMotion={startWithoutMotion}
        onChooseDeck={() => setScreen("decks")}
      />
    );
  }

  if (screen === "landscape-gate") {
    return (
      <LandscapeGateScreen
        onCancel={() => {
          setScreen(pendingStart?.cancelScreen ?? "setup");
          setPendingStart(null);
        }}
      />
    );
  }

  if (screen === "calibration") {
    return (
      <CalibrationScreen
        onCalibrate={motion.calibrate}
        onComplete={startGame}
        onCancel={() => setScreen("setup")}
      />
    );
  }

  if (screen === "game") {
    return (
      <GameScreen
        deck={selectedDeck}
        settings={settings}
        motionStatus={motion.status}
        motionAction={motion.lastAction}
        onRoundEnd={(result) => {
          setRoundResult(result);
          setScreen("results");
        }}
      />
    );
  }

  if (screen === "results" && roundResult) {
    return (
      <EndRoundScreen
        result={roundResult}
        onPlayAgain={playAgain}
        onChooseDeck={() => setScreen("decks")}
        onHome={() => setScreen("home")}
      />
    );
  }

  if (screen === "editor") {
    return (
      <DeckEditor
        customDecks={customDecks}
        onDecksChange={setCustomDecks}
        onBack={() => setScreen("home")}
      />
    );
  }

  return null;
}

export default App;
