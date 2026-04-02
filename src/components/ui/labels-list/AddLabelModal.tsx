import { useState } from "react";
import PopupModal from "../popup-modal/PopupModal";

const COLOR_OPTIONS = [
  "#22C55E", "#3B82F6", "#EC4899", "#EAB308",
  "#F97316", "#8B5CF6", "#14B8A6", "#EF4444",
];

interface AddLabelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (name: string, color: string) => void;
}

export default function AddLabelModal({ isOpen, onClose, onAdd }: AddLabelModalProps) {
  const [labelName, setLabelName]             = useState("");
  const [selectedColor, setSelectedColor]     = useState(COLOR_OPTIONS[0]);
  const [showColorPicker, setShowColorPicker] = useState(false);

  const handleAdd = () => {
    if (!labelName.trim()) return;
    onAdd(labelName.trim(), selectedColor);
    handleClose();
  };

  const handleClose = () => {
    setLabelName("");
    setSelectedColor(COLOR_OPTIONS[0]);
    setShowColorPicker(false);
    onClose();
  };

  return (
    <PopupModal
      isOpen={isOpen}
      onClose={handleClose}
      title="Add new custom label"
      className="!max-w-[480px] rounded-md border-[#A3A3A3]"
      titleClassName="!text-gray-800 !text-base !font-semibold"
      overlayClassName="bg-black/20"
    >
      <div className="mt-5 space-y-5">
        {/* Color picker + label name input row */}
        <div className="flex items-center gap-3">

          {/* Color dot + chevron button */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowColorPicker((v) => !v)}
              className="flex items-center gap-2 rounded-md border border-[#D4D4D4] bg-white px-3 py-2.5 hover:bg-gray-50 transition"
              aria-label="Pick color"
            >
              <span
                className="inline-block h-6 w-6 rounded-full shrink-0"
                style={{ backgroundColor: selectedColor }}
              />
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="text-gray-400">
                <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            {showColorPicker && (
              <div className="absolute left-0 top-12 z-10 flex flex-wrap gap-2 rounded-xl border border-gray-200 bg-white p-3 shadow-lg w-44">
                {COLOR_OPTIONS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => { setSelectedColor(c); setShowColorPicker(false); }}
                    className="h-7 w-7 rounded-full border-2 transition hover:scale-110"
                    style={{
                      backgroundColor: c,
                      borderColor: selectedColor === c ? "#007B8C" : "transparent",
                    }}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Label name input */}
          <input
            autoFocus
            type="text"
            value={labelName}
            onChange={(e) => setLabelName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleAdd();
              if (e.key === "Escape") handleClose();
            }}
            placeholder="Enter label name..."
            className="flex-1 rounded-md border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-[#3D3D3D] placeholder:text-gray-400 outline-none focus:border-[#007B8C] focus:bg-white focus:ring-1 focus:ring-[#007B8C]/20 transition"
          />
        </div>

        {/* Add button — right-aligned */}
        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleAdd}
            disabled={!labelName.trim()}
            className="rounded-md bg-[#F15F44] px-8 py-1.5 text-sm font-semibold text-white hover:bg-[#c0392b] disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            Add
          </button>
        </div>
      </div>
    </PopupModal>
  );
}