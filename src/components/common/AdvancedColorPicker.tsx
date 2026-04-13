import { HexColorPicker } from "react-colorful";
import { useState } from "react";

export default function AdvancedColorPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (color: string) => void;
}) {
  const [color, setColor] = useState(value || "#E89623");

  const handleChange = (c: string) => {
    setColor(c);
    onChange(c);
  };

  return (
    <div className="p-4 bg-white rounded-xl shadow-lg w-[280px]">

      {/* Main color area */}
      <HexColorPicker color={color} onChange={handleChange} />

      {/* HEX */}
      <div className="mt-3">
        <input
          value={color}
          onChange={(e) => handleChange(e.target.value)}
          className="w-full border rounded px-2 py-1 text-sm"
        />
      </div>
    </div>
  );
}