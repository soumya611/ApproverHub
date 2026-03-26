interface StatusBadgeProps {
  label: string;
  variant?: "danger" | "warning" | "success" | "info";
  className?: string;
}

export default function StatusBadge({
  label,
  variant = "danger",
  className = "",
}: StatusBadgeProps) {
  const styles = {
    danger: "text-red-600 bg-red-100 border-red-200",
    warning: "text-orange-600 bg-orange-100 border-orange-200",
    success: "text-green-600 bg-green-100 border-green-200",
    info: "text-blue-600 bg-blue-100 border-blue-200",
  };

  return (
    <span
      className={`inline-flex items-center text-xs font-medium px-2 py-0.5 
                  rounded border ${styles[variant]} ${className}`}
    >
      {label}
    </span>
  );
}
