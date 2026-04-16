interface PassFailOptionProps {
  value: "pass" | "fail" | null;
  onChange: (value: "pass" | "fail") => void;
}

export default function PassFailOption({ value, onChange }: PassFailOptionProps) {
  return (
    <div className="pl-[55px]">
      <label className="inline-flex items-center gap-2 text-xs text-gray-600">
        <input type="radio" checked={value !== null} readOnly className="h-3.5 w-3.5" />
        <select
          value={value ?? ""}
          onChange={(event) => onChange(event.target.value as "pass" | "fail")}
          className="rounded-sm border border-gray-200 bg-white px-2 py-1 text-sm text-gray-600 outline-none focus:border-[#007B8C]"
        >
          <option value="" disabled>
            Pass/fail
          </option>
          <option value="pass">Pass</option>
          <option value="fail">Fail</option>
        </select>
      </label>
    </div>
  );
}

