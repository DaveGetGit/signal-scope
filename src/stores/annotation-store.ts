import { create } from "zustand";
import { persist, subscribeWithSelector } from "zustand/middleware";
import type { SignalType } from "@/features/signals/api/types";
import type {
  ChartAnnotation,
  AnnotationCreateRequest,
  AnnotationUpdate,
} from "@/types/annotations";
import { ANNOTATION_TYPES } from "@/types/annotations";
import { generateId } from "@/utils/id";

interface AnnotationHistory {
  past: ChartAnnotation[][];
  present: ChartAnnotation[];
  future: ChartAnnotation[][];
}

interface AnnotationStore {
  history: Record<string, AnnotationHistory>;
  createAnnotation: (
    symbol: string,
    signal: SignalType,
    request: AnnotationCreateRequest,
  ) => void;
  updateAnnotation: (
    symbol: string,
    signal: SignalType,
    id: string,
    updates: Partial<ChartAnnotation>,
  ) => void;
  deleteAnnotation: (symbol: string, signal: SignalType, id: string) => void;
  clearAnnotations: (symbol: string, signal: SignalType) => void;

  undo: (symbol: string, signal: SignalType) => boolean;
  redo: (symbol: string, signal: SignalType) => boolean;
  canUndo: (symbol: string, signal: SignalType) => boolean;
  canRedo: (symbol: string, signal: SignalType) => boolean;
  getAnnotations: (symbol: string, signal: SignalType) => ChartAnnotation[];
}

const MAX_HISTORY_SIZE = 50;
const EMPTY_ANNOTATIONS: ChartAnnotation[] = [];

const createEmptyHistory = (): AnnotationHistory => ({
  past: [],
  present: EMPTY_ANNOTATIONS,
  future: [],
});

const pushToHistory = (
  history: AnnotationHistory,
  newPresent: ChartAnnotation[],
): AnnotationHistory => {
  const newPast = [...history.past, history.present];
  const limitedPast =
    newPast.length > MAX_HISTORY_SIZE
      ? newPast.slice(-MAX_HISTORY_SIZE)
      : newPast;

  return {
    past: limitedPast,
    present: newPresent,
    future: [],
  };
};

const getHistoryKey = (symbol: string, signal: SignalType): string =>
  `${symbol}:${signal}`;

