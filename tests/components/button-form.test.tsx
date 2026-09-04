import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import {
  Button,
  CheckboxField,
  FormField,
  Input,
  Select,
  Textarea,
} from "../../src/renderer/components/ui";

describe("Button", () => {
  it("announces loading, disables interaction, and restores its content", async () => {
    const onClick = vi.fn();
    const { rerender } = render(
      <Button loading loadingLabel="Saving" onClick={onClick}>
        Save
      </Button>,
    );

    const loadingButton = screen.getByRole("button", { name: "Saving" });
    expect(loadingButton).toBeDisabled();
    expect(loadingButton).toHaveAttribute("aria-busy", "true");
    await userEvent.click(loadingButton);
    expect(onClick).not.toHaveBeenCalled();

    rerender(<Button onClick={onClick}>Save</Button>);
    await userEvent.click(screen.getByRole("button", { name: "Save" }));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it.each(["primary", "secondary", "outline", "ghost", "destructive"] as const)(
    "keeps the %s variant operable",
    async (variant) => {
      const onClick = vi.fn();
      render(
        <Button variant={variant} onClick={onClick}>
          Continue
        </Button>,
      );
      await userEvent.click(screen.getByRole("button", { name: "Continue" }));
      expect(onClick).toHaveBeenCalledOnce();
    },
  );
});

describe("form controls", () => {
  it("associates labels, guidance, and errors with controls", () => {
    render(
      <FormField
        label="Campaign name"
        description="Visible only in this workspace"
        error="A name is required"
      >
        <Input />
      </FormField>,
    );

    const input = screen.getByRole("textbox", { name: "Campaign name" });
    expect(input).toBeInvalid();
    expect(input).toHaveAccessibleDescription(
      "Visible only in this workspace A name is required",
    );
  });

  it("supports labeled select and textarea controls", () => {
    render(
      <>
        <FormField label="Platform">
          <Select defaultValue="short">
            <option value="short">Short video</option>
          </Select>
        </FormField>
        <FormField label="Notes">
          <Textarea />
        </FormField>
      </>,
    );

    expect(screen.getByRole("combobox", { name: "Platform" })).toHaveValue(
      "short",
    );
    expect(screen.getByRole("textbox", { name: "Notes" })).toBeEnabled();
  });

  it("toggles a checkbox from its label and keyboard", async () => {
    const user = userEvent.setup();
    render(<CheckboxField label="Enable notifications" />);
    const checkbox = screen.getByRole("checkbox", {
      name: "Enable notifications",
    });

    await user.click(screen.getByText("Enable notifications"));
    expect(checkbox).toBeChecked();
    checkbox.focus();
    await user.keyboard(" ");
    expect(checkbox).not.toBeChecked();
  });
});
