type TabItem<T extends string> = {
  id: T;
  label: string;
};

interface UnderlineTabsProps<T extends string> {
  tabs: TabItem<T>[];
  activeTab: T;
  onChange: (tabId: T) => void;
  className?: string;
  tabClassName?: string;
  activeClassName?: string;
  inactiveClassName?: string;
}

export default function UnderlineTabs<T extends string>({
  tabs,
  activeTab,
  onChange,
  className = "flex flex-wrap items-end gap-6",
  tabClassName = "-mb-px border-b-3 px-1 pb-3 pt-3 text-sm transition",
  activeClassName = "border-[#007B8C] font-bold text-primary",
  inactiveClassName = "border-transparent font-medium text-gray-400 hover:text-gray-700",
}: UnderlineTabsProps<T>) {
  return (
    <div className={className}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onChange(tab.id)}
          className={`${tabClassName} ${
            activeTab === tab.id ? activeClassName : inactiveClassName
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

