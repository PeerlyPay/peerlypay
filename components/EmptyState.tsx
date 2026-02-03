import { ReactNode } from 'react';

export interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  actionText?: string;
  onAction?: () => void;
}

export default function EmptyState({
  icon,
  title,
  actionText,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl py-12 px-6 flex flex-col items-center gap-4">
      {icon}
      <p className="text-gray-500 text-base font-medium text-center">{title}</p>
      {actionText != null && onAction != null && (
        <button
          type="button"
          onClick={onAction}
          className="text-magenta-500 text-sm font-semibold cursor-pointer hover:underline focus:outline-none focus:underline"
        >
          {actionText}
        </button>
      )}
    </div>
  );
}
