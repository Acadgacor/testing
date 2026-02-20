"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { submitReview } from "../actions";
import Button from "@/shared/ui/Button";

type ReviewFormProps = {
  productId: string;
  userId?: string;
};

const stars = [1, 2, 3, 4, 5];

export default function ReviewForm({ productId, userId }: ReviewFormProps) {
  const [rating, setRating] = useState<number>(5);
  const [hover, setHover] = useState<number>(0);
  const [comment, setComment] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const displayStars = useMemo(() => (hover || rating), [hover, rating]);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage(null);
    const formData = new FormData(e.currentTarget);
    formData.set("productId", productId);
    formData.set("rating", String(rating));
    formData.set("comment", comment);

    startTransition(async () => {
      const res = await submitReview(undefined, formData);
      if (res?.error) {
        setMessage(res.error);
      } else {
        setMessage("Review saved");
      }
    });
  }

  if (!userId) {
    return (
      <div className="rounded-2xl border border-neutral-200 bg-white p-4 text-sm text-brand-dark">
        <div className="flex items-center justify-between">
          <span>Login to write a review.</span>
          <Link href="/auth/login" className="rounded-full bg-brand-primary px-4 py-2 text-xs font-semibold text-white">
            Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <input type="hidden" name="productId" value={productId} />
      <div>
        <div className="text-sm font-semibold text-brand-dark">Your rating</div>
        <div className="mt-2 flex items-center gap-2">
          {stars.map((s) => {
            const active = s <= displayStars;
            return (
              <button
                key={s}
                type="button"
                onMouseEnter={() => setHover(s)}
                onMouseLeave={() => setHover(0)}
                onClick={() => setRating(s)}
                className="p-1"
                aria-label={`Rate ${s} star${s > 1 ? "s" : ""}`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  className="h-6 w-6"
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
              </button>
            );
          })}
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-brand-dark">Comment</label>
        <textarea
          name="comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="mt-2 w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm"
          rows={3}
          placeholder="Share your experience"
        />
      </div>
      {message ? (
        <div className="rounded-2xl bg-brand-secondary px-4 py-2 text-sm text-brand-dark ring-1 ring-black/5">{message}</div>
      ) : null}
      <Button type="submit" disabled={isPending} className="w-full sm:w-auto">
        {isPending ? "Saving..." : "Submit Review"}
      </Button>
    </form>
  );
}
