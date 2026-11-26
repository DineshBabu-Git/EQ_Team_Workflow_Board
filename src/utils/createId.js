// randomUUID only exists in secure contexts (https or localhost), so there is a simple
// fallback for anything else. The fallback is unique enough for a single-user board.

function createId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `task-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export default createId;
