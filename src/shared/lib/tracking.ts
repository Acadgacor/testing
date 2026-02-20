"use server";

import { getServerSupabaseRSC } from "@/shared/lib/supabaseServerRSC";

export async function trackOutboundClick(
    productId: string,
    platform: "shopee" | "tokopedia" | "other"
) {
    const supabase = await getServerSupabaseRSC();

    try {
        const { error } = await supabase.from("outbound_clicks").insert({
            product_id: productId,
            platform,
        });

        if (error) {
            console.error("Error tracking outbound click:", error);
            return { success: false, error: error.message };
        }

        // --- NEW: Update Product click_count ---
        const { data: product } = await supabase
            .from("products")
            .select("click_count")
            .eq("id", productId)
            .single();

        if (product) {
            const newCount = (product.click_count || 0) + 1;
            await supabase
                .from("products")
                .update({ click_count: newCount })
                .eq("id", productId);
        }

        return { success: true };
    } catch (err) {
        console.error("Unexpected error tracking outbound click:", err);
        return { success: false, error: "Internal Server Error" };
    }
}

export async function getOutboundClickCount(productId: string) {
    const supabase = await getServerSupabaseRSC();
    const { count, error } = await supabase
        .from("outbound_clicks")
        .select("*", { count: "exact", head: true })
        .eq("product_id", productId);

    if (error) {
        console.error("Error fetching outbound click count:", error);
        return 0;
    }

    // --- NEW: Sync to products table for catalog consistency ---
    if (count !== null) {
        await supabase
            .from("products")
            .update({ click_count: count })
            .eq("id", productId);
    }

    return count || 0;
}

