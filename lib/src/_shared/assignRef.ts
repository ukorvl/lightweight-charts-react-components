import type { RefObject, Ref } from "react";

/**
 * Assigns a value to an object or callback ref.
 *
 * @param ref - The ref to update.
 * @param value - The new ref value.
 * @returns The cleanup function supplied by a callback ref, if any.
 * @example
 * ```ts
 * const cleanup = assignRef(ref, node);
 * ```
 */
export const assignRef = <T>(
  ref: Ref<T> | undefined,
  value: T | null
): void | (() => void) => {
  if (typeof ref === "function") {
    return ref(value);
  }

  if (ref && typeof ref === "object") {
    (ref as RefObject<T | null>).current = value;
  }
};
