import { User } from "lucide-react";

import { getServerSupabaseRSC } from "@/shared/lib/supabaseServerRSC";
import Card from "@/shared/ui/Card";
import Button from "@/shared/ui/Button";
import { updateProfile } from "@/actions/profile";
import SkinProfilePanel from "@/components/SkinProfilePanel";
import LogoutButton from "@/features/auth/components/LogoutButton";
import { requireUser } from "@/features/auth/lib/authHelpers";

export default async function DashboardPage() {
  const user = await requireUser();
  const supabase = await getServerSupabaseRSC();
  const { data: profileData } = await supabase.from("users").select("full_name, avatar_url, email").eq("id", user?.id).single();

  // Merge profile with user_metadata (metadata takes precedence if profile is missing/empty)
  const meta = user?.user_metadata || {};
  const profile = {
    full_name: profileData?.full_name || meta.full_name || meta.name || "",
    avatar_url: profileData?.avatar_url || meta.avatar_url || meta.picture || "",
    email: profileData?.email || user?.email || ""
  };

  type OrderRow = { id: string; total: number; created_at: string; status: string };
  const { data: orders } = await supabase
    .from("orders")
    .select("id,total,created_at,status")
    .eq("user_id", user?.id)
    .order("created_at", { ascending: false });

  return (
    <section className="py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="p-6">
            {/* Avatar Display */}
            <div className="mb-6 flex flex-col items-center">
              {profile?.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt="Profile"
                  className="h-24 w-24 rounded-full border-2 border-brand-primary object-cover"
                />
              ) : (
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-neutral-100 text-neutral-400">
                  <User className="h-10 w-10" />
                </div>
              )}
            </div>

            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-brand-dark">Edit Profile</h2>
            </div>
            <form action={updateProfile} className="mt-4 space-y-4">
              <div>
                <label className="block text-sm text-brand-light">Email</label>
                <input
                  type="email"
                  value={user?.email || ""}
                  disabled
                  className="mt-1 w-full cursor-not-allowed rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-500"
                />
              </div>
              <div>
                <label className="block text-sm text-brand-light">Full name</label>
                <input name="full_name" defaultValue={profile?.full_name ?? ""} className="mt-1 w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm" />
              </div>
              <Button type="submit">Save</Button>
            </form>
            <div className="pt-2">
              <LogoutButton />
            </div>
          </Card>
          <SkinProfilePanel user={user} />
          <Card className="p-6 lg:col-span-2">
            <h2 className="text-lg font-semibold text-brand-dark">Order History</h2>
            <div className="mt-4 space-y-3">
              {((orders ?? []) as OrderRow[]).length === 0 ? (
                <div className="text-sm text-brand-light">No orders yet.</div>
              ) : (
                ((orders ?? []) as OrderRow[]).map((o) => (
                  <div key={o.id} className="flex items-center justify-between rounded-2xl border border-neutral-200 p-4">
                    <div>
                      <div className="text-sm font-semibold text-brand-dark">Order {o.id}</div>
                      <div className="text-xs text-brand-light">{new Date(o.created_at).toLocaleString()}</div>
                    </div>
                    <div className="text-sm font-semibold text-brand-dark">${Number(o.total).toFixed(2)}</div>
                    <div className="text-xs text-brand-light">{o.status}</div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
}
