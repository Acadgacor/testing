import { getServerSupabaseRSC } from "@/shared/lib/supabaseServerRSC";
import type { Review } from "@/features/products/types";

function StarRow({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((s) => {
        const active = s <= value;
        return (
          <svg
            key={s}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            className="h-4 w-4"
            fill={active ? "#fbbf24" : "none"}
            stroke={active ? "#f59e0b" : "#d1d5db"}
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 17.25 6.518 20l1.05-6.126L3 9.25l6.259-.909L12 3l2.741 5.341L21 9.25l-4.568 4.624L17.482 20z"
            />
          </svg>
        );
      })}
    </div>
  );
}

export default async function ReviewList({ productId }: { productId: string }) {
  const supabase = await getServerSupabaseRSC();
  const { data: reviewsData, error: reviewsError } = await supabase
    .from("reviews")
    .select("*")
    .eq("product_id", productId)
    .order("created_at", { ascending: false });

  if (reviewsError) {
    console.error("Error loading reviews:", reviewsError);
    return <div className="text-sm text-red-600">Failed to load reviews.</div>;
  }

  const reviews = (reviewsData || []) as Review[];
  if (reviews.length === 0) {
    return <div className="text-sm text-brand-light">No reviews yet. Be the first to review!</div>;
  }

  // Fetch users manually since the FK join might be missing or broken
  const userIds = Array.from(new Set(reviews.map((r) => r.user_id).filter(Boolean)));
  const usersMap: Record<string, { full_name?: string | null; avatar_url?: string | null }> = {};

  if (userIds.length > 0) {
    const { data: usersData } = await supabase
      .from("users")
      .select("id, full_name, avatar_url")
      .in("id", userIds);

    if (usersData) {
      usersData.forEach((u) => {
        usersMap[u.id] = u;
      });
    }
  }

  return (
    <div className="space-y-4">
      {reviews.map((r) => {
        const user = usersMap[r.user_id];
        const name = user?.full_name || "User";
        const avatarUrl = user?.avatar_url;

        // Generate initials
        const initials = name
          .split(" ")
          .map((n) => n[0])
          .slice(0, 2)
          .join("")
          .toUpperCase();

        const ratingVal = Number(r.rating || 0);
        const date = new Date(r.created_at).toLocaleDateString("id-ID", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        });

        return (
          <div key={r.id} className="rounded-2xl border border-neutral-200 bg-white p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div>
                  <div className="text-sm font-semibold text-brand-dark">{name}</div>
                  <div className="text-xs text-brand-light">{date}</div>
                </div>
              </div>
              <StarRow value={ratingVal} />
            </div>
            {r.comment ? <div className="mt-3 text-sm text-brand-dark">{r.comment}</div> : null}
          </div>
        );
      })}
    </div>
  );
}
