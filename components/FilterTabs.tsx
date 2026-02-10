export type FilterStatus = 'all' | 'active' | 'completed' | 'disputed' | 'cancelled';

interface FilterTabsProps {
  selected: FilterStatus;
  counts?: {
    all: number;
    active: number;
    completed: number;
    disputed: number;
    cancelled: number;
  };
  onChange: (status: FilterStatus) => void;
}

const tabs: { status: FilterStatus; label: string }[] = [
  { status: 'all', label: 'All' },
  { status: 'active', label: 'Active' },
  { status: 'completed', label: 'Completed' },
  { status: 'disputed', label: 'Disputed' },
  { status: 'cancelled', label: 'Cancelled' },
];

export default function FilterTabs({ selected, counts, onChange }: FilterTabsProps) {
  return (
    <div className="flex gap-4 border-b border-gray-200 overflow-x-auto scrollbar-hide">
      {tabs.map(({ status, label }) => {
        const isActive = selected === status;
        const count = counts?.[status];

        return (
          <button
            key={status}
            type="button"
            onClick={() => onChange(status)}
            className={`flex items-center shrink-0 pb-3 px-2 -mb-px text-sm transition-all duration-200 ${
              isActive
                ? 'text-primary-600 font-semibold border-b-2 border-primary-500'
                : 'text-gray-500 font-medium hover:text-primary-500'
            }`}
          >
            {label}
            {count !== undefined && (
              <span
                className={`ml-1 px-2 py-0.5 rounded-full text-xs ${
                  isActive
                    ? 'bg-primary-100 text-primary-600'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
