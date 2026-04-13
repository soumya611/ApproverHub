interface AddSectionButtonProps {
  onClick: () => void;
}

export default function AddSectionButton({ onClick }: AddSectionButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center rounded-md border border-gray-200 bg-gray-50 px-3 py-2.5 text-base text-gray-500 hover:bg-gray-100"
    >
      + Add Section
    </button>
  );
}

