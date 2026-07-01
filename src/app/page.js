import { redirect } from "next/navigation";
import { AUTH_ROUTES } from "@/features/auth/constants/routes";

export default function HomePage() {
  redirect(AUTH_ROUTES.DASHBOARD);
}
