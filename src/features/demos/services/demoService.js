import { createService } from "@/services/infrastructure/createService";
import { DEMO_ERROR_CODES } from "../constants";
import { combineDemoDateAndTime } from "../validation";
import { DEMO_SELECT, mapDemoRow } from "./demoMapper";

/**
 * @param {string} code
 * @param {string} message
 */
function createDemoError(code, message) {
  const error = new Error(message);
  error.code = code;
  return error;
}

/**
 * @param {unknown} error
 */
function mapDatabaseError(error) {
  const message =
    error && typeof error === "object" && "message" in error
      ? String(error.message)
      : "Unable to complete the demo request. Please try again.";

  if (
    message.includes("cannot be in the past") ||
    message.includes("outcome is required") ||
    message.includes("Invalid demo outcome")
  ) {
    return createDemoError(DEMO_ERROR_CODES.VALIDATION, message);
  }

  if (
    message.includes("Only scheduled") ||
    message.includes("can be edited") ||
    message.includes("can be completed") ||
    message.includes("can be cancelled") ||
    message.includes("can be rescheduled")
  ) {
    return createDemoError(DEMO_ERROR_CODES.INVALID_STATE, message);
  }

  return createDemoError(DEMO_ERROR_CODES.UNKNOWN, message);
}

/**
 * @param {string | null | undefined} value
 */
function emptyToNull(value) {
  const trimmed = (value ?? "").trim();
  return trimmed || null;
}

/**
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 * @param {string} demoId
 */
async function fetchDemoById(supabase, demoId) {
  const { data, error } = await supabase
    .from("demos")
    .select(DEMO_SELECT)
    .eq("id", demoId)
    .maybeSingle();

  if (error) {
    throw mapDatabaseError(error);
  }

  if (!data) {
    throw createDemoError(DEMO_ERROR_CODES.NOT_FOUND, "Demo not found.");
  }

  return mapDemoRow(data);
}

/**
 * @param {import('zod').infer<typeof import('../validation/demoSchema').demoScheduleSchema>} input
 */
function buildSchedulePayload(input) {
  return {
    scheduledAt: combineDemoDateAndTime(input.demoDate, input.demoTime),
    durationMinutes: input.durationMinutes,
    demoMode: input.demoMode,
    meetingLink: emptyToNull(input.meetingLink),
    venue: emptyToNull(input.venue),
    presenterProfileId: input.presenterProfileId,
    attendees: emptyToNull(input.attendees),
    internalNotes: emptyToNull(input.internalNotes),
  };
}

export const getDemosByLead = createService({
  name: "getDemosByLead",
  execute: async (supabase, leadId) => {
    const { data, error } = await supabase
      .from("demos")
      .select(DEMO_SELECT)
      .eq("lead_id", leadId)
      .order("scheduled_at", { ascending: false });

    if (error) {
      throw mapDatabaseError(error);
    }

    return (data ?? []).map(mapDemoRow);
  },
});

export const scheduleDemo = createService({
  name: "scheduleDemo",
  execute: async (supabase, profileId, leadId, input) => {
    const payload = buildSchedulePayload(input);

    const { data, error } = await supabase.rpc("schedule_demo", {
      p_lead_id: leadId,
      p_scheduled_at: payload.scheduledAt,
      p_duration_minutes: payload.durationMinutes,
      p_demo_mode: payload.demoMode,
      p_meeting_link: payload.meetingLink,
      p_venue: payload.venue,
      p_presenter_profile_id: payload.presenterProfileId,
      p_attendees: payload.attendees,
      p_internal_notes: payload.internalNotes,
      p_created_by_profile_id: profileId,
    });

    if (error) {
      throw mapDatabaseError(error);
    }

    return fetchDemoById(supabase, String(data));
  },
});

export const updateDemo = createService({
  name: "updateDemo",
  execute: async (supabase, profileId, demoId, input) => {
    const payload = buildSchedulePayload(input);

    const { data, error } = await supabase.rpc("update_demo", {
      p_demo_id: demoId,
      p_scheduled_at: payload.scheduledAt,
      p_duration_minutes: payload.durationMinutes,
      p_demo_mode: payload.demoMode,
      p_meeting_link: payload.meetingLink,
      p_venue: payload.venue,
      p_presenter_profile_id: payload.presenterProfileId,
      p_attendees: payload.attendees,
      p_internal_notes: payload.internalNotes,
      p_summary: null,
      p_updated_by_profile_id: profileId,
    });

    if (error) {
      throw mapDatabaseError(error);
    }

    return fetchDemoById(supabase, String(data));
  },
});

export const updateCompletedDemo = createService({
  name: "updateCompletedDemo",
  execute: async (supabase, profileId, demo, input) => {
    const { data, error } = await supabase.rpc("update_demo", {
      p_demo_id: demo.id,
      p_scheduled_at: demo.scheduledAt,
      p_duration_minutes: demo.durationMinutes,
      p_demo_mode: demo.demoMode,
      p_meeting_link: demo.meetingLink,
      p_venue: demo.venue,
      p_presenter_profile_id: demo.presenterProfileId,
      p_attendees: demo.attendees,
      p_internal_notes: emptyToNull(input.internalNotes),
      p_summary: input.summary.trim(),
      p_updated_by_profile_id: profileId,
    });

    if (error) {
      throw mapDatabaseError(error);
    }

    return fetchDemoById(supabase, String(data));
  },
});

export const completeDemo = createService({
  name: "completeDemo",
  execute: async (supabase, profileId, demoId, input) => {
    const { data, error } = await supabase.rpc("complete_demo", {
      p_demo_id: demoId,
      p_demo_outcome_id: input.demoOutcomeId,
      p_summary: input.summary.trim(),
      p_updated_by_profile_id: profileId,
    });

    if (error) {
      throw mapDatabaseError(error);
    }

    return fetchDemoById(supabase, String(data));
  },
});

export const cancelDemo = createService({
  name: "cancelDemo",
  execute: async (supabase, profileId, demoId) => {
    const { data, error } = await supabase.rpc("cancel_demo", {
      p_demo_id: demoId,
      p_updated_by_profile_id: profileId,
    });

    if (error) {
      throw mapDatabaseError(error);
    }

    return fetchDemoById(supabase, String(data));
  },
});

export const rescheduleDemo = createService({
  name: "rescheduleDemo",
  execute: async (supabase, profileId, demoId, input) => {
    const payload = buildSchedulePayload(input);

    const { data, error } = await supabase.rpc("reschedule_demo", {
      p_demo_id: demoId,
      p_scheduled_at: payload.scheduledAt,
      p_duration_minutes: payload.durationMinutes,
      p_demo_mode: payload.demoMode,
      p_meeting_link: payload.meetingLink,
      p_venue: payload.venue,
      p_presenter_profile_id: payload.presenterProfileId,
      p_attendees: payload.attendees,
      p_internal_notes: payload.internalNotes,
      p_updated_by_profile_id: profileId,
    });

    if (error) {
      throw mapDatabaseError(error);
    }

    return fetchDemoById(supabase, String(data));
  },
});
