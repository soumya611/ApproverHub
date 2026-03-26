import type { ChangeEvent } from "react";
import Button from "../button/Button";
import TextInput from "../text-input/TextInput";
import PopupModal from "../popup-modal/PopupModal";
import CloseButton from "../close-button/CloseButton";
import CopyLink from "../copy-link/CopyLink";

interface InviteEmailComponentProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  placeholder?: string;
  inviteLabel?: string;
  copyLabel?: string;
  value?: string;
  onChange?: (value: string) => void;
  onInvite?: () => void;
  onCopyLink?: () => void;
  className?: string;
}

export default function InviteEmailComponent({
  isOpen,
  onClose,
  title = "Share details",
  placeholder = "Emails, comma Separated",
  inviteLabel = "Invite",
  copyLabel = "Copy link",
  value,
  onChange,
  onInvite,
  onCopyLink,
  className = "",
}: InviteEmailComponentProps) {
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange?.(event.target.value);
  };

  return (
    <PopupModal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      showCloseButton={false}
      headerRight={
        <div className="flex items-center gap-3">
          <CopyLink label={copyLabel} onClick={onCopyLink} />
          <CloseButton onClick={onClose} />
        </div>
      }
      className={`!max-w-[720px] rounded-[10px] ${className}`}
      contentClassName="!p-0"
      headerClassName="px-6 py-4"
      titleClassName="!text-gray-900 !text-[16px] !font-semibold"
    >
      <div className="h-px w-full bg-gray-200" />
      <div className="flex flex-col gap-3 px-6 py-5 sm:flex-row sm:items-center">
        <TextInput
          placeholder={placeholder}
          {...(value !== undefined ? { value } : {})}
          onChange={handleChange}
          containerClassName="flex-1"
          inputClassName="!h-10 !rounded-lg !bg-[#F6F6F6] !text-[14px] !font-medium !text-gray-700 placeholder:!text-gray-400 placeholder:!font-semibold"
        />
        <Button
          size="md"
          variant="primary"
          onClick={onInvite}
          className="!rounded-lg !px-6 !py-2.5 text-sm"
        >
          {inviteLabel}
        </Button>
      </div>
    </PopupModal>
  );
}
