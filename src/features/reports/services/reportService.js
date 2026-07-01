import { createService } from "@/services/infrastructure/createService";
import { loadDailyReportData } from "./reportQueries";

export const getDailyReport = createService({
  name: "getDailyReport",
  execute: async (supabase) => loadDailyReportData(supabase),
});
