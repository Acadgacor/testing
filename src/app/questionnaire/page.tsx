import { getServerSupabaseRSC } from "@/shared/lib/supabaseServerRSC";
import QuestionnaireForm from "@/components/QuestionnaireForm";
import { requireUser } from "@/features/auth/lib/authHelpers";

export default async function QuestionnairePage() {
  const user = await requireUser();
  const supabase = await getServerSupabaseRSC();
  return <QuestionnaireForm user={user} />;
}
