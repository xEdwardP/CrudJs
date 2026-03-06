import { Package, Tag } from "lucide-react";

type ActiveView = "products" | "categories";

interface Props {
  active: ActiveView;
  onChange: (view: ActiveView) => void;
}

const links = [
  { key: "products" as ActiveView, label: "Productos", icon: <Package size={16} /> },
  { key: "categories" as ActiveView, label: "Categorías", icon: <Tag size={16} /> },
];

export default function Sidebar({ active, onChange }: Props) {
  return (
    <aside className="w-56 min-h-screen bg-white border-r border-slate-200 px-3 py-6 flex flex-col gap-1">

      <div className="px-3 mb-6">
        <h1 className="text-base font-bold text-slate-800 tracking-tight">Crud de productos</h1>
        <p className="text-slate-400 text-xs mt-0.5">Negocios Web - 2026</p>
      </div>

      {links.map(({ key, label, icon }) => (
        <button key={key} onClick={() => onChange(key)}
          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition text-left ${
            active === key
              ? "bg-indigo-50 text-indigo-600"
              : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
          }`}>
          {icon}{label}
        </button>
      ))}

    </aside>
  );
}