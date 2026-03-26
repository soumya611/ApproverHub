import { useMemo, useState } from "react";
import PopupModal from "../popup-modal/PopupModal";
import DescriptionText from "../description-text/DescriptionText";
import Select from "../../form/Select";
import Checkbox from "../../form/input/Checkbox";
import Button from "../button/Button";
import TextInput from "../text-input/TextInput";
import TextArea from "../../form/input/TextArea";
import AvatarCheckbox from "../avatar-checkbox/AvatarCheckbox";
import { ChevronDownIcon } from "../../../icons";

interface EmailReviewersPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function EmailReviewersPopup({
  isOpen,
  onClose,
}: EmailReviewersPopupProps) {
  const reviewerOptions = useMemo(
    () => [
      { value: "all", label: "All Reviewers" },
      { value: "approvers", label: "Approvers" },
      { value: "design", label: "Design Team" },
    ],
    []
  );

  const stageOptions = useMemo(
    () => [
      { value: "s1", label: "Stage 1" },
      { value: "s2", label: "Stage 2" },
      { value: "s3", label: "Stage 3" },
    ],
    []
  );

  const reviewers = useMemo(
    () => [
      {
        id: "r1",
        name: "Krutika Govankar",
        avatarUrl: "data:image/jpeg;base64,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",
      },
      {
        id: "r2",
        name: "Priya Singh",
        avatarUrl: "/uploads/avatar-2.jpg",
      },
      {
        id: "r3",
        name: "James Carter",
        avatarUrl: "/uploads/avatar-3.jpg",
      },
      {
        id: "r4",
        name: "",
        badgeText: "S1",
      },
    ],
    []
  );

  const [reviewerGroup, setReviewerGroup] = useState("");
  const [stage, setStage] = useState("");
  const [selectedReviewerIds, setSelectedReviewerIds] = useState<string[]>([]);
  const [composeEmail, setComposeEmail] = useState(false);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");

  const allSelected = selectedReviewerIds.length === reviewers.length;

  const toggleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedReviewerIds(reviewers.map((reviewer) => reviewer.id));
      return;
    }

    setSelectedReviewerIds([]);
  };

  const toggleReviewer = (id: string, checked: boolean) => {
    setSelectedReviewerIds((prev) => {
      if (checked) {
        return [...prev, id];
      }

      return prev.filter((item) => item !== id);
    });
  };

  return (
    <PopupModal
      isOpen={isOpen}
      onClose={onClose}
      title="Email Reviewers"
      className="!w-[70%] !max-w-[420px] rounded-xl"
      contentClassName="!p-4 overflow-hidden"
      titleClassName="!text-[15px] font-semibold text-[#007B8C]"
      
    >
      <DescriptionText
        label={null}
        text="Send alerts or emails to reviewers"
        className="text-[13px] text-gray-500"
      />

      <div className="mt-2 space-y-1.5 max-h-[calc(70vh)] overflow-y-auto no-scrollbar pr-1">
        <div className="space-y-1">
          <p className="text-[14px] font-semibold text-gray-700">All Reviewers</p>
          <div className="relative">
            <Select
              options={reviewerOptions}
              placeholder="Select Reviewer"
              onChange={setReviewerGroup}
              defaultValue={reviewerGroup}
              className="!h-9 !px-3 !pr-9 !bg-[#F3F3F3] !text-[12px] !font-normal"
            />
            <ChevronDownIcon className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-primary-500)]" />
          </div>
        </div>

        <div className="space-y-1">
          <p className="text-[14px] font-semibold text-gray-700">Stage</p>
          <div className="relative">
            <Select
              options={stageOptions}
              placeholder="Select Stage"
              onChange={setStage}
              defaultValue={stage}
              className="!h-9 !px-3 !pr-9 !bg-[#F3F3F3] !text-[12px] !font-normal"
            />
            <ChevronDownIcon className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-primary-500)]" />
          </div>
        </div>

        <div className="space-y-1">
          <div className="rounded-lg border border-gray-200 bg-[#F3F3F3]">
            <div className="px-3 py-1.5">
              <p className="text-[14px] font-semibold text-gray-700">Result</p>
            </div>
            <div className="bg-[#EDEDED] px-3 py-1.5">
              <Checkbox
                checked={allSelected}
                onChange={toggleSelectAll}
                label="Select All"
                labelClassName="text-[12px] font-semibold text-gray-600"
                className="!h-4 !w-4"
              />
            </div>
            <div className="divide-y divide-gray-200">
              {reviewers.map((reviewer) => (
                <div key={reviewer.id} className=" px-3 py-1.5">
                  <AvatarCheckbox
                    name={reviewer.name}
                    avatarUrl={reviewer.avatarUrl}
                    badgeText={reviewer.badgeText}
                    checked={selectedReviewerIds.includes(reviewer.id)}
                    onChange={(checked) => toggleReviewer(reviewer.id, checked)}
                    nameClassName="text-[12px] font-semibold"
                    showName={!reviewer.badgeText}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        <Checkbox
          checked={composeEmail}
          onChange={setComposeEmail}
          label="Compose Email to selected reviewers"
          labelClassName="text-[12px] font-semibold text-gray-700"
          className="!h-4 !w-4"
        />

        {composeEmail ? (
          <>
            <TextInput
              label="Subject"
              placeholder="Enter email subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              inputClassName="!bg-[#F3F3F3] !text-[12px] !h-9 !px-3 placeholder:text-gray-400 placeholder:font-semibold"
              labelClassName="text-[14px] font-semibold text-gray-700"
            />

            <div className="space-y-1">
              <p className="text-[14px] font-semibold text-gray-700">Body</p>
              <TextArea
                placeholder="Write your message"
                rows={4}
                value={body}
                onChange={setBody}
                className="!bg-[#F3F3F3] !text-[12px] !px-3 !py-2 placeholder:text-gray-400 placeholder:font-semibold"
              />
            </div>
          </>
        ) : null}
      </div>

      <div className="mt-3 flex items-center justify-end gap-2">
        <Button size="sm" variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button size="sm" variant="primary" className="!rounded-[7px]">
          Send
        </Button>
      </div>
    </PopupModal>
  );
}
