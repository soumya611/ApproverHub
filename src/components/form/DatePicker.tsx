import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { CalenderIcon, ChevronLeftIcon } from "../../icons";

interface DeadlinePickerProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

function TopBar({
  selected,
  onTimeChange,
}: {
  selected: Date;
  onTimeChange: (val: string) => void;
}) {
  const formatDate = (date: Date) => {
    const yyyy = date.getFullYear();
    const mon = date.toLocaleDateString("en-US", { month: "short" });
    const dd = String(date.getDate()).padStart(2, "0");
    return `${yyyy}/${mon}/${dd}`;
  };

  return (
    <div className="flex items-center justify-between border border-gray-200 rounded-md px-3 py-2 mb-2">

      {/* Date */}
      <div className="flex items-center gap-2">
        <CalenderIcon className="h-4 w-4 text-gray-400" />
        <span className="text-sm text-gray-700">
          {formatDate(selected)}
        </span>
      </div>

      {/* Time */}
      <CustomTimeInput value="00:00" onChange={onTimeChange} />
    </div>
  );
}

// Custom header — the top bar showing "< June 2021 >"
function CustomHeader({
  date,
  decreaseMonth,
  increaseMonth,
}: {
  date: Date;
  decreaseMonth: () => void;
  increaseMonth: () => void;
}) {
  const monthYear = date.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="flex items-center justify-between px-3 py-2">
      <button
        type="button"
        onClick={decreaseMonth}
        className="text-[#007B8C] hover:opacity-70 font-bold text-lg"
      >
        <ChevronLeftIcon className=" w-5 h-5" />
      </button>
      <span className="text-[#007B8C] font-bold text-sm">{monthYear}</span>
      <button
        type="button"
        onClick={increaseMonth}
        className="text-[#007B8C] hover:opacity-70 font-bold text-lg"
      >
        <ChevronLeftIcon className=" w-5 h-5 rotate-180" />
      </button>
    </div>
  );
}

// Custom time input — the spinner style "12:00 AM ↕"
function CustomTimeInput({
  value,
  onChange,
}: {
  value?: string;
  onChange: (val: string) => void;
}) {
  const parseTime = (val: string) => {
    if (!val) return { hours: 0, minutes: 0 };
    const [h, m] = val.split(":").map(Number);
    return { hours: h ?? 0, minutes: m ?? 0 };
  };

  const formatDisplay = (val: string) => {
    if (!val) return "12:00 AM";
    const { hours, minutes } = parseTime(val);
    const ampm = hours >= 12 ? "PM" : "AM";
    const h = hours % 12 === 0 ? 12 : hours % 12;
    return `${String(h).padStart(2, "0")}:${String(minutes).padStart(2, "0")} ${ampm}`;
  };

  const stepMinutes = (direction: 1 | -1) => {
    const { hours, minutes } = parseTime(value ?? "00:00");
    let totalMinutes = hours * 60 + minutes + direction * 30;
    if (totalMinutes < 0) totalMinutes += 1440;
    if (totalMinutes >= 1440) totalMinutes -= 1440;
    const newH = Math.floor(totalMinutes / 60);
    const newM = totalMinutes % 60;
    onChange(`${String(newH).padStart(2, "0")}:${String(newM).padStart(2, "0")}`);
  };

  return (
    <div className="flex items-center gap-1 border-l border-gray-200 pl-3">
      <span className="text-sm text-gray-500 min-w-[72px]">
        {formatDisplay(value ?? "")}
      </span>
      <div className="flex flex-col">
        <button
          type="button"
          onClick={() => stepMinutes(1)}
          className="text-gray-400 hover:text-[#007B8C] leading-none text-xs"
        >
          ▲
        </button>
        <button
          type="button"
          onClick={() => stepMinutes(-1)}
          className="text-gray-400 hover:text-[#007B8C] leading-none text-xs"
        >
          ▼
        </button>
      </div>
    </div>
  );
}

export default function DeadlinePicker({
  value,
  onChange,
  placeholder = "No Deadline",
  className = "",
  disabled = false,
}: DeadlinePickerProps) {
  const selected = value ? new Date(value) : null;

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <CalenderIcon className="h-4 w-4 shrink-0 text-[#666666]" />
      <DatePicker
        selected={selected}
        onChange={(date: Date | null) =>
          onChange(date ? date.toISOString() : "")
        }

        popperPlacement="top-start"

        renderCustomHeader={(props) => <CustomHeader {...props} />}

        formatWeekDay={(nameOfDay) =>
          nameOfDay.substring(0, 3).toUpperCase()
        }

        calendarClassName="workflow-datepicker"
        calendarContainer={({ className, children }) => (
          <div className={className}>
            <div >
              <TopBar
                selected={selected || new Date()}
                onTimeChange={(time: string) => {
                  const base = selected || new Date();
                  const [h, m] = time.split(":").map(Number);
                  base.setHours(h, m);
                  onChange(base.toISOString());
                }}
              />
            </div>

            {/*keep original calendar */}
            {children}
          </div>
        )}

        placeholderText={placeholder}
        disabled={disabled}
        dateFormat="yyyy/MMM/dd"
        calendarStartDay={0}

        className="h-8 w-full bg-transparent text-[15px] text-[#666666]
    font-medium placeholder:text-gray-400
    focus:outline-none cursor-pointer border-none"
      />
    </div>
  );
}
