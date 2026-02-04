export type Product = {
  id: string;
  name: string;
  price: number; // in IDR
  image: string;
  rating: number; // 0..5
  skinType: string;
  keyIngredients: string[];
  ingredients: string[];
  benefits: string[];
  size: string; // e.g. "100 ml"
  category: string;
  category_id: number;
  product_type_id: number;
  how_to_use: string;
};

export type Review = {
  id: string;
  user_id: string;
  product_id: string | number; // Jaga-jaga bisa string atau number
  rating: number;
  comment: string | null;      // Komentar bisa kosong (null)
  created_at: string;          // Supabase return string, bukan Date

  // Penting! Ini untuk menampung data join dari tabel users
  user?: {
    full_name?: string | null;
    email?: string | null;
  } | null;
};