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
}

const PageHeader: React.FC<PageHeaderProps> = ({
    title,
    description,
    showToggle = false,
    isEnabled = true,
    onToggle,
    toggleLabel = "On/off",
}) => {
    return (
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 px-10 py-5">

            <div className="flex flex-col">

                {/* Row: Icon + Title */}
                <div className="flex items-center gap-2">
                    <button className="text-gray-600">
                        <AngleLeftIcon />
                    </button>

                    <h3 className="text-lg font-semibold text-primary">
                        {title}
                    </h3>
                </div>

                {/* Description */}
                {description && (
                    <p className="text-sm text-[#64748B] mt-1 ml-6">
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
                    className="font-bold"
                />
            )}
        </div>
    );
};

export default PageHeader;