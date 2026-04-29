import type { SignalType } from "@/features/signals/api/types";
import { echartsTheme } from "@/lib/theme";

export enum AnnotationType {
  Rally = "rally",
  Decline = "decline",
  Consolidation = "consolidation",
  Breakout = "breakout",
  Support = "support",
  Resistance = "resistance",
}

export interface AnnotationCoordinate {
  x: number;
  y: number;
}

export interface AnnotationSelection {
  start: AnnotationCoordinate;
  end: AnnotationCoordinate;
}

export interface ChartAnnotation {
  id: string;
  type: AnnotationType;
  label: string;
  selection: AnnotationSelection;
  color: string;
  createdAt: number;
  symbol: string;
  signal: SignalType;
}

export interface AnnotationState {
  annotations: ChartAnnotation[];
  activeId: string | null;
  isAnnotating: boolean;
}

export interface DragSelectionEvent {
  selection: AnnotationSelection;
  position: { x: number; y: number };
  placement?: "above" | "below";
}

export interface AnnotationCreateRequest {
  type: AnnotationType;
  label: string;
  selection: AnnotationSelection;
  signal: SignalType;
}

export type AnnotationAction =
  | { type: "ADD_ANNOTATION"; payload: ChartAnnotation }
  | { type: "REMOVE_ANNOTATION"; payload: { id: string } }
  | {
      type: "UPDATE_ANNOTATION";
      payload: { id: string; updates: Partial<ChartAnnotation> };
    }
  | { type: "CLEAR_ALL"; payload: {} };

export type AnnotationUpdate = Partial<
  Pick<ChartAnnotation, "label" | "color">
> & {
  selection?: AnnotationSelection;
};

export const ANNOTATION_TYPES: Record<
  AnnotationType,
  { label: string; color: string; description: string }
> = {
  rally: {
    label: "Rally",
    color: echartsTheme.annotations.rally,
    description: "Significant upward price movement",
  },
  decline: {
    label: "Decline",
    color: echartsTheme.annotations.decline,
    description: "Significant downward price movement",
  },
  consolidation: {
    label: "Consolidation",
    color: echartsTheme.annotations.consolidation,
    description: "Sideways price movement / range-bound",
  },
  breakout: {
    label: "Breakout",
    color: echartsTheme.annotations.breakout,
    description: "Price breaking through resistance/support",
  },
  support: {
    label: "Support Level",
    color: echartsTheme.annotations.support,
    description: "Price level where buying interest emerges",
  },
  resistance: {
    label: "Resistance Level",
    color: echartsTheme.annotations.resistance,
    description: "Price level where selling pressure emerges",
  },
};
