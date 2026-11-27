import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import useDirtyForm from "../hooks/useDirtyForm";

const startingValues = { title: "Hello", assignee: "Sam" };

// beforeunload is cancelable, so we can check whether a listener called preventDefault().
function fireBeforeUnload() {
  const event = new Event("beforeunload", { cancelable: true });
  window.dispatchEvent(event);
  return event;
}

describe("useDirtyForm", function () {
  it("starts clean with the starting values", function () {
    const { result } = renderHook(() => useDirtyForm(startingValues));
    expect(result.current.isDirty).toBe(false);
    expect(result.current.values).toEqual(startingValues);
  });

  it("becomes dirty after a change and clean again when changed back", function () {
    const { result } = renderHook(() => useDirtyForm(startingValues));

    act(function () {
      result.current.setFieldValue("title", "Changed");
    });
    expect(result.current.isDirty).toBe(true);

    act(function () {
      result.current.setFieldValue("title", "Hello");
    });
    expect(result.current.isDirty).toBe(false);
  });

  it("only warns before unloading the page while dirty", function () {
    const { result } = renderHook(() => useDirtyForm(startingValues));
    expect(fireBeforeUnload().defaultPrevented).toBe(false);

    act(function () {
      result.current.setFieldValue("assignee", "Alex");
    });
    expect(fireBeforeUnload().defaultPrevented).toBe(true);
  });

  it("removes the warning when the form is unmounted", function () {
    const { result, unmount } = renderHook(() => useDirtyForm(startingValues));

    act(function () {
      result.current.setFieldValue("assignee", "Alex");
    });
    unmount();

    expect(fireBeforeUnload().defaultPrevented).toBe(false);
  });
});
