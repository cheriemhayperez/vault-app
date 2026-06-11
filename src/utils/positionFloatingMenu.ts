interface FloatingMenuPositionOptions {
  gap?: number;
  padding?: number;
  width?: number;
}

export const computeFloatingMenuPosition = (
  triggerRect: DOMRect,
  menuHeight: number,
  options: FloatingMenuPositionOptions = {},
): { top: number; left: number; width: number } => {
  const gap = options.gap ?? 6;
  const padding = options.padding ?? 8;
  const width = options.width ?? 288;

  let left = triggerRect.left;
  left = Math.max(padding, Math.min(left, window.innerWidth - width - padding));

  const spaceBelow = window.innerHeight - triggerRect.bottom - padding;
  const spaceAbove = triggerRect.top - padding;

  let top: number;
  if (spaceBelow >= menuHeight + gap) {
    top = triggerRect.bottom + gap;
  } else if (spaceAbove >= menuHeight + gap) {
    top = triggerRect.top - menuHeight - gap;
  } else if (spaceBelow >= spaceAbove) {
    top = Math.min(
      triggerRect.bottom + gap,
      window.innerHeight - menuHeight - padding,
    );
  } else {
    top = Math.max(padding, triggerRect.top - menuHeight - gap);
  }

  top = Math.max(padding, Math.min(top, window.innerHeight - menuHeight - padding));

  return { top, left, width };
};
