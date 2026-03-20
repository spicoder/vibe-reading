import React from "react";

type StoreModalProps = {
  modal: {
    isOpen: boolean;
    type: "alert" | "confirm";
    title: string;
    message: string;
    onConfirm?: () => void;
  };
  closeModal: () => void;
};

export function StoreModal({ modal, closeModal }: StoreModalProps) {
  if (!modal.isOpen) return null;

  return (
    <div className="fixed inset-0 z-200 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl animate-in zoom-in-95 duration-200">
        <h3 className="text-xl font-bold font-serif mb-2">{modal.title}</h3>
        <p className="text-stone-600 mb-6 leading-relaxed">{modal.message}</p>
        <div className="flex gap-3 justify-end">
          {modal.type === "confirm" && (
            <button
              onClick={closeModal}
              className="px-4 py-2 font-bold text-stone-500 hover:bg-stone-100 rounded-lg transition"
            >
              Cancel
            </button>
          )}
          <button
            onClick={modal.type === "confirm" ? modal.onConfirm : closeModal}
            className="px-6 py-2 font-bold bg-amber-500 text-black hover:bg-amber-400 rounded-lg transition"
          >
            {modal.type === "confirm" ? "Confirm" : "Okay"}
          </button>
        </div>
      </div>
    </div>
  );
}
