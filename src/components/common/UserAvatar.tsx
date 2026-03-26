import { getStoredUserIdentity } from "../../utils/userIdentity";

interface UserAvatarProps {
  size?: "small" | "medium" | "large";
  className?: string;
}

const sizeClasses = {
  small: "h-8 w-8 text-xs",
  medium: "h-10 w-10 text-sm",
  large: "h-20 w-20 text-lg",
};

export default function UserAvatar({ size = "medium", className = "" }: UserAvatarProps) {
  const userData = getStoredUserIdentity();
  const name = userData?.name || "User";

  // Get initials from name (first letter of first word and first letter of last word)
  const getInitials = (name: string): string => {
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) {
      return parts[0].charAt(0).toUpperCase();
    }
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };

  const initials = name ? getInitials(name) : "U";

  // Generate a color based on the user's name/email for consistent coloring
  const getAvatarColor = (str: string): string => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue = hash % 360;
    return `hsl(${hue}, 65%, 50%)`;
  };

  const bgColor = userData?.email 
    ? getAvatarColor(userData.email)
    : "hsl(200, 65%, 50%)";

  return (
    <div
      className={`${sizeClasses[size]} ${className} rounded-full flex items-center justify-center font-semibold text-white shadow-sm`}
      style={{ backgroundColor: bgColor }}
      title={name}
    >
      {initials}
    </div>
  );
}

