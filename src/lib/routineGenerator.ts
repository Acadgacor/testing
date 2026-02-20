import { CartItem } from "@/features/cart/store";

export type RoutineStep = {
    step: number;
    label: string;
    product: CartItem;
};

export type Routine = {
    morning: RoutineStep[];
    night: RoutineStep[];
};

const ORDER = ["Cleanser", "Toner", "Serum", "Moisturizer", "Sunscreen"];

function getOrder(category?: string) {
    if (!category) return 99;
    const idx = ORDER.indexOf(category);
    return idx === -1 ? 99 : idx;
}

export function generateRoutine(products: CartItem[]): Routine {
    // Filter unique products to avoid duplicates in steps
    const uniqueProducts = Array.from(new Map(products.map(item => [item.id, item])).values());

    const morning: RoutineStep[] = [];
    const night: RoutineStep[] = [];

    // Helper to check ingredients
    const hasIngredient = (item: CartItem, ing: string) =>
        item.ingredients?.some(i => i.toLowerCase().includes(ing.toLowerCase())) ?? false;

    uniqueProducts.forEach(item => {
        const order = getOrder(item.category);

        // Morning Rules
        // No Retinol in morning
        if (!hasIngredient(item, "Retinol")) {
            morning.push({ step: order, label: item.category || "Treat", product: item });
        }

        // Night Rules
        // No Sunscreen at night
        if (item.category !== "Sunscreen") {
            night.push({ step: order, label: item.category || "Treat", product: item });
        }
    });

    // Specific Logic: If Vitamin C present, prioritize for morning (already handled by inclusion, but maybe add highlight later)

    // Sort by layering order
    morning.sort((a, b) => a.step - b.step);
    night.sort((a, b) => a.step - b.step);

    return { morning, night };
}
