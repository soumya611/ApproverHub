export default function PassFailOption() {
  return (
    <div className="pl-[55px]">
      <label className="inline-flex items-center gap-2 text-xs text-gray-600">
        <input type="radio" checked readOnly className="h-3.5 w-3.5" />
        <span className="rounded-sm border border-gray-200 px-2 py-1 text-sm text-gray-600">
          Pass/fail
        </span>
      </label>
    </div>
  );
}

