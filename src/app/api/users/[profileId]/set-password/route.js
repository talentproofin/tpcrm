import { NextResponse } from "next/server";
import { toApiErrorMessage } from "@/utils/apiErrors";
import { adminSetPasswordSchema } from "@/features/users/validation/adminSetPasswordSchema";
import { requireAdminSession } from "@/features/users/services/requireAdminSession";
import { recordUserAdminAudit } from "@/features/users/services/userAuditService";
import {
  getUserAdminClient,
  setUserPassword,
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

  let body;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const parsed = adminSetPasswordSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Validation failed." },
      { status: 400 }
    );
  }

  if (profileId === auth.profile.profileId) {
    return NextResponse.json(
      { error: "Use Account settings to change your own password." },
      { status: 400 }
    );
  }

  const { data: profile, error: profileError } = await auth.supabase
    .from("profiles")
    .select("email, auth_user_id")
    .eq("profile_id", profileId)
    .maybeSingle();

  if (profileError || !profile) {
    return NextResponse.json({ error: "User not found." }, { status: 404 });
  }

  if (!profile.auth_user_id) {
    return NextResponse.json(
      { error: "This user does not have an authentication account." },
      { status: 400 }
    );
  }

  try {
    const adminClient = getUserAdminClient();
    await setUserPassword(
      adminClient,
      String(profile.auth_user_id),
      parsed.data.password
    );

    await recordUserAdminAudit(
      auth.supabase,
      auth.profile.profileId,
      "updated",
      profileId,
      {
        event: "password_reset_by_admin",
        email: String(profile.email),
      }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      {
        error: toApiErrorMessage(error, "Unable to update user password."),
      },
      { status: 400 }
    );
  }
}
