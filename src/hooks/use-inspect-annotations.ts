import { useCallback, useEffect, useState } from "react";
import type {
  AnnotationCreateRequest,
  AnnotationType,
  DragSelectionEvent,
} from "@/types/annotations";
import type { SignalType } from "@/features/signals/api/types";

interface UseInspectAnnotationsArgs {
  createAnnotation: (request: AnnotationCreateRequest) => void;
  isAnnotating: boolean;
  redo: () => boolean;
  setIsAnnotating: (isAnnotating: boolean) => void;
  signal: SignalType;
  toggleAnnotationMode: () => void;
  undo: () => boolean;
}

interface PopoverState {
  isVisible: boolean;
  position: { x: number; y: number };
  selection: DragSelectionEvent["selection"] | null;
}

const EMPTY_POPOVER_STATE: PopoverState = {
  isVisible: false,
  position: { x: 0, y: 0 },
  selection: null,
};

export function useInspectAnnotations({
  createAnnotation,
  isAnnotating,
  redo,
  setIsAnnotating,
  signal,
  toggleAnnotationMode,
  undo,
}: UseInspectAnnotationsArgs) {
  const [popoverState, setPopoverState] =
    useState<PopoverState>(EMPTY_POPOVER_STATE);

  useEffect(() => {
    setIsAnnotating(false);
  }, [setIsAnnotating]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.key === "z" && !event.shiftKey) {
        event.preventDefault();
        undo();
      } else if (event.ctrlKey && event.shiftKey && event.key === "Z") {
        event.preventDefault();
        redo();
      } else if (event.key === "Escape" && isAnnotating) {
        event.preventDefault();
        toggleAnnotationMode();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isAnnotating, redo, toggleAnnotationMode, undo]);

  const handleDragSelection = useCallback((event: DragSelectionEvent) => {
    setPopoverState({
      isVisible: true,
      position: event.position,
      selection: event.selection,
    });
  }, []);

  const handleAnnotationCancel = useCallback(() => {
    setPopoverState(EMPTY_POPOVER_STATE);
  }, []);

  const handleAnnotationConfirm = useCallback(
    (type: AnnotationType, label: string) => {
      if (popoverState.selection) {
        createAnnotation({
          type,
          label,
          selection: popoverState.selection,
          signal,
        });
      }

      setIsAnnotating(false);
      setPopoverState(EMPTY_POPOVER_STATE);
    },
    [createAnnotation, popoverState.selection, setIsAnnotating, signal],
  );

  const handleAnnotationModeToggle = useCallback(() => {
    toggleAnnotationMode();

    if (popoverState.isVisible) {
      setPopoverState(EMPTY_POPOVER_STATE);
    }
  }, [popoverState.isVisible, toggleAnnotationMode]);

  return {
    handleAnnotationCancel,
    handleAnnotationConfirm,
    handleAnnotationModeToggle,
    handleDragSelection,
    popoverState,
  };
}
