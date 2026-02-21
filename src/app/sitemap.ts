import { MetadataRoute } from 'next';
import { getServerSupabase } from "@/shared/lib/supabaseServer";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const supabase = await getServerSupabase();

    const staticRoutes: MetadataRoute.Sitemap = [
        {
            url: baseUrl,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 1.0,
        },
        {
            url: `${baseUrl}/products`,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 0.8,
        },
        {
            url: `${baseUrl}/Ai`,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 0.8,
        },
        {
            url: `${baseUrl}/dashboard`,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 0.8,
        },
        {
            url: `${baseUrl}/diagnosis`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.8,
        },
        {
            url: `${baseUrl}/ingredients`,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 0.8,
        },
    ];

    const { data: ingredients } = await supabase
        .from('ingredients')
        .select('slug, updated_at, created_at');

    const ingredientRoutes: MetadataRoute.Sitemap = (ingredients || []).map((ingredient) => ({
        url: `${baseUrl}/ingredients/${ingredient.slug}`,
        lastModified: ingredient.updated_at || ingredient.created_at ? new Date(ingredient.updated_at || ingredient.created_at) : new Date(),
        changeFrequency: 'monthly',
        priority: 0.6,
    }));

    const { data: products } = await supabase
        .from('products')
        .select('id, updated_at, created_at');

    const productRoutes: MetadataRoute.Sitemap = (products || []).map((product) => ({
        url: `${baseUrl}/products/${product.id}`,
        lastModified: product.updated_at || product.created_at ? new Date(product.updated_at || product.created_at) : new Date(),
        changeFrequency: 'monthly',
        priority: 0.7,
    }));

    return [...staticRoutes, ...ingredientRoutes, ...productRoutes];
}
