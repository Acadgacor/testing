export type IngredientStatus = 'positive' | 'negative' | 'neutral' | 'highlight';

export interface IngredientBadge {
    label: string;
    status: IngredientStatus;
}

export interface UserSkinProfile {
    skin_type?: string;
    skin_concerns?: string[];
}

export function analyzeIngredients(ingredients?: string[] | null, userProfile?: UserSkinProfile | null): IngredientBadge[] {
    if (!ingredients || ingredients.length === 0) {
        return [];
    }

    const badges: IngredientBadge[] = [];

    // NORMALISASI: Pecah semua koma (jaga-jaga kalau datanya gabung) lalu bersihin spasi
    const normalizedIngredients = ingredients
        .flatMap(i => i.split(','))
        .map(i => i.trim().toLowerCase())
        .filter(i => i.length > 0);

    // Helper flags
    let hasAlcohol = false;
    let hasFragrance = false;
    let hasSulfate = false;

    const highlightsFound = new Set<string>();

    for (const ingredient of normalizedIngredients) {
        // 1. Negative Triggers
        // Deteksi Alkohol jahat (Abaikan alkohol baik/fatty alcohol)
        if (
            ingredient.includes('alcohol') &&
            !ingredient.includes('cetyl') &&
            !ingredient.includes('stearyl') &&
            !ingredient.includes('cetearyl') &&
            !ingredient.includes('behenyl') &&
            !ingredient.includes('panthenol') // Panthenol = pro-vit B5 (bukan alkohol jahat)
        ) {
            hasAlcohol = true;
        }

        // Fragrance / Parfum / Minyak Esensial
        if (ingredient.includes('fragrance') || ingredient.includes('parfum') || ingredient.includes('essential oil')) {
            hasFragrance = true;
        }

        // Sulfate (SLS/SLES)
        if (ingredient.includes('sulfate') || ingredient.includes('sls')) {
            hasSulfate = true;
        }

        // 2. Highlights / Hero Ingredients
        if (ingredient.includes('niacinamide')) highlightsFound.add('✨ Niacinamide');
        if (ingredient.includes('salicylic acid') || ingredient.includes('bha')) highlightsFound.add('✨ Salicylic Acid');
        if (ingredient.includes('hyaluronic') || ingredient.includes('sodium hyaluronate')) highlightsFound.add('💧 Hyaluronic Acid');
        if (ingredient.includes('ceramide')) highlightsFound.add('🛡️ Ceramide');
        if (ingredient.includes('retinol') || ingredient.includes('retinoid')) highlightsFound.add('⏳ Retinol');
        if (ingredient.includes('centella') || ingredient.includes('cica')) highlightsFound.add('🌿 Centella Asiatica');
    }

    // Add highlight badges (Bahan Unggulan)
    highlightsFound.forEach(label => {
        badges.push({ label, status: 'highlight' });
    });

    const isAcneProne = userProfile?.skin_concerns?.some(c => c.toLowerCase().includes('jerawat'));
    const isDrySkin = userProfile?.skin_type?.toLowerCase().includes('kering');
    const isSensitive = userProfile?.skin_type?.toLowerCase().includes('sensitif') || userProfile?.skin_concerns?.some(c => c.toLowerCase().includes('sensitif'));

    // Personalized Acne Check
    if (isAcneProne &&
        (highlightsFound.has('✨ Salicylic Acid') || highlightsFound.has('🌿 Centella Asiatica'))) {
        badges.push({ label: '✨ Cocok untuk meredakan Jerawat Anda', status: 'highlight' });
    }
    if (hasAlcohol) {
        // Pake .toLowerCase() biar aman dari huruf besar/kecil
        if (userProfile?.skin_type?.toLowerCase().includes('kering')) {
            badges.push({ label: '⚠️ Alkohol (Bikin kulit Anda makin kering)', status: 'negative' });
        } else {
            badges.push({ label: '⚠️ Mengandung Alkohol', status: 'negative' });
        }
    }

    if (hasFragrance) {
        // Ceknya di skin_concerns karena pilihan 'Sensitif' ada di array concerns lu
        const hasSensitiveConcern = userProfile?.skin_concerns?.some(c => c.toLowerCase().includes('sensitif'));

        if (hasSensitiveConcern) {
            badges.push({ label: '⚠️ Pewangi (Rentan untuk kulit sensitif Anda)', status: 'negative' });
        } else {
            badges.push({ label: '⚠️ Mengandung Pewangi', status: 'negative' });
        }
    }

    if (hasSulfate) {
        badges.push({ label: '⚠️ Mengandung Sulfat', status: 'negative' });
    }

    // Add positive missing triggers (Klaim Aman)
    if (!hasAlcohol) badges.push({ label: '🟢 Bebas Alkohol', status: 'positive' });
    if (!hasFragrance) badges.push({ label: '🟢 Bebas Pewangi', status: 'positive' });
    if (!hasSulfate) badges.push({ label: '🟢 Bebas Sulfat', status: 'positive' });

    return badges;
}