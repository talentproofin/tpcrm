/**
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 * @param {string} actorProfileId
 * @param {'created' | 'updated'} action
 * @param {string} profileId
 * @param {Record<string, unknown>} metadata
 */
export async function recordUserAdminAudit(
  supabase,
  actorProfileId,
  action,
  profileId,
  metadata
) {
  const { error } = await supabase.rpc("write_audit_log", {
    p_actor_profile_id: actorProfileId,
    p_action: action,
    p_entity_type: "profile",
    p_entity_id: profileId,
    p_metadata: metadata,
  });

  if (error) {
    throw new Error(error.message);
  }
}
