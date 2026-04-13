import { AddIcon } from "../../icons";

interface AddButtonProps {
  onClick?: () => void;
  "aria-label"?: string;
}

export default function AddButton({ onClick, "aria-label": ariaLabel }: AddButtonProps) {
  return (
    <div
     className="group rounded-sm h-full min-h-[240px] w-full flex items-center justify-center transition-all duration-200  focus:outline-none"
    >
      <button
       type="button"
       onClick={onClick}
       aria-label={ariaLabel ?? "Add"}
       className="flex h-14 w-14 items-center justify-center rounded-sm bg-white text-gray-500 transition-all duration-200 shadow-[2px_4px_10px_0px_#0000000F]">
        <AddIcon className="text-black"/>
      </button>
    </div>
  );
}
