import { UserProfile } from "@/types/user";
import { User } from "@supabase/supabase-js";

export function getUserProfile(user: User): UserProfile {
    const meta = user.user_metadata || {};
    const tags = Array.isArray(meta.skin_tags) ? meta.skin_tags : [];

    // Mapping logic based on tags
    const profile: UserProfile = {
        concerns: [],
    };

    // Extract Skin Type
    if (tags.some((t: string) => /sensitive/i.test(t))) profile.skinType = "Sensitive";
    else if (tags.some((t: string) => /oily/i.test(t))) profile.skinType = "Oily";
    else if (tags.some((t: string) => /dry/i.test(t))) profile.skinType = "Dry";
    else if (tags.some((t: string) => /combination/i.test(t))) profile.skinType = "Combination";
    else profile.skinType = "Normal";

    // Extract Concerns
    if (tags.some((t: string) => /acne/i.test(t))) profile.concerns?.push("Acne");
    if (tags.some((t: string) => /aging/i.test(t) || /wrinkle/i.test(t))) profile.concerns?.push("Aging");
    if (tags.some((t: string) => /dull/i.test(t))) profile.concerns?.push("Dullness");
    if (tags.some((t: string) => /pore/i.test(t))) profile.concerns?.push("Pores");

    return profile;
}

export function analyzeIngredients(ingredients: string[], profile: UserProfile): string[] {
    const warnings: string[] = [];
    const lowerIngredients = ingredients.map(i => i.toLowerCase());

    // Rules for Sensitive Skin
    if (profile.skinType === "Sensitive") {
        if (lowerIngredients.some(i => i.includes("alcohol") || i.includes("ethanol"))) {
            warnings.push("Contains Alcohol (risk of irritation for sensitive skin)");
        }
        if (lowerIngredients.some(i => i.includes("fragrance") || i.includes("parfum"))) {
            warnings.push("Contains Fragrance (potential allergen for sensitive skin)");
        }
        if (lowerIngredients.some(i => i.includes("sls") || i.includes("sulfate"))) {
            warnings.push("Contains Sulfates (can be drying/irritating)");
        }
    }

    // Rules for Acne Prone
    if (profile.concerns?.includes("Acne")) {
        if (lowerIngredients.some(i => i.includes("coconut oil") || i.includes("cocos nucifera"))) {
            warnings.push("Contains Coconut Oil (highly comedogenic)");
        }
        if (lowerIngredients.some(i => i.includes("cocoa butter"))) {
            warnings.push("Contains Cocoa Butter (comedogenic)");
        }
        if (lowerIngredients.some(i => i.includes("lanolin"))) {
            warnings.push("Contains Lanolin (can clog pores)");
        }
    }

    // Rules for Dry Skin
    if (profile.skinType === "Dry") {
        if (lowerIngredients.some(i => i.includes("alcohol denat"))) {
            warnings.push("Contains Alcohol Denat (drying)");
        }
        if (lowerIngredients.some(i => i.includes("clay") || i.includes("kaolin"))) {
            warnings.push("Contains Clay (can be too drying)");
        }
    }

    return warnings;
}
