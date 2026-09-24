/**
 * Converts browser and library errors into messages that are safe to show in
 * the UI. Some image and third-party browser APIs reject with a DOM Event,
 * whose default stringification is the unhelpful "[object Event]".
 */
export function getErrorMessage(
  error: unknown,
  fallback = "Something went wrong. Please try again.",
): string {
  if (isEventLike(error)) {
    return "A browser resource failed to load. Please try again.";
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  if (typeof error === "string" && error.trim()) {
    return error;
  }

  if (
    error &&
    typeof error === "object" &&
    "message" in error &&
    typeof error.message === "string" &&
    error.message.trim()
  ) {
    return error.message;
  }

  return fallback;
}

function isEventLike(error: unknown): boolean {
  if (typeof Event !== "undefined" && error instanceof Event) {
    return true;
  }

  if (!error || typeof error !== "object") {
    return false;
  }

  const tag = Object.prototype.toString.call(error);
  return tag === "[object Event]" || tag === "[object ErrorEvent]";
}
