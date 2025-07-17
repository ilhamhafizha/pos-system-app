import { useState } from "react";

export default function NotePopup({ menu, onClose, onConfirm }) {
  const [note, setNote] = useState("");

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl w-[350px]">
        <h2 className="text-lg font-bold mb-3">Catatan untuk {menu.name}</h2>
        <textarea
          className="w-full border p-2 rounded resize-none"
          rows="4"
          placeholder="Contoh: Tanpa telur, pedas"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        ></textarea>

        <div className="flex justify-end gap-2 mt-4">
          <button onClick={onClose} className="px-3 py-1 bg-gray-200 rounded text-sm">
            Batal
          </button>
          <button
            onClick={() => onConfirm(note)}
            className="px-3 py-1 bg-green-600 text-white rounded text-sm"
          >
            Tambah
          </button>
        </div>
      </div>
    </div>
  );
}
