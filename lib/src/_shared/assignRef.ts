import type { RefObject, Ref } from "react";

export const assignRef = <T>(
  ref: Ref<T> | undefined,
  value: T | null
): void | (() => void) => {
  if (!ref) {
    return;
  }

  if (typeof ref === "function") {
    return ref(value);
  }

  (ref as RefObject<T | null>).current = value;
};
