interface RadioProps {
  id: string; // Unique ID for the radio button
  name: string; // Group name for the radio button
  value: string; // Value of the radio button
  checked: boolean; // Whether the radio button is checked
  label: string; // Label text for the radio button
  onChange: (value: string) => void; // Handler for when the radio button is toggled
  className?: string; // Optional custom classes for styling
}

const RadioSm: React.FC<RadioProps> = ({
  id,
  name,
  value,
  checked,
  label,
  onChange,
  className = "",
}) => {
  return (
    <label
      htmlFor={id}
      className={`flex cursor-pointer select-none items-center text-xs text-gray-700 ${className}`}
    >
      <span className="relative">
        <input
          type="radio"
          id={id}
          name={name}
          value={value}
          checked={checked}
          onChange={() => onChange(value)}
          className="sr-only"
        />
        <span
          className={`mr-2 flex h-4 w-4 items-center justify-center rounded-full border ${
            checked ? "border-[#2E2E2E] bg-white" : "border-[#B9B9B9] bg-white"
          }`}
        >
          <span
            className={`h-2 w-2 rounded-full ${checked ? "bg-[#111111]" : "bg-transparent"}`}
          ></span>
        </span>
      </span>
      {label}
    </label>
  );
};

export default RadioSm;
