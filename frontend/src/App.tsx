import { useState, useEffect } from "react";
import type { Product, Category } from "./types";
import Sidebar from "./Sidebar";
import ProductsView from "./ProductsView";
import CategoriesView from "./CategoriesView";

const API_PRODUCTS = "http://localhost:4000/api/products";
const API_CATEGORIES = "http://localhost:4000/api/categories";

type ActiveView = "products" | "categories";

export default function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeView, setActiveView] = useState<ActiveView>("products");

  useEffect(() => { fetchProducts(); fetchCategories(); }, []);

  async function fetchProducts() {
    const res = await fetch(API_PRODUCTS);
    setProducts(await res.json());
  }

  async function fetchCategories() {
    const res = await fetch(API_CATEGORIES);
    setCategories(await res.json());
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar active={activeView} onChange={setActiveView} />

      <main className="flex-1 px-8 py-8">
        {activeView === "products" && (
          <ProductsView
            products={products}
            categories={categories}
            onRefresh={fetchProducts}
          />
        )}
        {activeView === "categories" && (
          <CategoriesView
            categories={categories}
            products={products}
            onRefresh={() => { fetchCategories(); fetchProducts(); }}
          />
        )}
      </main>
    </div>
  );
}