// import GridShape from "@/components/common/GridShape";
// import { Link } from "react-router";
// import ThemeTogglerTwo from "@/components/common/ThemeTogglerTwo";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen w-full bg-white dark:bg-gray-900">
      <div className="flex min-h-screen w-full items-center justify-center p-6">
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  );
}