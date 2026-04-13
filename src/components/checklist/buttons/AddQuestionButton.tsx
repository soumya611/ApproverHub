interface AddQuestionButtonProps {
  onClick: () => void;
}

export default function AddQuestionButton({ onClick }: AddQuestionButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="text-sm font-semibold text-[var(--color-secondary-500)]"
    >
      + Add Question
    </button>
  );
}

