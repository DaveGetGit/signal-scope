import { useRef, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  ANNOTATION_TYPES,
  AnnotationType,
  type AnnotationCoordinate,
} from "../../types/annotations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

const ANNOTATION_TYPE_OPTIONS = Object.entries(ANNOTATION_TYPES).map(
  ([value, config]) => ({
    value,
    label: config.label,
  }),
);

const annotationFormSchema = z.object({
  type: z.nativeEnum(AnnotationType),
  label: z.string().trim().min(1, "A note is required."),
});

type AnnotationFormValues = z.infer<typeof annotationFormSchema>;

const DEFAULT_FORM_VALUES: AnnotationFormValues = {
  type: AnnotationType.Support,
  label: "",
};

interface AnnotationPopoverProps {
  isVisible: boolean;
  position: {
    x: number;
    y: number;
  };
  selection: {
    start: AnnotationCoordinate;
    end: AnnotationCoordinate;
  };
  onConfirm: (type: AnnotationType, label: string) => void;
  onCancel: () => void;
}

export function AnnotationPopover({
  isVisible,
  position,
  selection,
  onConfirm,
  onCancel,
}: AnnotationPopoverProps) {
  const popoverRef = useRef<HTMLDivElement>(null);
  const {
    register,
    handleSubmit,
    reset,
    setFocus,
    formState: { errors },
  } = useForm<AnnotationFormValues>({
    resolver: zodResolver(annotationFormSchema),
    defaultValues: DEFAULT_FORM_VALUES,
  });

  useEffect(() => {
    if (isVisible) {
      reset(DEFAULT_FORM_VALUES);
      window.requestAnimationFrame(() => {
        setFocus("label");
      });
    }
  }, [isVisible, reset, setFocus]);

  const handleConfirm = useCallback(
    ({ type, label }: AnnotationFormValues) => {
      onConfirm(type, label.trim());
      reset(DEFAULT_FORM_VALUES);
    },
    [onConfirm, reset],
  );

  const handleCancel = useCallback(() => {
    onCancel();
    reset(DEFAULT_FORM_VALUES);
  }, [onCancel, reset]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isVisible) return;

      if (event.key === "Escape") {
        handleCancel();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isVisible, handleCancel]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isVisible &&
        popoverRef.current &&
        !popoverRef.current.contains(event.target as Node)
      ) {
        onCancel();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isVisible, onCancel]);

  if (!isVisible) {
    return null;
  }

  return (
    <div
      ref={popoverRef}
      role="dialog"
      aria-modal="false"
      aria-labelledby="annotation-popover-title"
      className="chart-popover-shell absolute z-20 w-80 rounded-lg border border-slate-200 bg-white p-4 shadow-xl"
      style={{
        left: `clamp(1rem, ${position.x}px, calc(100% - 1rem))`,
        top: `max(1rem, ${position.y}px)`,
      }}
    >
      <div className="mb-4">
        <h3
          id="annotation-popover-title"
          className="text-sm font-medium text-slate-900 mb-1"
        >
          Add Annotation
        </h3>
        <p className="text-xs text-slate-500">
          Selection: {selection.start.x.toLocaleString()} -{" "}
          {selection.end.x.toLocaleString()}
        </p>
      </div>

      <form onSubmit={handleSubmit(handleConfirm)}>
        <div className="mb-4">
          <Select
            id="annotation-type"
            label="Category"
            options={ANNOTATION_TYPE_OPTIONS}
            {...register("type")}
            {...(errors.type?.message ? { error: errors.type.message } : {})}
          />
        </div>

        <div className="mb-4">
          <Input
            id="annotation-label"
            label="Note"
            placeholder="Enter annotation note..."
            {...register("label")}
            {...(errors.label?.message ? { error: errors.label.message } : {})}
          />
        </div>

        <div className="flex justify-end gap-2">
          <Button type="button" onClick={handleCancel} variant="outline" size="sm">
            Cancel
          </Button>
          <Button type="submit" size="sm">
            Save
          </Button>
        </div>
      </form>
    </div>
  );
}
