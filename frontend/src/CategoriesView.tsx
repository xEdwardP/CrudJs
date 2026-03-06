import { useState } from "react";
import {
  Pencil, Trash2, Plus, Tag,
  X, Save, AlertTriangle, LayoutGrid
} from "lucide-react";
import { toast } from "sonner";
import type { Category, Product } from "./types";

const API = "http://localhost:4000/api/categories";

type ModalType = "create" | "edit" | "delete" | null;

const emptyForm = { name: "" };

interface Props {
  categories: Category[];
  products: Product[];
  onRefresh: () => void;
}

export default function CategoriesView({ categories, products, onRefresh }: Props) {
  const [modal, setModal] = useState<ModalType>(null);
  const [selected, setSelected] = useState<Category | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");

  function openCreate() { setForm(emptyForm); setError(""); setModal("create"); }
  function openEdit(c: Category) { setSelected(c); setForm({ name: c.name }); setError(""); setModal("edit"); }
  function openDelete(c: Category) { setSelected(c); setModal("delete"); }
  function closeModal() { setModal(null); setSelected(null); setForm(emptyForm); setError(""); }

  async function handleCreate() {
    if (!form.name) { setError("El nombre es requerido."); return; }
    const res = await fetch(API, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: form.name }),
    });
    if (res.ok) { onRefresh(); closeModal(); toast.success("Categoría creada correctamente"); }
    else { const d = await res.json(); setError(d.message); toast.error(d.message); }
  }

  async function handleEdit() {
    if (!form.name) { setError("El nombre es requerido."); return; }
    const res = await fetch(`${API}/${selected!.id}`, {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: form.name }),
    });
    if (res.ok) { onRefresh(); closeModal(); toast.success("Categoría actualizada correctamente"); }
    else { const d = await res.json(); setError(d.message); toast.error(d.message); }
  }

  async function handleDelete() {
    await fetch(`${API}/${selected!.id}`, { method: "DELETE" });
    onRefresh(); closeModal(); toast.success("Categoría eliminada. Los productos fueron desvinculados.");
  }

  return (
    <>
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">

        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Tag size={20} className="text-indigo-500" />
            <h2 className="text-slate-700 font-semibold text-base">Categorías</h2>
          </div>
          <button onClick={openCreate}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition">
            <Plus size={15} /> Nueva categoría
          </button>
        </div>

        <div className="px-6 py-4">
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 text-slate-500 uppercase text-xs">
                  <th className="px-5 py-3 text-left">ID</th>
                  <th className="px-5 py-3 text-left">Nombre</th>
                  <th className="px-5 py-3 text-left">Productos</th>
                  <th className="px-5 py-3 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {categories.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center py-10 text-slate-400">No hay categorías creadas.</td>
                  </tr>
                ) : categories.map(c => {
                  const count = products.filter(p => p.categoryId === c.id).length;
                  return (
                    <tr key={c.id} className="hover:bg-slate-50 transition text-slate-600">
                      <td className="px-5 py-3 text-slate-400">#{c.id}</td>
                      <td className="px-5 py-3 font-medium text-slate-800">
                        <span className="inline-flex items-center gap-1.5">
                          <Tag size={13} className="text-indigo-400" />{c.name}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-500 text-xs font-medium px-2 py-1 rounded-full">
                          <LayoutGrid size={10} />{count} producto(s)
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center justify-center gap-2">
                          <button onClick={() => openEdit(c)}
                            className="flex items-center gap-1 bg-amber-50 hover:bg-amber-100 text-amber-600 px-3 py-1.5 rounded-lg text-xs font-medium transition">
                            <Pencil size={13} /> Editar
                          </button>
                          <button onClick={() => openDelete(c)}
                            className="flex items-center gap-1 bg-red-50 hover:bg-red-100 text-red-500 px-3 py-1.5 rounded-lg text-xs font-medium transition">
                            <Trash2 size={13} /> Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="text-slate-400 text-xs mt-3">{categories.length} categoría(s) registrada(s)</p>
        </div>
      </div>

      {modal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xl w-full max-w-md p-6 relative">
            <button onClick={closeModal} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition">
              <X size={18} />
            </button>

            {(modal === "create" || modal === "edit") && (
              <>
                <div className="flex items-center gap-2 mb-5">
                  {modal === "create" ? <Plus size={18} className="text-indigo-500" /> : <Pencil size={18} className="text-amber-500" />}
                  <h2 className="text-slate-800 font-semibold text-lg">{modal === "create" ? "Crear categoría" : "Editar categoría"}</h2>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Nombre *</label>
                    <input type="text" value={form.name} onChange={e => setForm({ name: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
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
                  <h2 className="text-slate-800 font-semibold text-lg">Eliminar categoría</h2>
                </div>
                <p className="text-slate-500 text-sm mb-2">
                  ¿Estás seguro que deseas eliminar <span className="text-slate-800 font-semibold">"{selected.name}"</span>?
                </p>
                <p className="text-amber-500 text-xs mb-6 flex items-center gap-1">
                  <AlertTriangle size={12} /> Los productos asignados quedarán sin categoría.
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