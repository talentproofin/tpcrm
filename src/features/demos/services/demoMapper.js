/**
 * @param {Record<string, unknown>} row
 * @returns {import('../types/demo').Demo}
 */
export function mapDemoRow(row) {
  const status = row.demo_statuses;
  const outcome = row.demo_outcomes;
  const presenter = row.presenter_profile;

  return {
    id: String(row.id),
    leadId: String(row.lead_id),
    scheduledAt: String(row.scheduled_at),
    durationMinutes: Number(row.duration_minutes),
    demoMode: String(row.demo_mode),
    meetingLink: row.meeting_link ? String(row.meeting_link) : null,
    venue: row.venue ? String(row.venue) : null,
    presenterProfileId: String(row.presenter_profile_id),
    attendees: row.attendees ? String(row.attendees) : null,
    demoStatusId: String(row.demo_status_id),
    demoOutcomeId: row.demo_outcome_id ? String(row.demo_outcome_id) : null,
    summary: row.summary ? String(row.summary) : null,
    internalNotes: row.internal_notes ? String(row.internal_notes) : null,
    completedAt: row.completed_at ? String(row.completed_at) : null,
    cancelledAt: row.cancelled_at ? String(row.cancelled_at) : null,
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
    status:
      status && !Array.isArray(status)
        ? {
            id: String(status.id),
            code: String(status.code),
            name: String(status.name),
          }
        : null,
    outcome:
      outcome && !Array.isArray(outcome)
        ? {
            id: String(outcome.id),
            code: String(outcome.code),
            name: String(outcome.name),
          }
        : null,
    presenter:
      presenter && !Array.isArray(presenter)
        ? {
            profileId: String(presenter.profile_id),
            fullName: String(presenter.full_name),
            email: String(presenter.email),
          }
        : null,
  };
}

export const DEMO_SELECT = `id, lead_id, scheduled_at, duration_minutes, demo_mode, meeting_link, venue,
  presenter_profile_id, attendees, demo_status_id, demo_outcome_id, summary, internal_notes,
  completed_at, cancelled_at, created_at, updated_at,
  demo_statuses(id, code, name),
  demo_outcomes(id, code, name),
  presenter_profile:profiles!demos_presenter_profile_id_fkey(profile_id, full_name, email)`;
