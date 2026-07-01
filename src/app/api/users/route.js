import { NextResponse } from "next/server";
import { logger } from "@/services/logging";
import { toApiErrorMessage } from "@/utils/apiErrors";
import { userCreateSchema } from "@/features/users/validation";
import { requireAdminSession } from "@/features/users/services/requireAdminSession";
import {
  createAuthUser,
  getUserAdminClient,
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
  let adminClient;
  let authUserId = null;

  try {
    adminClient = getUserAdminClient();
  } catch (error) {
    logger.error("users.create: admin client unavailable", {
      error: error instanceof Error ? error.message : String(error),
    });

    return NextResponse.json(
      {
        error: toApiErrorMessage(
          error,
          "Server authentication is misconfigured. Check SUPABASE_SERVICE_ROLE_KEY."
        ),
      },
      { status: 500 }
    );
  }

  try {
    const authUser = await createAuthUser(
      adminClient,
      input.email,
      input.password || undefined
    );
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
        p_status: "invited",
        p_created_by_profile_id: auth.profile.profileId,
      }
    );

    if (profileError) {
      logger.error("users.create: profile RPC failed", {
        error: profileError.message,
        email: input.email,
      });

      await adminClient.auth.admin.deleteUser(authUserId);

      return NextResponse.json(
        {
          error: toApiErrorMessage(
            new Error(profileError.message),
            "Unable to create user profile."
          ),
        },
        { status: 400 }
      );
    }

    return NextResponse.json({ profileId }, { status: 201 });
  } catch (error) {
    logger.error("users.create: auth user creation failed", {
      error: error instanceof Error ? error.message : String(error),
      email: input.email,
    });

    if (authUserId) {
      await adminClient.auth.admin.deleteUser(authUserId);
    }

    return NextResponse.json(
      {
        error: toApiErrorMessage(error, "Unable to create user."),
      },
      { status: 400 }
    );
  }
}
