import { NextResponse } from "next/server";
import { userCreateSchema } from "@/features/users/validation";
import { requireAdminSession } from "@/features/users/services/requireAdminSession";
import {
  getUserAdminClient,
  inviteNewUser,
} from "@/features/users/services/userAdminAuth";

/**
 * @param {Request} request
 */
export async function POST(request) {
  const auth = await requireAdminSession();

  if (!auth.ok) {
    return auth.response;
  }

  let body;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const parsed = userCreateSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Validation failed." },
      { status: 400 }
    );
  }

  const input = parsed.data;
  const adminClient = getUserAdminClient();
  let authUserId = null;

  try {
    const authUser = await inviteNewUser(adminClient, input.email);
    authUserId = authUser.id;

    const { data: profileId, error: profileError } = await auth.supabase.rpc(
      "admin_create_profile",
      {
        p_auth_user_id: authUserId,
        p_full_name: input.fullName,
        p_email: input.email,
        p_role_id: input.roleId,
        p_manager_profile_id: input.managerProfileId || null,
        p_phone: input.phone || null,
        p_status: input.status,
        p_created_by_profile_id: auth.profile.profileId,
      }
    );

    if (profileError) {
      await adminClient.auth.admin.deleteUser(authUserId);

      return NextResponse.json({ error: profileError.message }, { status: 400 });
    }

    return NextResponse.json({ profileId }, { status: 201 });
  } catch (error) {
    if (authUserId) {
      await adminClient.auth.admin.deleteUser(authUserId);
    }

    const message =
      error instanceof Error ? error.message : "Unable to create user.";

    if (
      message.includes("already been registered") ||
      message.includes("already exists")
    ) {
      return NextResponse.json(
        { error: "A user with this email already exists." },
        { status: 400 }
      );
    }

    return NextResponse.json({ error: message }, { status: 400 });
  }
}
