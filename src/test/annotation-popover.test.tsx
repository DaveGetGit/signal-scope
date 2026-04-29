import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AnnotationPopover } from "@/components/charts/annotation-popover";
import { AnnotationType } from "@/types/annotations";

describe("AnnotationPopover", () => {
  const defaultProps = {
    isVisible: true,
    position: { x: 160, y: 120 },
    selection: {
      start: { x: 1704067200000, y: 42000 },
      end: { x: 1704070800000, y: 42500 },
    },
    onConfirm: vi.fn(),
    onCancel: vi.fn(),
  };

  it("shows a validation error when note is empty", async () => {
    const user = userEvent.setup();

    render(<AnnotationPopover {...defaultProps} />);

    await user.click(screen.getByRole("button", { name: "Save" }));

    expect(screen.getByText("A note is required.")).toBeInTheDocument();
    expect(screen.getByLabelText("Note")).toHaveAttribute(
      "aria-invalid",
      "true",
    );
    expect(defaultProps.onConfirm).not.toHaveBeenCalled();
  });

  it("submits the selected category and trimmed note", async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();
    const onCancel = vi.fn();

    render(
      <AnnotationPopover
        {...defaultProps}
        onConfirm={onConfirm}
        onCancel={onCancel}
      />,
    );

    await user.selectOptions(screen.getByLabelText("Category"), "rally");
    await user.type(screen.getByLabelText("Note"), "  ETF approval  ");
    await user.click(screen.getByRole("button", { name: "Save" }));

    expect(onConfirm).toHaveBeenCalledWith(
      AnnotationType.Rally,
      "ETF approval",
    );
    expect(onCancel).not.toHaveBeenCalled();
  });
});
