import { MetadataRoute } from 'next';
import { getServerSupabase } from "@/shared/lib/supabaseServer";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://beaulytics.com';
    const supabase = await getServerSupabase();

    const staticRoutes: MetadataRoute.Sitemap = [
        {
            url: baseUrl,
            lastModified: new Date(),
        },
        {
            url: `${baseUrl}/products`,
            lastModified: new Date(),
        },
        {
            url: `${baseUrl}/ingredients`,
            lastModified: new Date(),
        },
        {
            url: `${baseUrl}/diagnosis`,
            lastModified: new Date(),
        },
        {
            url: `${baseUrl}/questionnaire`,
            lastModified: new Date(),
        },
    ];

    const { data: ingredients } = await supabase
        .from('ingredients')
        .select('slug, created_at');

    const ingredientRoutes: MetadataRoute.Sitemap = (ingredients || []).map((ingredient) => ({
        url: `${baseUrl}/ingredients/${ingredient.slug}`,
        lastModified: ingredient.created_at ? new Date(ingredient.created_at) : new Date(),
    }));

    const { data: products } = await supabase
        .from('products')
        .select('id, created_at');

    const productRoutes: MetadataRoute.Sitemap = (products || []).map((product) => ({
        url: `${baseUrl}/products/${product.id}`,
        lastModified: product.created_at ? new Date(product.created_at) : new Date(),
    }));

    return [...staticRoutes, ...ingredientRoutes, ...productRoutes];
}
