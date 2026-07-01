import { redirect } from "next/navigation";
import { SETTINGS_ROUTES } from "@/features/settings/constants/routes";

export default function SettingsIndexPage() {
  redirect(SETTINGS_ROUTES.ORGANIZATION);
}
