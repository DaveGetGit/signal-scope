import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { ANNOTATION_TYPES, type ChartAnnotation } from "@/types/annotations";
import { withAlpha } from "@/lib/theme";

interface AnnotationSidebarProps {
  annotations: ChartAnnotation[];
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onUpdate: (id: string, label: string) => void;
  onDelete: (id: string) => void;
}

function formatTimestampRange(annotation: ChartAnnotation): string {
  const start = Math.min(
    annotation.selection.start.x,
    annotation.selection.end.x,
  );
  const end = Math.max(
    annotation.selection.start.x,
    annotation.selection.end.x,
  );

  const formatter = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

  return `${formatter.format(start)} - ${formatter.format(end)}`;
}

function formatValueRange(annotation: ChartAnnotation): string {
  const low = Math.min(annotation.selection.start.y, annotation.selection.end.y);
  const high = Math.max(annotation.selection.start.y, annotation.selection.end.y);

  return `${low.toLocaleString(undefined, {
    maximumFractionDigits: 2,
  })} - ${high.toLocaleString(undefined, {
    maximumFractionDigits: 2,
  })}`;
}

export function AnnotationSidebar({
  annotations,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onUpdate,
  onDelete,
}: AnnotationSidebarProps) {
  const [editingAnnotation, setEditingAnnotation] = useState<{
    id: string;
    label: string;
  } | null>(null);

  const sortedAnnotations = useMemo(
    () => [...annotations].sort((a, b) => b.createdAt - a.createdAt),
    [annotations],
  );

  const handleSaveEdit = () => {
    if (!editingAnnotation) return;

    const nextLabel = editingAnnotation.label.trim();
    if (!nextLabel) return;

    onUpdate(editingAnnotation.id, nextLabel);
    setEditingAnnotation(null);
  };

  const handleCancelEdit = () => {
    setEditingAnnotation(null);
  };

  return (
    <aside className="bg-white rounded-lg border border-slate-200 p-4 lg:sticky lg:top-6 h-fit">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">Labels</h3>
          <p className="mt-1 text-xs text-slate-500">
            {annotations.length} saved annotation
            {annotations.length !== 1 ? "s" : ""}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onUndo}
            disabled={!canUndo}
            className="text-xs"
          >
            Undo
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onRedo}
            disabled={!canRedo}
            className="text-xs"
          >
            Redo
          </Button>
        </div>
      </div>

      <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
        <p className="text-xs font-medium text-slate-700">
          Keyboard shortcuts
        </p>
        <p className="mt-1 text-xs text-slate-500">
          Ctrl/Cmd+Z to undo, Ctrl/Cmd+Shift+Z to redo
        </p>
      </div>

      {sortedAnnotations.length === 0 ? (
        <div className="mt-4 rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-center">
          <p className="text-sm font-medium text-slate-700">
            No labels yet
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Turn on annotation mode and drag across the chart to save one.
          </p>
        </div>
      ) : (
        <div className="annotation-list mt-4 space-y-3 overflow-y-auto pr-1">
          {sortedAnnotations.map((annotation) => {
            const annotationType = ANNOTATION_TYPES[annotation.type];

            return (
              <article
                key={annotation.id}
                className="rounded-lg border border-slate-200 bg-slate-50 p-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <span
                      className="text-2xs inline-flex items-center rounded-full px-2 py-1 font-medium"
                      style={{
                        backgroundColor: withAlpha(annotation.color, 0.12),
                        color: annotation.color,
                      }}
                    >
                      {annotationType.label}
                    </span>
                    <p className="mt-2 text-xs text-slate-500">
                      {formatTimestampRange(annotation)}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      Value range: {formatValueRange(annotation)}
                    </p>
                  </div>

                  <div className="flex items-center gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        setEditingAnnotation({
                          id: annotation.id,
                          label: annotation.label,
                        })
                      }
                      className="h-7 px-2 text-xs"
                    >
                      Edit
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete(annotation.id)}
                      className="h-7 px-2 text-xs"
                      style={{ color: "var(--color-danger-600)" }}
                    >
                      Delete
                    </Button>
                  </div>
                </div>

                <div className="mt-3">
                  <p className="text-2xs font-medium uppercase tracking-wide text-slate-500">
                    Note
                  </p>

                  {editingAnnotation?.id === annotation.id ? (
                    <div className="mt-2 space-y-2">
                      <input
                        type="text"
                        value={editingAnnotation.label}
                        onChange={(event) =>
                          setEditingAnnotation({
                            ...editingAnnotation,
                            label: event.target.value,
                          })
                        }
                        onKeyDown={(event) => {
                          if (event.key === "Enter") {
                            handleSaveEdit();
                          }
                          if (event.key === "Escape") {
                            handleCancelEdit();
                          }
                        }}
                        className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-1"
                        autoFocus
                      />
                      <div className="flex justify-end gap-2">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={handleCancelEdit}
                        >
                          Cancel
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          onClick={handleSaveEdit}
                          disabled={!editingAnnotation.label.trim()}
                        >
                          Save
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <p className="mt-1 text-sm text-slate-700 break-words">
                      {annotation.label}
                    </p>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </aside>
  );
}
