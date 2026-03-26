import { useEffect, useMemo, useState, type FC } from "react";

interface AvatarProps {
  src: string; // URL of the avatar image
  alt?: string; // Alt text for the avatar
  size?: "xsmall" | "small" | "medium" | "large" | "xlarge" | "xxlarge"; // Avatar size
  status?: "online" | "offline" | "busy" | "none"; // Status indicator
  fallbackType?: "initials" | "name"; // Fallback text style when no image
}

const sizeClasses = {
  xsmall: "h-6 w-6 max-w-6",
  small: "h-8 w-8 max-w-8",
  medium: "h-10 w-10 max-w-10",
  large: "h-12 w-12 max-w-12",
  xlarge: "h-14 w-14 max-w-14",
  xxlarge: "h-16 w-16 max-w-16",
};

const statusSizeClasses = {
  xsmall: "h-1.5 w-1.5 max-w-1.5",
  small: "h-2 w-2 max-w-2",
  medium: "h-2.5 w-2.5 max-w-2.5",
  large: "h-3 w-3 max-w-3",
  xlarge: "h-3.5 w-3.5 max-w-3.5",
  xxlarge: "h-4 w-4 max-w-4",
};

const statusColorClasses = {
  online: "bg-success-500",
  offline: "bg-error-400",
  busy: "bg-warning-500",
};

const textSizeClasses = {
  xsmall: "text-[9px]",
  small: "text-[10px]",
  medium: "text-xs",
  large: "text-sm",
  xlarge: "text-base",
  xxlarge: "text-lg",
};

const nameTextSizeClasses = {
  xsmall: "text-[6px]",
  small: "text-[7px]",
  medium: "text-[9px]",
  large: "text-[10px]",
  xlarge: "text-[11px]",
  xxlarge: "text-[12px]",
};

const getInitials = (label: string): string => {
  const trimmed = label.trim();
  if (!trimmed) {
    return "U";
  }
  if (!trimmed.includes(" ") && trimmed.length <= 2) {
    return trimmed.toUpperCase();
  }
  const parts = trimmed.split(/\s+/);
  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase();
  }
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

const getAvatarColor = (label: string): string => {
  let hash = 0;
  for (let i = 0; i < label.length; i++) {
    hash = label.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 55%, 55%)`;
};

const Avatar: FC<AvatarProps> = ({
  src,
  alt = "User Avatar",
  size = "medium",
  status = "none",
  fallbackType = "initials",
}) => {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);
  }, [src]);

  const initials = useMemo(() => getInitials(alt), [alt]);
  const bgColor = useMemo(() => getAvatarColor(alt), [alt]);
  const showFallback = !src || hasError;
  const fallbackText = fallbackType === "name" ? alt : initials;
  const fallbackTextClasses =
    fallbackType === "name"
      ? `${nameTextSizeClasses[size]} px-0.5 text-center leading-tight break-words whitespace-normal`
      : textSizeClasses[size];

  return (
    <div className={`relative  rounded-full ${sizeClasses[size]}`}>
      {/* Avatar Image */}
      {showFallback ? (
        <div
          className={`flex h-full w-full items-center justify-center rounded-full font-semibold text-white ${fallbackTextClasses}`}
          style={{ backgroundColor: bgColor }}
          aria-label={alt}
          title={alt}
        >
          {fallbackText}
        </div>
      ) : (
        <img
          src={src}
          alt={alt}
          className="h-full w-full object-cover rounded-full"
          onError={() => setHasError(true)}
        />
      )}

      {/* Status Indicator */}
      {status !== "none" && (
        <span
          className={`absolute bottom-0 right-0 rounded-full border-[1.5px] border-white dark:border-gray-900 ${
            statusSizeClasses[size]
          } ${statusColorClasses[status] || ""}`}
        ></span>
      )}
    </div>
  );
};

export default Avatar;