export const useAnnotationStore = create<AnnotationStore>()(
  persist(
    subscribeWithSelector((set, get) => ({
      history: {},

      createAnnotation: (
        symbol: string,
        signal: SignalType,
        request: AnnotationCreateRequest,
      ) => {
        const state = get();
        const historyKey = getHistoryKey(symbol, signal);
        const symbolHistory = state.history[historyKey] || createEmptyHistory();

        const newAnnotation: ChartAnnotation = {
          id: generateId(),
          type: request.type,
          label: request.label,
          selection: request.selection,
          color: ANNOTATION_TYPES[request.type].color,
          createdAt: Date.now(),
          symbol,
          signal: request.signal,
        };

        const newPresent = [...symbolHistory.present, newAnnotation];
        const newHistory = pushToHistory(symbolHistory, newPresent);

        set({
          history: {
            ...state.history,
            [historyKey]: newHistory,
          },
        });
      },

      updateAnnotation: (
        symbol: string,
        signal: SignalType,
        id: string,
        updates: AnnotationUpdate,
      ) => {
        const state = get();
        const historyKey = getHistoryKey(symbol, signal);
        const symbolHistory = state.history[historyKey] || createEmptyHistory();

        const annotationIndex = symbolHistory.present.findIndex(
          (a) => a.id === id,
        );
        if (annotationIndex === -1) return;

        const updatedAnnotation = {
          ...symbolHistory.present[annotationIndex],
          ...updates,
          id,
        } as ChartAnnotation;

        const newPresent = [...symbolHistory.present];
        newPresent[annotationIndex] = updatedAnnotation;
        const newHistory = pushToHistory(symbolHistory, newPresent);

        set({
          history: {
            ...state.history,
            [historyKey]: newHistory,
          },
        });
      },

      deleteAnnotation: (symbol: string, signal: SignalType, id: string) => {
        const state = get();
        const historyKey = getHistoryKey(symbol, signal);
        const symbolHistory = state.history[historyKey] || createEmptyHistory();

        const newPresent = symbolHistory.present.filter((a) => a.id !== id);
        const newHistory = pushToHistory(symbolHistory, newPresent);

        set({
          history: {
            ...state.history,
            [historyKey]: newHistory,
          },
        });
      },

      clearAnnotations: (symbol: string, signal: SignalType) => {
        const state = get();
        const historyKey = getHistoryKey(symbol, signal);
        const symbolHistory = state.history[historyKey] || createEmptyHistory();

        if (symbolHistory.present.length === 0) return;

        const newHistory = pushToHistory(symbolHistory, []);

        set({
          history: {
            ...state.history,
            [historyKey]: newHistory,
          },
        });
      },

      undo: (symbol: string, signal: SignalType) => {
        const state = get();
        const historyKey = getHistoryKey(symbol, signal);
        const symbolHistory = state.history[historyKey] || createEmptyHistory();

        if (symbolHistory.past.length === 0) return false;

        const previousPresent =
          symbolHistory.past[symbolHistory.past.length - 1];
        const newPast = symbolHistory.past.slice(0, -1);

        const newHistory: AnnotationHistory = {
          past: newPast,
          present: previousPresent || [],
          future: [symbolHistory.present, ...symbolHistory.future],
        };

        set({
          history: {
            ...state.history,
            [historyKey]: newHistory,
          },
        });

        return true;
      },

      redo: (symbol: string, signal: SignalType) => {
        const state = get();
        const historyKey = getHistoryKey(symbol, signal);
        const symbolHistory = state.history[historyKey] || createEmptyHistory();

        if (symbolHistory.future.length === 0) return false;

        const nextPresent = symbolHistory.future[0];
        if (!nextPresent) return false;

        const newFuture = symbolHistory.future.slice(1);

        const newHistory: AnnotationHistory = {
          past: [...symbolHistory.past, symbolHistory.present],
          present: nextPresent || [],
          future: newFuture,
        };

        set({
          history: {
            ...state.history,
            [historyKey]: newHistory,
          },
        });

        return true;
      },

      canUndo: (symbol: string, signal: SignalType) => {
        const state = get();
        const historyKey = getHistoryKey(symbol, signal);
        const symbolHistory = state.history[historyKey] || createEmptyHistory();
        return symbolHistory.past.length > 0;
      },

      canRedo: (symbol: string, signal: SignalType) => {
        const state = get();
        const historyKey = getHistoryKey(symbol, signal);
        const symbolHistory = state.history[historyKey] || createEmptyHistory();
        return symbolHistory.future.length > 0;
      },

      getAnnotations: (symbol: string, signal: SignalType) => {
        const state = get();
        const historyKey = getHistoryKey(symbol, signal);
        const symbolHistory = state.history[historyKey] || createEmptyHistory();
        return symbolHistory.present;
      },
    })),
    {
      name: "signal-scope-annotations",
      partialize: (state) => ({ history: state.history }),
    },
  ),
);
export const useSymbolAnnotations = (symbol: string, signal: SignalType) => {
  const annotations = useAnnotationStore((state) =>
    state.getAnnotations(symbol, signal),
  );
  const createAnnotation = useAnnotationStore((state) => state.createAnnotation);
  const updateAnnotation = useAnnotationStore((state) => state.updateAnnotation);
  const deleteAnnotation = useAnnotationStore((state) => state.deleteAnnotation);
  const clearAnnotations = useAnnotationStore((state) => state.clearAnnotations);
  const undo = useAnnotationStore((state) => state.undo);
  const redo = useAnnotationStore((state) => state.redo);
  const canUndo = useAnnotationStore((state) => state.canUndo(symbol, signal));
  const canRedo = useAnnotationStore((state) => state.canRedo(symbol, signal));

  return {
    annotations,
    createAnnotation: (request: AnnotationCreateRequest) =>
      createAnnotation(symbol, signal, request),
    updateAnnotation: (id: string, updates: AnnotationUpdate) =>
      updateAnnotation(symbol, signal, id, updates),
    deleteAnnotation: (id: string) => deleteAnnotation(symbol, signal, id),
    clearAnnotations: () => clearAnnotations(symbol, signal),
    undo: () => undo(symbol, signal),
    redo: () => redo(symbol, signal),
    canUndo,
    canRedo,
  };
};
