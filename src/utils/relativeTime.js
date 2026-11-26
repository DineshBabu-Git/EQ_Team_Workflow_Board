// Turns an ISO date string into text like "3 hours ago".
// Months are treated as 30 days and years as 365, which is fine for a board card.

function pluralize(count, unit) {
  return `${count} ${unit}${count === 1 ? "" : "s"} ago`;
}

export function getRelativeTime(isoString, now = new Date()) {
  const then = new Date(isoString);

  if (Number.isNaN(then.getTime())) {
    return "at an unknown time";
  }

  const seconds = Math.floor((now.getTime() - then.getTime()) / 1000);

  // Also covers dates slightly in the future (a computer clock that is a bit off).
  if (seconds < 60) {
    return "just now";
  }

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) {
    return pluralize(minutes, "minute");
  }

  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return pluralize(hours, "hour");
  }

  const days = Math.floor(hours / 24);
  if (days < 30) {
    return pluralize(days, "day");
  }
  if (days < 365) {
    return pluralize(Math.floor(days / 30), "month");
  }

  return pluralize(Math.floor(days / 365), "year");
}
