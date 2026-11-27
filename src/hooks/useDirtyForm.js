// Keeps form values and tells you whether they differ from when the form opened.

import { useCallback, useEffect, useState } from "react";

function useDirtyForm(startingValues) {
  const [initialValues] = useState(startingValues);
  const [values, setValues] = useState(startingValues);

  // Worked out on every render instead of stored in state. Typing a change and then
  // typing it back makes the form clean again, and there is no extra state to keep in sync.
  const isDirty = Object.keys(initialValues).some(function (fieldName) {
    return values[fieldName] !== initialValues[fieldName];
  });

  const setFieldValue = useCallback(function (fieldName, newValue) {
    setValues(function (currentValues) {
      return { ...currentValues, [fieldName]: newValue };
    });
  }, []);

  useEffect(
    function warnBeforeLeavingThePage() {
      if (!isDirty) {
        return;
      }

      function handleBeforeUnload(event) {
        event.preventDefault();
        // Older browsers need this line too. Modern ones show their own generic text,
        // because pages are not allowed to set the message.
        event.returnValue = "";
      }

      window.addEventListener("beforeunload", handleBeforeUnload);

      return function removeListener() {
        window.removeEventListener("beforeunload", handleBeforeUnload);
      };
    },
    [isDirty],
  );

  return { values, setFieldValue, isDirty };
}

export default useDirtyForm;
