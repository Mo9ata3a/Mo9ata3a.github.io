export interface Product {
  id: string;
  name: string;
  prix: number;
  photo_url: string;
  categorie: string;
  ban: boolean | null;
  alternatives?: Product[];
}

export interface SearchState {
  searchTerm: string;
  category: string;
  products: Product[];
  loading: boolean;
  error: string | null;
}