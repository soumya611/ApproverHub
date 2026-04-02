import { useState } from "react";
import AnalyticsNoteItem from "../analytics/AnalyticsNoteItem";
import { Dropdown } from "../ui/dropdown/Dropdown";

interface MentionItem {
  id: string;
  userName: string;
  message: string;
  description: string;
  date: string;
  avatarUrl?: string;
}

const FILTER_OPTIONS = ["Latest updates", "7 days ago", "month ago"];

const MOCK_MENTIONS: MentionItem[] = [
  { id: "1", userName: "James", message: "answered to your comment on the Summer allergies campaign job", description: "", date: "Jul 31", avatarUrl: "https://randomuser.me/api/portraits/men/32.jpg" },
  { id: "2", userName: "James", message: "answered to your comment on the Summer allergies campaign job", description: "", date: "Jul 31", avatarUrl: "https://randomuser.me/api/portraits/men/32.jpg" },
  { id: "3", userName: "James", message: "answered to your comment on the Summer allergies campaign job", description: "", date: "Jul 31", avatarUrl: "https://randomuser.me/api/portraits/men/32.jpg" },
  { id: "4", userName: "James", message: "answered to your comment on the Summer allergies campaign job", description: "", date: "Jul 31", avatarUrl: "https://randomuser.me/api/portraits/men/32.jpg" },
  { id: "5", userName: "James", message: "answered to your comment on the Summer allergies campaign job", description: "", date: "Jul 31", avatarUrl: "https://randomuser.me/api/portraits/men/32.jpg" },
];

export default function MentionedCard() {
  const [selectedFilter, setSelectedFilter] = useState("Latest updates");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  return (
    <div className="flex flex-col rounded-xl border border-gray-200 bg-white overflow-hidden min-h-[320px]">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-gray-500 text-sm">@</span>
          <span className="text-sm font-medium text-gray-700">Mentioned you</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Filter dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsDropdownOpen((v) => !v)}
              className="dropdown-toggle flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 transition"
            >
              {selectedFilter}
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            <Dropdown
              isOpen={isDropdownOpen}
              onClose={() => setIsDropdownOpen(false)}
              className="mt-1 min-w-[140px] py-1"
            >
              {FILTER_OPTIONS.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => {
                    setSelectedFilter(option);
                    setIsDropdownOpen(false);
                  }}
                  className={`w-full px-4 py-2 text-left text-sm transition hover:bg-gray-50 ${
                    selectedFilter === option ? "font-semibold text-[#007B8C]" : "text-gray-700"
                  }`}
                >
                  {option}
                </button>
              ))}
            </Dropdown>
          </div>

          <button
            type="button"
            className="rounded-md border bg-[#FFEAE6] border-[#E74C3C] px-3 py-1 text-xs font-semibold text-[#E74C3C] hover:bg-[#E74C3C]/5 transition"
          >
            Clear all
          </button>
        </div>
      </div>

      {/* Mention list */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {MOCK_MENTIONS.map((mention) => (
          <AnalyticsNoteItem
            key={mention.id}
            variant="mention"
            userName={mention.userName}
            message={mention.message}
            description={mention.description}
            date={mention.date}
            avatarUrl={mention.avatarUrl}
          />
        ))}
      </div>
    </div>
  );
}