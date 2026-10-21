import type { KeyboardEvent } from "react";

/** Keep Tab at the modal's boundaries, including browsers that briefly focus the document. */
export function trapDialogFocus(event: KeyboardEvent<HTMLElement>) {
  if (event.key !== "Tab") return;
  const controls = Array.from(
    event.currentTarget.querySelectorAll<HTMLElement>(
      'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), video[controls], iframe, [tabindex]:not([tabindex="-1"])',
    ),
  ).filter(
    (node) =>
      !node.hidden &&
      node.getAttribute("aria-hidden") !== "true" &&
      node.tabIndex !== -1 &&
      node.getClientRects().length > 0,
  );
  const first = controls[0],
    last = controls.at(-1);
  if (!first || !last) {
    event.preventDefault();
    event.currentTarget.focus();
    return;
  }
  if (
    event.shiftKey &&
    (document.activeElement === first ||
      !event.currentTarget.contains(document.activeElement))
  ) {
    event.preventDefault();
    last.focus();
  } else if (
    !event.shiftKey &&
    (document.activeElement === last ||
      !event.currentTarget.contains(document.activeElement))
  ) {
    event.preventDefault();
    first.focus();
  }
}
