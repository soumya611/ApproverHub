import type { HomeWelcomeInfo } from "../../types/home";

interface WelcomeSectionProps {
  welcome: HomeWelcomeInfo;
}

export default function WelcomeSection({ welcome }: WelcomeSectionProps) {
  return (
    <div className="text-left">
      <h1 className="text-2xl font-bold text-[#007B8C]">
        {welcome.title}
      </h1>
      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
        {welcome.subtitle}
      </p>
    </div>
  );
}
