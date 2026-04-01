import React from "react";
import ToggleSwitch from "../toggle/ToggleSwitch";
import { AngleLeftIcon } from "../../../icons";

interface PageHeaderProps {
    title: string;
    description?: string;
    showToggle?: boolean;
    isEnabled?: boolean;
    onToggle?: (value: boolean) => void;
    toggleLabel?: string;
    className?: string;
    contentClassName?: string;
    titleRowClassName?: string;
    titleClassName?: string;
    descriptionClassName?: string;
    backButtonClassName?: string;
    toggleClassName?: string;
    showBackButton?: boolean;
    onBackClick?: () => void;
}

const PageHeader: React.FC<PageHeaderProps> = ({
    title,
    description,
    showToggle = false,
    isEnabled = true,
    onToggle,
    toggleLabel = "On/off",
    className = "",
    contentClassName = "",
    titleRowClassName = "",
    titleClassName = "",
    descriptionClassName = "",
    backButtonClassName = "",
    toggleClassName = "font-bold",
    showBackButton = true,
    onBackClick,
}) => {
    return (
        <div className={`flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 px-10 py-5 ${className}`}>

            <div className={`flex flex-col ${contentClassName}`}>

                {/* Row: Icon + Title */}
                <div className={`flex items-center gap-2 ${titleRowClassName}`}>
                    {showBackButton ? (
                        <button
                            type="button"
                            onClick={onBackClick}
                            className={`text-gray-600 ${backButtonClassName}`}
                            aria-label="Go back"
                        >
                            <AngleLeftIcon />
                        </button>
                    ) : null}

                    <h3 className={`text-lg font-semibold text-primary ${titleClassName}`}>
                        {title}
                    </h3>
                </div>

                {/* Description */}
                {description && (
                    <p className={`text-sm text-[#64748B] mt-1 ml-6 ${descriptionClassName}`}>
                        {description}
                    </p>
                )}

            </div>

            {/* Right (Your ToggleSwitch ✅) */}
            {showToggle && (
                <ToggleSwitch
                    checked={isEnabled}
                    onChange={(value) => onToggle?.(value)}
                    label={toggleLabel}
                    showLabel
                    size="sm"
                    className={toggleClassName}
                />
            )}
        </div>
    );
};

export default PageHeader;
