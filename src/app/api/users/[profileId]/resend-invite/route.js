import { NextResponse } from "next/server";
import { toApiErrorMessage } from "@/utils/apiErrors";
import { requireAdminSession } from "@/features/users/services/requireAdminSession";
import { recordUserAdminAudit } from "@/features/users/services/userAuditService";
import {
  getUserAdminClient,
  resendInviteEmail,
} from "@/features/users/services/userAdminAuth";

/**
 * @param {Request} request
 * @param {{ params: Promise<{ profileId: string }> }} context
 */
export async function POST(request, context) {
  const auth = await requireAdminSession();

  if (!auth.ok) {
    return auth.response;
  }

  const { profileId } = await context.params;

  const { data: profile, error: profileError } = await auth.supabase
    .from("profiles")
    .select("email")
    .eq("profile_id", profileId)
    .maybeSingle();

  if (profileError || !profile) {
    return NextResponse.json({ error: "User not found." }, { status: 404 });
  }

  try {
    const adminClient = getUserAdminClient();
    await resendInviteEmail(adminClient, String(profile.email));

    await recordUserAdminAudit(
      auth.supabase,
      auth.profile.profileId,
      "updated",
      profileId,
      {
        event: "invite_email_resent",
        email: String(profile.email),
      }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      {
        error: toApiErrorMessage(error, "Unable to resend invite email."),
      },
      { status: 400 }
    );
  }
}
