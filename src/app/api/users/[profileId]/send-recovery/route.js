import { NextResponse } from "next/server";
import { requireAdminSession } from "@/features/users/services/requireAdminSession";
import {
  getUserAdminClient,
  sendRecoveryEmail,
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
    await sendRecoveryEmail(adminClient, String(profile.email));

    return NextResponse.json({ success: true });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unable to send password recovery email.";

    return NextResponse.json({ error: message }, { status: 400 });
  }
}
