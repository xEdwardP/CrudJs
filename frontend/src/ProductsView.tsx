import { useState } from "react";
import {
  Eye, Pencil, Trash2, Plus, Search, Package,
  X, Save, AlertTriangle, Tag
} from "lucide-react";
import { toast } from "sonner";
import type { Product, Category } from "./types";

const API = "http://localhost:4000/api/products";

type ModalType = "create" | "edit" | "view" | "delete" | null;

const emptyForm = { name: "", description: "", price: "", categoryId: "" };

interface Props {
  products: Product[];
  categories: Category[];
  onRefresh: () => void;
}

export default function ProductsView({ products, categories, onRefresh }: Props) {
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("");
  const [modal, setModal] = useState<ModalType>(null);
  const [selected, setSelected] = useState<Product | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");

  function openCreate() { setForm(emptyForm); setError(""); setModal("create"); }
  function openEdit(p: Product) {
    setSelected(p);
    setForm({ name: p.name, description: p.description || "", price: String(p.price), categoryId: p.categoryId ? String(p.categoryId) : "" });
    setError(""); setModal("edit");
  }
  function openView(p: Product) { setSelected(p); setModal("view"); }
  function openDelete(p: Product) { setSelected(p); setModal("delete"); }
  function closeModal() { setModal(null); setSelected(null); setForm(emptyForm); setError(""); }

  async function handleCreate() {
    if (!form.name || form.price === "") { setError("Nombre y precio son requeridos."); return; }
    const res = await fetch(API, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, price: Number(form.price), categoryId: form.categoryId ? Number(form.categoryId) : null }),
    });
    if (res.ok) { onRefresh(); closeModal(); toast.success("Producto creado correctamente"); }
    else { const d = await res.json(); setError(d.message); toast.error(d.message); }
  }

  async function handleEdit() {
    if (!form.name || form.price === "") { setError("Nombre y precio son requeridos."); return; }
    const res = await fetch(`${API}/${selected!.id}`, {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, price: Number(form.price), categoryId: form.categoryId ? Number(form.categoryId) : null }),
    });
    if (res.ok) { onRefresh(); closeModal(); toast.success("Producto actualizado correctamente"); }
    else { const d = await res.json(); setError(d.message); toast.error(d.message); }
  }

  async function handleDelete() {
    await fetch(`${API}/${selected!.id}`, { method: "DELETE" });
    onRefresh(); closeModal(); toast.success("Producto eliminado correctamente");
  }

  const filtered = products.filter(p => {
    const matchSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.description || "").toLowerCase().includes(search.toLowerCase());
    const matchCat = filterCat === "" || String(p.categoryId) === filterCat;
    return matchSearch && matchCat;
  });

  return (
    <>
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">

        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Package size={20} className="text-indigo-500" />
            <h2 className="text-slate-700 font-semibold text-base">Productos</h2>
          </div>
          <button onClick={openCreate}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition">
            <Plus size={15} /> Nuevo producto
          </button>
        </div>

        <div className="px-6 py-4">

          <div className="flex gap-3 mb-4">
            <div className="relative flex-1">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar producto..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-slate-700 placeholder-slate-400 rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>
            <select value={filterCat} onChange={e => setFilterCat(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-slate-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400">
              <option value="">Todas las categorías</option>
              {categories.map(c => <option key={c.id} value={String(c.id)}>{c.name}</option>)}
            </select>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 text-slate-500 uppercase text-xs">
                  <th className="px-5 py-3 text-left">ID</th>
                  <th className="px-5 py-3 text-left">Nombre</th>
                  <th className="px-5 py-3 text-left">Descripción</th>
                  <th className="px-5 py-3 text-left">Categoría</th>
                  <th className="px-5 py-3 text-left">Precio</th>
                  <th className="px-5 py-3 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-10 text-slate-400">No se encontraron productos.</td>
                  </tr>
                ) : filtered.map(p => (
                  <tr key={p.id} className="hover:bg-slate-50 transition text-slate-600">
                    <td className="px-5 py-3 text-slate-400">#{p.id}</td>
                    <td className="px-5 py-3 font-medium text-slate-800">{p.name}</td>
                    <td className="px-5 py-3 text-slate-400">{p.description || "—"}</td>
                    <td className="px-5 py-3">
                      {p.category
                        ? <span className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-600 text-xs font-medium px-2 py-1 rounded-full"><Tag size={10} />{p.category.name}</span>
                        : <span className="text-slate-300 text-xs">Sin categoría</span>}
                    </td>
                    <td className="px-5 py-3 text-emerald-600 font-medium">L {Number(p.price).toFixed(2)}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => openView(p)}
                          className="flex items-center gap-1 bg-slate-100 hover:bg-slate-200 text-slate-600 px-3 py-1.5 rounded-lg text-xs font-medium transition">
                          <Eye size={13} /> Ver
                        </button>
                        <button onClick={() => openEdit(p)}
                          className="flex items-center gap-1 bg-amber-50 hover:bg-amber-100 text-amber-600 px-3 py-1.5 rounded-lg text-xs font-medium transition">
                          <Pencil size={13} /> Editar
                        </button>
                        <button onClick={() => openDelete(p)}
                          className="flex items-center gap-1 bg-red-50 hover:bg-red-100 text-red-500 px-3 py-1.5 rounded-lg text-xs font-medium transition">
                          <Trash2 size={13} /> Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="text-slate-400 text-xs mt-3">{filtered.length} producto(s) encontrado(s)</p>
        </div>
      </div>

      {modal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xl w-full max-w-md p-6 relative">
            <button onClick={closeModal} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition">
              <X size={18} />
            </button>

            {modal === "view" && selected && (
              <>
                <div className="flex items-center gap-2 mb-5">
                  <Eye size={18} className="text-indigo-500" />
                  <h2 className="text-slate-800 font-semibold text-lg">Detalle del producto</h2>
                </div>
                <div className="space-y-3 text-sm">
                  {([
                    ["ID", `#${selected.id}`],
                    ["Nombre", selected.name],
                    ["Descripción", selected.description || "—"],
                    ["Categoría", selected.category?.name || "Sin categoría"],
                    ["Precio", `L ${Number(selected.price).toFixed(2)}`],
                  ] as [string, string][]).map(([label, val]) => (
                    <div key={label} className="flex justify-between border-b border-slate-100 pb-2">
                      <span className="text-slate-400">{label}</span>
                      <span className="text-slate-700 font-medium">{val}</span>
                    </div>
                  ))}
                </div>
                <button onClick={closeModal}
                  className="mt-6 w-full flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-600 py-2 rounded-lg font-medium transition text-sm">
                  <X size={14} /> Cerrar
                </button>
              </>
            )}

            {(modal === "create" || modal === "edit") && (
              <>
                <div className="flex items-center gap-2 mb-5">
                  {modal === "create" ? <Plus size={18} className="text-indigo-500" /> : <Pencil size={18} className="text-amber-500" />}
                  <h2 className="text-slate-800 font-semibold text-lg">{modal === "create" ? "Crear producto" : "Editar producto"}</h2>
                </div>
                <div className="space-y-4">
                  {[
                    { label: "Nombre *", key: "name", type: "text" },
                    { label: "Precio *", key: "price", type: "number" },
                  ].map(({ label, key, type }) => (
                    <div key={key}>
                      <label className="block text-xs font-medium text-slate-500 mb-1">{label}</label>
                      <input type={type} value={form[key as keyof typeof form]}
                        onChange={e => setForm({ ...form, [key]: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
                    </div>
                  ))}
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Descripción</label>
                    <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3}
                      className="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Categoría</label>
                    <select value={form.categoryId} onChange={e => setForm({ ...form, categoryId: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 text-slate-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400">
                      <option value="">Sin categoría</option>
                      {categories.map(c => <option key={c.id} value={String(c.id)}>{c.name}</option>)}
                    </select>
                  </div>
                  {error && <p className="text-red-400 text-xs">{error}</p>}
                </div>
                <div className="flex gap-3 mt-6">
                  <button onClick={closeModal}
                    className="flex-1 flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-600 py-2 rounded-lg font-medium transition text-sm">
                    <X size={14} /> Cancelar
                  </button>
                  <button onClick={modal === "create" ? handleCreate : handleEdit}
                    className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg font-medium transition text-sm">
                    <Save size={14} /> {modal === "create" ? "Crear" : "Guardar"}
                  </button>
                </div>
              </>
            )}

            {modal === "delete" && selected && (
              <>
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle size={18} className="text-red-500" />
                  <h2 className="text-slate-800 font-semibold text-lg">Eliminar producto</h2>
                </div>
                <p className="text-slate-500 text-sm mb-6">
                  ¿Estás seguro que deseas eliminar <span className="text-slate-800 font-semibold">"{selected.name}"</span>? Esta acción no se puede deshacer.
                </p>
                <div className="flex gap-3">
                  <button onClick={closeModal}
                    className="flex-1 flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-600 py-2 rounded-lg font-medium transition text-sm">
                    <X size={14} /> Cancelar
                  </button>
                  <button onClick={handleDelete}
                    className="flex-1 flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg font-medium transition text-sm">
                    <Trash2 size={14} /> Eliminar
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
