import { describe, it, expect, beforeEach, vi } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useAnnotationStore } from "../stores/annotation-store";
import { SignalType } from "@/features/signals/api/types";
import { AnnotationType } from "@/types/annotations";

// Mock the persist middleware
vi.mock("zustand/middleware", () => ({
  persist: <T>(fn: T) => fn,
  subscribeWithSelector: <T>(fn: T) => fn,
}));

describe("Annotation Store", () => {
  beforeEach(() => {
    // Reset store state before each test - clear all symbols
    const store = useAnnotationStore.getState();
    act(() => {
      store.clearAnnotations("AAPL", SignalType.Close);
      store.clearAnnotations("AAPL", SignalType.Volume);
      store.clearAnnotations("MSFT", SignalType.Close);
      store.clearAnnotations("GOOGL", SignalType.Close);
    });
  });

  it("should initialize with empty annotations", () => {
    const { result } = renderHook(() => useAnnotationStore());
    expect(result.current.getAnnotations("AAPL", SignalType.Close)).toEqual([]);
  });

  it("should add annotations for a symbol", () => {
    const { result } = renderHook(() => useAnnotationStore());

    act(() => {
      result.current.createAnnotation("AAPL", SignalType.Close, {
        type: AnnotationType.Rally,
        selection: {
          start: { x: 0, y: 0 },
          end: { x: 10, y: 10 },
        },
        label: "Test Label",
        signal: SignalType.Close,
      });
    });

    const annotations = result.current.getAnnotations("AAPL", SignalType.Close);
    expect(annotations).toHaveLength(1);
    expect(annotations[0]?.label).toBe("Test Label");
    expect(annotations[0]?.type).toBe(AnnotationType.Rally);
    expect(annotations[0]?.signal).toBe(SignalType.Close);
  });

  it("should support undo functionality", () => {
    const { result } = renderHook(() => useAnnotationStore());

    act(() => {
      result.current.createAnnotation("AAPL", SignalType.Close, {
        type: AnnotationType.Rally,
        selection: {
          start: { x: 0, y: 0 },
          end: { x: 10, y: 10 },
        },
        label: "Test 1",
        signal: SignalType.Close,
      });
    });

    expect(result.current.getAnnotations("AAPL", SignalType.Close)).toHaveLength(1);

    act(() => {
      result.current.undo("AAPL", SignalType.Close);
    });

    expect(result.current.getAnnotations("AAPL", SignalType.Close)).toHaveLength(0);
  });

  it("should limit history to MAX_HISTORY_SIZE", () => {
    const { result } = renderHook(() => useAnnotationStore());

    act(() => {
        // Adding 60 annotations (MAX_HISTORY_SIZE is 50)
        for (let i = 0; i < 60; i++) {
          result.current.createAnnotation("AAPL", SignalType.Close, {
          type: AnnotationType.Rally,
          selection: {
            start: { x: i, y: i },
            end: { x: i + 1, y: i + 1 },
          },
          label: "Label " + i,
            signal: SignalType.Close,
          });
        }
      });

    // We should have 60 annotations present
    expect(result.current.getAnnotations("AAPL", SignalType.Close)).toHaveLength(60);

    // But the history should only let us undo 50 times
    // We check the history internal state to verify the past length
    const state = useAnnotationStore.getState();
    expect(state.history["AAPL:close"]?.past.length).toBe(50);
  });
});
