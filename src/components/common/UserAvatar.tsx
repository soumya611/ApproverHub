import { useEffect, useMemo, useState } from "react";
import { getStoredUserIdentity } from "../../utils/userIdentity";

interface UserAvatarProps {
  size?: "small" | "medium" | "large";
  className?: string;
  name?: string;
  avatarUrl?: string;
}

const sizeClasses = {
  small: "h-8 w-8 text-xs",
  medium: "h-10 w-10 text-sm",
  large: "h-20 w-20 text-lg",
};

const getInitials = (label: string): string => {
  const parts = label.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase();
  }
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

const getAvatarColor = (seed: string): string => {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 65%, 50%)`;
};

export default function UserAvatar({
  size = "medium",
  className = "",
  name,
  avatarUrl,
}: UserAvatarProps) {
  const userData = getStoredUserIdentity();
  const resolvedName = name || userData?.name || "User";
  const resolvedAvatarUrl = avatarUrl || userData?.avatarUrl || "";
  const [hasImageError, setHasImageError] = useState(false);

  useEffect(() => {
    setHasImageError(false);
  }, [resolvedAvatarUrl]);

  const initials = useMemo(
    () => (resolvedName ? getInitials(resolvedName) : "U"),
    [resolvedName]
  );
  const bgColor = useMemo(
    () => getAvatarColor(userData?.email || resolvedName),
    [userData?.email, resolvedName]
  );
  const showFallback = !resolvedAvatarUrl || hasImageError;

  return (
    <div
      className={`${sizeClasses[size]} ${className} rounded-full flex items-center justify-center font-semibold text-white shadow-sm`}
      style={showFallback ? { backgroundColor: bgColor } : undefined}
      title={resolvedName}
    >
      {showFallback ? (
        initials
      ) : (
        <img
          src={resolvedAvatarUrl}
          alt={resolvedName}
          className="h-full w-full rounded-full object-cover"
          onError={() => setHasImageError(true)}
        />
      )}
    </div>
  );
}
