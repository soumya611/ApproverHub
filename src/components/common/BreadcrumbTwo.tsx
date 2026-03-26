type BreadcrumbItem = {
  label: string;
  href?: string;
};

interface BreadcrumbTwoProps {
  items: BreadcrumbItem[];
}

export default function BreadcrumbTwo({ items }: BreadcrumbTwoProps) {
  return (
    <div className="w-full bg-[#F3F3F3] px-6 py-3">
      <nav className="text-sm text-[#6B7280]">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <span key={index}>
              {item.href && !isLast ? (
                <a
                  href={item.href}
                  className="hover:text-gray-900"
                >
                  {item.label}
                </a>
              ) : (
                <span
                  className={isLast ? "text-[var(--color-primary-500)] font-medium" : ""}
                >
                  {item.label}
                </span>
              )}

              {!isLast && <span className="mx-1">/</span>}
            </span>
          );
        })}
      </nav>
    </div>
  );
}
