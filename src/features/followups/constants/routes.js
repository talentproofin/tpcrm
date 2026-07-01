export const FOLLOWUP_ROUTES = {
  WORKSPACE: "/follow-ups",
};

export const FOLLOWUP_VIEWS = {
  ALL: "all",
  OVERDUE: "overdue",
  TODAY: "today",
  UPCOMING: "upcoming",
  COMPLETED_TODAY: "completed_today",
};

/** @type {{ id: string, label: string }[]} */
export const FOLLOWUP_VIEW_OPTIONS = [
  { id: FOLLOWUP_VIEWS.ALL, label: "All open" },
  { id: FOLLOWUP_VIEWS.OVERDUE, label: "Overdue" },
  { id: FOLLOWUP_VIEWS.TODAY, label: "Due today" },
  { id: FOLLOWUP_VIEWS.UPCOMING, label: "Upcoming" },
  { id: FOLLOWUP_VIEWS.COMPLETED_TODAY, label: "Completed today" },
];
