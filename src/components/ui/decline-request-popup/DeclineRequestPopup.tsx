import PopupModal from "../popup-modal/PopupModal";
import PopupTitle from "../popup-title/PopupTitle";
import CloseButton from "../close-button/CloseButton";
import Button from "../button/Button";

interface DeclineRequestPopupProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm?: () => void;
  closeOnConfirm?: boolean;
  showButtons?: boolean;
  modalClassName?: string;
  contentClassName?: string;
  titleClassName?: string;
  closeButtonClassName?: string;
  closeIconClassName?: string;
  confirmButtonClassName?: string;
  cancelButtonClassName?: string;
  overlayClassName?: string;
}

export default function DeclineRequestPopup({
  isOpen,
  onClose,
  title = "Are you sure you want to decline request",
  confirmLabel = "Sure",
  cancelLabel = "Back",
  onConfirm,
  closeOnConfirm = true,
  showButtons = true,
  modalClassName = "",
  contentClassName = "",
  titleClassName = "",
  closeButtonClassName = "",
  closeIconClassName = "",
  confirmButtonClassName = "",
  cancelButtonClassName = "",
  overlayClassName = "bg-black/20",
}: DeclineRequestPopupProps) {
  const handleConfirm = () => {
    onConfirm?.();
    if (closeOnConfirm) {
      onClose();
    }
  };

  const contentWrapperClassName = showButtons
    ? "flex min-h-[210px] flex-col items-center justify-center gap-6 text-center"
    : "flex min-h-[210px] flex-col items-center justify-center text-center";

  return (
    <PopupModal
      isOpen={isOpen}
      onClose={onClose}
      showCloseButton={false}
      className={`!max-w-[562px] rounded-[12px] ${modalClassName}`}
      contentClassName={`!px-6 !py-6 sm:!px-8 sm:!py-7 ${contentClassName}`}
      overlayClassName={overlayClassName}
    >
      <div className="relative">
        <CloseButton
          onClick={onClose}
          className={`absolute right-0 top-0 ${closeButtonClassName}`}
          iconClassName={closeIconClassName}
        />
        <div className={contentWrapperClassName}>
          <PopupTitle
            colorClassName="text-gray-800"
            sizeClassName="text-[16px] sm:text-[17px]"
            weightClassName="font-medium"
            alignClassName="text-center"
            className={titleClassName}
          >
            {title}
          </PopupTitle>
          {showButtons ? (
            <div className="flex items-center justify-center gap-14">
              <Button
                size="sm"
                variant="primary"
                onClick={handleConfirm}
                className={`!rounded-[5px] !px-6 !py-2 text-[15px] ${confirmButtonClassName}`}
              >
                {confirmLabel}
              </Button>
              <Button
                size="sm"
                variant="orangebutton"
                onClick={onClose}
                className={`!rounded-[5px] !px-6 !py-2 !text-[15px] ${cancelButtonClassName}`}
              >
                {cancelLabel}
              </Button>
            </div>
          ) : null}
        </div>
      </div>
    </PopupModal>
  );
}
