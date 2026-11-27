// Reads the filters and sort from the URL and gives functions that change them.
//   const { filters, hasActiveFilters, toggleStatus, setPriority, ... } = useTaskFilters()
// `filters` can be passed straight to filterAndSortTasks. Must be used inside a Router.
import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { STATUSES } from "../utils/constants";
import { buildSearchParams, parseFilters } from "../utils/filterParams";

function useTaskFilters() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Only re-parsed when the URL changes, so `filters` keeps the same identity otherwise.
  const filters = useMemo(
    function () {
      return parseFilters(searchParams);
    },
    [searchParams],
  );

  // getChanges receives the CURRENT filters and returns the ones to change. Reading the
  // current URL here (instead of the filters from when the handler was created) matters
  // for the delayed search update: it must not undo a checkbox clicked in the meantime.
  function updateFilters(getChanges, options) {
    setSearchParams(function (currentParams) {
      const currentFilters = parseFilters(currentParams);
      return buildSearchParams({ ...currentFilters, ...getChanges(currentFilters) });
    }, options);
  }

  function toggleStatus(status) {
    updateFilters(function (currentFilters) {
      const isSelected = currentFilters.statuses.includes(status);
      const nextStatuses = isSelected
        ? currentFilters.statuses.filter(function (selected) {
            return selected !== status;
          })
        : [...currentFilters.statuses, status];
      // Keep the canonical order so the URL looks the same whichever box was ticked first.
      return {
        statuses: STATUSES.filter(function (name) {
          return nextStatuses.includes(name);
        }),
      };
    });
  }

  function setPriority(priority) {
    updateFilters(function () {
      return { priority };
    });
  }

  // replace: true edits the current history entry instead of adding one per keystroke.
  function setSearchText(searchText) {
    updateFilters(
      function () {
        return { searchText };
      },
      { replace: true },
    );
  }

  function setSortField(sortField) {
    updateFilters(function () {
      return { sortField };
    });
  }

  function setSortDirection(sortDirection) {
    updateFilters(function () {
      return { sortDirection };
    });
  }

  // Resets the filters but keeps the sort, because sorting is not a filter.
  function clearFilters() {
    updateFilters(function () {
      return { statuses: [], priority: "", searchText: "" };
    });
  }

  const hasActiveFilters = filters.statuses.length > 0 || filters.priority !== "" || filters.searchText.trim() !== "";

  return {
    filters,
    hasActiveFilters,
    toggleStatus,
    setPriority,
    setSearchText,
    setSortField,
    setSortDirection,
    clearFilters,
  };
}

export default useTaskFilters;
