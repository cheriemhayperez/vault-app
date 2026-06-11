"use client";

import { Check } from "lucide-react";

export interface ColorSwatchOption {
  id: string;
  swatchClass: string;
  ringClass: string;
}

interface ColorSwatchPickerProps {
  options: ColorSwatchOption[];
  value: string;
  onChange: (id: string) => void;
  layout?: "wrap" | "grid";
  getButtonId?: (optionId: string) => string | undefined;
}

export const ColorSwatchPicker = ({
  options,
  value,
  onChange,
  layout = "wrap",
  getButtonId,
}: ColorSwatchPickerProps) => (
  <div
    className={
      layout === "grid"
        ? "grid grid-cols-8 gap-2 justify-items-start"
        : "flex flex-wrap gap-2"
    }
  >
    {options.map((option) => {
      const isSelected = value === option.id;
      return (
        <button
          key={option.id}
          id={getButtonId?.(option.id)}
          type="button"
          aria-label={`${option.id} color`}
          aria-pressed={isSelected}
          onClick={() => onChange(option.id)}
          className={`relative flex size-6 items-center justify-center rounded-full ${option.swatchClass} ${
            layout === "wrap" ? "mx-auto" : ""
          } ${isSelected ? `ring-2 ring-offset-1 ${option.ringClass}` : ""}`}
        >
          {isSelected ? (
            <Check className="size-2.5 text-white" strokeWidth={3} />
          ) : null}
        </button>
      );
    })}
  </div>
);
