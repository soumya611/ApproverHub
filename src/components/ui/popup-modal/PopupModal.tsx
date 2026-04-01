import type { ReactNode } from "react";
import { Modal } from "../modal";
import PopupTitle from "../popup-title/PopupTitle";
import CloseButton from "../close-button/CloseButton";

interface PopupModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: ReactNode;
  children: ReactNode;
  showCloseButton?: boolean;
  headerRight?: ReactNode;
  className?: string;
  contentClassName?: string;
  headerClassName?: string;
  titleClassName?: string;
  closeButtonClassName?: string;
  closeIconClassName?: string;
  overlayClassName?: string;
}

export default function PopupModal({
  isOpen,
  onClose,
  title,
  children,
  showCloseButton = true,
  headerRight,
  className = "",
  contentClassName = "",
  headerClassName = "",
  titleClassName = "",
  closeButtonClassName = "",
  closeIconClassName = "",
  overlayClassName = "bg-black/20",
}: PopupModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      showCloseButton={false}
      overlayClassName={overlayClassName}
      className={`max-w-[720px] w-full mx-4 rounded-2xl shadow-lg ${className}`}
    >
      <div className={`p-6  ${contentClassName}`}>
        {(title || showCloseButton || headerRight) && (
          <div className={`flex items-center justify-between ${headerClassName}`}>
            {title ? <PopupTitle  className={titleClassName}>{title}</PopupTitle> : <span />}
            <div className="flex items-center gap-2">
              {headerRight}
              {showCloseButton && (
                <CloseButton
                  onClick={onClose}
                  className={closeButtonClassName}
                  iconClassName={closeIconClassName}
                />
              )}
            </div>
          </div>
        )}
        <div className={title || showCloseButton || headerRight ? "mt-2" : ""}>
          {children}
        </div>
      </div>
    </Modal>
  );
}
