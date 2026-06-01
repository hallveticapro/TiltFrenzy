import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { normalizeTiltAxis, useMotionControls } from "./useMotionControls";

function sendOrientation(beta: number, gamma = 0) {
  const event = new Event("deviceorientation") as DeviceOrientationEvent;
  Object.defineProperties(event, {
    beta: { value: beta },
    gamma: { value: gamma },
  });
  window.dispatchEvent(event);
}

function calibrate(
  result: { current: ReturnType<typeof useMotionControls> },
  samples = [79, 80, 81],
) {
  act(() => result.current.startCalibration());
  samples.forEach((beta) => act(() => sendOrientation(beta)));
  act(() => result.current.finishCalibration());
}

function holdTilt(beta: number) {
  act(() => sendOrientation(beta));
  act(() => vi.advanceTimersByTime(141));
  act(() => sendOrientation(beta));
}

describe("useMotionControls", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-06-01T12:00:00Z"));
    Object.defineProperty(window, "DeviceOrientationEvent", {
      configurable: true,
      value: class DeviceOrientationEvent {},
    });
    Object.defineProperty(window, "DeviceMotionEvent", {
      configurable: true,
      value: class DeviceMotionEvent {},
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("normalizes portrait and landscape axis values", () => {
    expect(normalizeTiltAxis(40, 15, 0)).toBe(40);
    expect(normalizeTiltAxis(40, 15, 90)).toBe(-15);
    expect(normalizeTiltAxis(40, 15, -90)).toBe(15);
  });

  it("detects the larger movement made while placing the phone on a forehead", async () => {
    const { result } = renderHook(() =>
      useMotionControls({ enabled: true, reverseTilt: false }),
    );

    await act(async () => {
      await result.current.requestPermission();
    });
    act(() => result.current.beginForeheadSetup());
    act(() => sendOrientation(10));
    act(() => sendOrientation(30));
    expect(result.current.foreheadMovementDetected).toBe(false);

    act(() => sendOrientation(50));
    expect(result.current.foreheadMovementDetected).toBe(true);
    expect(result.current.status).toBe("ready");
  });

  it("averages calibration samples and ignores hand twitches", async () => {
    const { result } = renderHook(() =>
      useMotionControls({ enabled: true, reverseTilt: false }),
    );

    await act(async () => {
      await result.current.requestPermission();
    });
    calibrate(result);
    expect(result.current.baseline?.axisValue).toBe(80);

    act(() => sendOrientation(105));
    act(() => vi.advanceTimersByTime(200));
    act(() => sendOrientation(105));
    expect(result.current.lastAction).toBeNull();
  });

  it("requires a deliberate tilt and neutral rearming before the next action", async () => {
    const { result } = renderHook(() =>
      useMotionControls({ enabled: true, reverseTilt: false }),
    );

    await act(async () => {
      await result.current.requestPermission();
    });
    calibrate(result);
    holdTilt(130);
    expect(result.current.lastAction).toMatchObject({ id: 1, outcome: "correct" });

    holdTilt(135);
    expect(result.current.lastAction).toMatchObject({ id: 1 });

    act(() => sendOrientation(80));
    act(() => vi.advanceTimersByTime(1001));
    holdTilt(25);
    expect(result.current.lastAction).toMatchObject({ id: 2, outcome: "pass" });
  });

  it("reverses correct and pass tilt directions", async () => {
    const { result } = renderHook(() =>
      useMotionControls({ enabled: true, reverseTilt: true }),
    );

    await act(async () => {
      await result.current.requestPermission();
    });
    calibrate(result);
    holdTilt(130);

    expect(result.current.lastAction).toMatchObject({ outcome: "pass" });
  });

  it("requests every available iOS permission and falls back after denial", async () => {
    const orientationPermission = vi.fn().mockResolvedValue("granted");
    const motionPermission = vi.fn().mockResolvedValue("denied");
    Object.defineProperty(window, "DeviceOrientationEvent", {
      configurable: true,
      value: class DeviceOrientationEvent {
        static requestPermission = orientationPermission;
      },
    });
    Object.defineProperty(window, "DeviceMotionEvent", {
      configurable: true,
      value: class DeviceMotionEvent {
        static requestPermission = motionPermission;
      },
    });
    const { result } = renderHook(() =>
      useMotionControls({ enabled: true, reverseTilt: false }),
    );

    let granted = true;
    await act(async () => {
      granted = await result.current.requestPermission();
    });

    expect(orientationPermission).toHaveBeenCalledTimes(1);
    expect(motionPermission).toHaveBeenCalledTimes(1);
    expect(granted).toBe(false);
    expect(result.current.status).toBe("denied");
    expect(result.current.error).toContain("Touch controls still work");
  });
});
