import { useContext } from "react";
import { ToastContext } from "./toastContext";

// Returns { showToast(message, variant) }. Throws a clear error if used outside the provider,
// which is easier to debug than a confusing "cannot read showToast of null".

function useToast() {
  const context = useContext(ToastContext);

  if (context === null) {
    throw new Error("useToast must be used inside a <ToastProvider>");
  }

  return context;
}

export default useToast;
