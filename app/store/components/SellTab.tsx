import { useState } from "react";

export function SellTab({ onSubmit }: { onSubmit: (item: any) => void }) {
  const [newItem, setNewItem] = useState({
    name: "",
    desc: "",
    instructions: "",
    price: 10,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(newItem);
    setNewItem({ name: "", desc: "", instructions: "", price: 10 });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 bg-white p-6 rounded-xl border border-stone-200 shadow-sm"
    >
      <div>
        <label className="block text-sm font-bold text-stone-700 mb-1">
          What are you offering?
        </label>
        <input
          required
          type="text"
          placeholder="e.g., Free Coffee, High-Five"
          className="w-full border border-stone-300 rounded-lg p-3"
          value={newItem.name}
          onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
        />
      </div>
      <div>
        <label className="block text-sm font-bold text-stone-700 mb-1">
          Price (Stars to Burn)
        </label>
        <input
          required
          type="number"
          min="1"
          className="w-full border border-stone-300 rounded-lg p-3 font-mono text-lg"
          value={newItem.price}
          onChange={(e) =>
            setNewItem({ ...newItem, price: parseInt(e.target.value) })
          }
        />
      </div>
      <div>
        <label className="block text-sm font-bold text-stone-700 mb-1">
          Description
        </label>
        <textarea
          required
          placeholder="Details about the item..."
          className="w-full border border-stone-300 rounded-lg p-3 h-24"
          value={newItem.desc}
          onChange={(e) => setNewItem({ ...newItem, desc: e.target.value })}
        />
      </div>
      <div>
        <label className="block text-sm font-bold text-stone-700 mb-1">
          How will they get it?
        </label>
        <textarea
          required
          placeholder="e.g., I will bring it to church on Sunday."
          className="w-full border border-stone-300 rounded-lg p-3 h-20"
          value={newItem.instructions}
          onChange={(e) =>
            setNewItem({ ...newItem, instructions: e.target.value })
          }
        />
      </div>
      <button
        type="submit"
        className="w-full bg-amber-500 hover:bg-amber-400 text-black font-bold py-4 rounded-xl text-lg transition"
      >
        List on Market
      </button>
    </form>
  );
}
