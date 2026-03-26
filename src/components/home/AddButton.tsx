interface AddButtonProps {
  onClick?: () => void;
  "aria-label"?: string;
}

export default function AddButton({ onClick, "aria-label": ariaLabel }: AddButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel ?? "Add"}
      className="group rounded-xl border border-gray-100 h-full min-h-[240px] w-full flex items-center justify-center transition-all duration-200 bg-transparent focus:outline-none"
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-lg border border-gray-300 bg-white text-gray-500 transition-all duration-200">
        <span className="text-2xl font-light leading-none">+</span>
      </div>
    </button>
  );
}
