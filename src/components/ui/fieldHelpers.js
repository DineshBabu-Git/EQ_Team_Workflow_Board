// Shared by TextInput, TextArea and Select. So all fields look and behave the same.

export const labelClasses = "mb-1 block text-sm font-medium text-slate-700";

export function getFieldClasses(hasError) {
  const base = "block w-full rounded-md border bg-white px-3 py-2 text-sm text-slate-900 " + "placeholder:text-slate-400 focus:outline-2 focus:outline-offset-0 " + "disabled:cursor-not-allowed disabled:bg-slate-100";
  const colors = hasError ? "border-red-500 focus:outline-red-600" : "border-slate-300 focus:outline-brand-600";
  return `${base} ${colors}`;
}

// Returns undefined when there is nothing to point to.

export function buildDescribedBy({ hintId, errorId, hasHint, hasError }) {
  const ids = [];
  if (hasHint) ids.push(hintId);
  if (hasError) ids.push(errorId);
  return ids.length > 0 ? ids.join(" ") : undefined;
}
