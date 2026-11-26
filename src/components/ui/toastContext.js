import { createContext } from "react";

// Holds { showToast }. The default is null so useToast can tell when ToastProvider is missing.

export const ToastContext = createContext(null);
